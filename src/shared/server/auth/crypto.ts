import { signVerify, keyPairFromSecretKey, mnemonicToPrivateKey } from "@ton/crypto"
import { Address } from "@ton/core"

interface TonProof {
  timestamp: number
  domain: {
    lengthBytes: number
    value: string
  }
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

    if (publicKeyBuffer.length !== 32) {
      console.error(`Неверная длина публичного ключа: ${publicKeyBuffer.length}`)
      return false
    }

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - proof.timestamp) > 300) {
      console.error(`Proof слишком старый: ${proof.timestamp}`)
      return false
    }

    const TON_PROOF_PREFIX = "ton-proof-item-v2/"
    const prefixBuffer = Buffer.from(TON_PROOF_PREFIX, "utf-8")

    const addressBuffer = Buffer.alloc(36)
    addressBuffer.writeInt32BE(addr.workChain, 0)
    addr.hash.copy(addressBuffer, 4, 0, 32)

    const domainLength = Buffer.alloc(4)
    domainLength.writeUInt32LE(proof.domain.lengthBytes, 0)
    
    const domainValue = Buffer.alloc(32, 0)
    Buffer.from(proof.domain.value, "utf-8").copy(domainValue, 0, 0, 32)

    const timestampBuffer = Buffer.alloc(8)
    timestampBuffer.writeBigUInt64LE(BigInt(proof.timestamp), 0)

    const payloadLength = Buffer.alloc(4)
    payloadLength.writeUInt32LE(proof.payload.length, 0)
    const payloadValue = Buffer.from(proof.payload, "utf-8")

    const message = Buffer.concat([
      prefixBuffer,
      addressBuffer,
      domainLength,
      domainValue,
      timestampBuffer,
      payloadLength,
      payloadValue,
    ])

    const { sha256 } = await import("@ton/crypto")
    const messageHash = await sha256(message)
    
    const TON_CONNECT_PREFIX = "ton-connect"
    const tonConnectBuffer = Buffer.from(TON_CONNECT_PREFIX, "utf-8")
    const prefixWithHash = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      tonConnectBuffer,
      messageHash,
    ])
    
    const finalHash = await sha256(prefixWithHash)

    const signatureBuffer = Buffer.from(proof.signature, "base64")
    const isValid = signVerify(finalHash, signatureBuffer, publicKeyBuffer)

    if (!isValid) {
      console.error("Верификация ton-proof не пройдена")
    }

    return isValid
  } catch (error) {
    console.error("Ошибка при верификации ton-proof:", error)
    return false
  }
}