import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_SEC = 5 * 60;
const secret = () => process.env.AUTH_SECRET!;

const sign = (data: string) =>
  createHmac("sha256", secret()).update(data).digest("hex").slice(0, 32);

export function createTonPayload() {
  const nonce = randomBytes(16).toString("hex");
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const data = `${nonce}.${exp}`;
  return `${data}.${sign(data)}`; // ~76 байт
}

export function verifyTonPayload(payload: string) {
  const [nonce, exp, sig] = payload.split(".");
  if (!nonce || !exp || !sig) return false;
  const expected = sign(`${nonce}.${exp}`);
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(exp) > Math.floor(Date.now() / 1000);
}