import { signVerify, sha256 } from "@ton/crypto"
import { Address } from "@ton/core"

interface TonProof {
  timestamp: number
  domain: { lengthBytes: number; value: string }
  payload: string
  signature: string
}

export async function verifyTonProof(
  address: string,
  publicKey: string,
  proofJson: string
): Promise<boolean> {
  try {
    const proof: TonProof = JSON.parse(proofJson)
    const addr = Address.parse(address)
    
    const cleanPublicKey = publicKey.replace(/^0x/, "")
    const publicKeyBuffer = Buffer.from(cleanPublicKey, "hex")

    if (publicKeyBuffer.length !== 32) return false

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - proof.timestamp) > 300) return false

    const prefix = Buffer.from("ton-proof-item-v2/")

    const addrBuffer = Buffer.alloc(36)
    addrBuffer.writeInt32BE(addr.workChain, 0)
    addr.hash.copy(addrBuffer, 4)

    const domainBuf = Buffer.from(proof.domain.value, "utf-8")
    const domainLen = Buffer.alloc(4)
    domainLen.writeUInt32LE(domainBuf.length, 0)
    const appDomain = Buffer.concat([domainLen, domainBuf])

    const tsBuf = Buffer.alloc(8)
    tsBuf.writeBigUInt64LE(BigInt(proof.timestamp), 0)

    const payloadBuf = Buffer.from(proof.payload, "utf-8")
    const payloadLen = Buffer.alloc(4)
    payloadLen.writeUInt32LE(payloadBuf.length, 0)
    const payload = Buffer.concat([payloadLen, payloadBuf])

    const message = Buffer.concat([prefix, addrBuffer, appDomain, tsBuf, payload])

    const messageHash = await sha256(message)
    const prefixWithHash = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from("ton-connect", "utf-8"),
      messageHash,
    ])
    const finalHash = await sha256(prefixWithHash)

    const signatureBuffer = Buffer.from(proof.signature, "base64")
    return signVerify(finalHash, signatureBuffer, publicKeyBuffer)
    
  } catch (e) {
    console.error("TON verify error:", e)
    return false
  }
}