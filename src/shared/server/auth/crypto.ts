import { signVerify } from '@ton/crypto'
import { Address } from '@ton/core'

export async function verifyTonSignature(
  address: string,
  signature: string,
  nonce: string,
  publicKey: string
): Promise<boolean> {
  try {
    Address.parse(address)

    const cleanPublicKey = publicKey.replace(/^0x/, '')

    const messageBuffer = Buffer.from(nonce, 'utf-8')

    const signatureBuffer = Buffer.from(signature, 'base64')
    const publicKeyBuffer = Buffer.from(cleanPublicKey, 'hex')

    if (publicKeyBuffer.length !== 32) {
      console.error(`[TON Auth] Ошибка: неверная длина публичного ключа: ${publicKeyBuffer.length} байт (ожидается 32)`)
      return false
    }

    const isValid = signVerify(messageBuffer, signatureBuffer, publicKeyBuffer)
    
    if (!isValid) {
      console.error(`[TON Auth] Верификация подписи не пройдена!`)
      console.error(`- Address: ${address}`)
      console.error(`- Nonce: ${nonce}`)
      console.error(`- PubKey (first 10 chars): ${cleanPublicKey.substring(0, 10)}...`)
      console.error(`- Signature (first 10 chars): ${signature.substring(0, 10)}...`)
    }

    return isValid
  } catch (error) {
    console.error('[TON Auth] Критическая ошибка при верификации:', error)
    return false
  }
}