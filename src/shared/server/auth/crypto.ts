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
    // 1. Парсим proof
    const proof: TonProof = JSON.parse(proofJson)
    
    // 2. Валидация адреса
    const addr = Address.parse(address)
    
    // 3. Очистка публичного ключа
    const cleanPublicKey = publicKey.replace(/^0x/, "")
    const publicKeyBuffer = Buffer.from(cleanPublicKey, "hex")

    if (publicKeyBuffer.length !== 32) {
      console.error(`Неверная длина публичного ключа: ${publicKeyBuffer.length}`)
      return false
    }

    // 4. Проверяем timestamp (не старше 5 минут)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - proof.timestamp) > 300) {
      console.error(`Proof слишком старый: ${proof.timestamp}`)
      return false
    }

    const TON_PROOF_PREFIX = "ton-proof-item-v2/"
    const prefixBuffer = Buffer.from(TON_PROOF_PREFIX, "utf-8")

    // Address: 4 байта workchain (big-endian int32) + 32 байта hash
    const addressBuffer = Buffer.alloc(36)
    addressBuffer.writeInt32BE(addr.workChain, 0)
    addr.hash.copy(addressBuffer, 4, 0, 32)

    // AppDomain: 4 байта length (little-endian) + domain value (padded to 32 bytes)
    const domainLength = Buffer.alloc(4)
    domainLength.writeUInt32LE(proof.domain.lengthBytes, 0)
    
    const domainValue = Buffer.alloc(32, 0)
    Buffer.from(proof.domain.value, "utf-8").copy(domainValue, 0, 0, 32)

    // Timestamp: 8 байт little-endian uint64
    const timestampBuffer = Buffer.alloc(8)
    timestampBuffer.writeBigUInt64LE(BigInt(proof.timestamp), 0)

    // Payload: 4 байта length (little-endian) + payload value
    const payloadLength = Buffer.alloc(4)
    payloadLength.writeUInt32LE(proof.payload.length, 0)
    const payloadValue = Buffer.from(proof.payload, "utf-8")

    // Собираем полное сообщение
    const message = Buffer.concat([
      prefixBuffer,
      addressBuffer,
      domainLength,
      domainValue,
      timestampBuffer,
      payloadLength,
      payloadValue,
    ])

    // 6. Хэшируем сообщение дважды (по спецификации)
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

    // 7. Верифицируем подпись
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