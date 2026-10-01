import "server-only";
import { Address, Cell, contractAddress, loadStateInit } from "@ton/core";
import { sha256 } from "@ton/crypto";
import nacl from "tweetnacl";
import { z } from "zod";
import { verifyTonPayload } from "./payload";

export const tonProofSchema = z.object({
  address: z.string(),
  publicKey: z.string(),
  stateInit: z.string(),
  proof: z.string(),
});

const proofInner = z.object({
  timestamp: z.number(),
  domain: z.object({ lengthBytes: z.number(), value: z.string() }),
  payload: z.string(),
  signature: z.string(),
});

const ALLOWED_DOMAINS = (process.env.TON_PROOF_DOMAINS ?? "localhost:3000")
  .split(",")
  .map((d) => d.trim());
const MAX_AGE_SEC = 5 * 60;

type StateInit = ReturnType<typeof loadStateInit>;

function candidatePublicKeys(stateInit: StateInit): Buffer[] {
  const keys: Buffer[] = [];
  for (const offset of [64, 65]) {
    try {
      const s = stateInit.data!.beginParse();
      s.skip(offset);
      keys.push(s.loadBuffer(32));
    } catch {}
  }
  return keys;
}

function fail(reason: string): null {
  console.error("[ton-proof] rejected:", reason);
  return null;
}

export async function verifyTonProof(input: unknown): Promise<string | null> {
  try {
    const parsed = tonProofSchema.parse(input);
    const proof = proofInner.parse(JSON.parse(parsed.proof));

    if (!verifyTonPayload(proof.payload)) {
      return fail("payload invalid or expired");
    }

    if (!ALLOWED_DOMAINS.includes(proof.domain.value)) {
      return fail(
        `domain mismatch: got "${proof.domain.value}", allowed [${ALLOWED_DOMAINS.join(", ")}]`,
      );
    }

    if (proof.domain.lengthBytes !== Buffer.byteLength(proof.domain.value)) {
      return fail("domain lengthBytes mismatch");
    }

    if (Math.floor(Date.now() / 1000) - proof.timestamp > MAX_AGE_SEC) {
      return fail("proof too old");
    }

    const stateInit = loadStateInit(Cell.fromBase64(parsed.stateInit).beginParse());
    const claimed = Address.parse(parsed.address);

    if (!contractAddress(claimed.workChain, stateInit).equals(claimed)) {
      return fail("stateInit does not match address");
    }

    const wanted = Buffer.from(parsed.publicKey, "hex");
    const publicKey = candidatePublicKeys(stateInit).find((k) => k.equals(wanted));
    if (!publicKey) {
      return fail("public key not found in stateInit (unknown wallet version?)");
    }

    const wc = Buffer.alloc(4);
    wc.writeInt32BE(claimed.workChain, 0);
    const ts = Buffer.alloc(8);
    ts.writeBigUInt64LE(BigInt(proof.timestamp), 0);
    const dl = Buffer.alloc(4);
    dl.writeUInt32LE(proof.domain.lengthBytes, 0);

    const msg = Buffer.concat([
      Buffer.from("ton-proof-item-v2/"),
      wc,
      claimed.hash,
      dl,
      Buffer.from(proof.domain.value),
      ts,
      Buffer.from(proof.payload),
    ]);
    const full = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from("ton-connect"),
      Buffer.from(await sha256(msg)),
    ]);
    const hash = Buffer.from(await sha256(full));

    const ok = nacl.sign.detached.verify(
      hash,
      Buffer.from(proof.signature, "base64"),
      publicKey,
    );
    if (!ok) return fail("bad signature");

    return claimed.toRawString().toLowerCase();
  } catch (e) {
    return fail(`exception: ${e instanceof Error ? e.message : String(e)}`);
  }
}