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

    const safeSignature = signature.replace(/-/g, '+').replace(/_/g, '/')
    const signatureBuffer = Buffer.from(safeSignature, 'base64')
    const publicKeyBuffer = Buffer.from(cleanPublicKey, 'hex')

    if (publicKeyBuffer.length !== 32) {
      throw new Error(`Неверная длина публичного ключа: ${publicKeyBuffer.length} байт (ожидается 32). Значение: ${cleanPublicKey}`)
    }

    const isValid = signVerify(messageBuffer, signatureBuffer, publicKeyBuffer)
    
    if (!isValid) {
      throw new Error(`Подпись не совпадает. Nonce: ${nonce}, PubKey: ${cleanPublicKey.slice(0, 10)}..., Sig: ${signature.slice(0, 15)}...`)
    }

    return true
  } catch (error: any) {
    throw new Error(`TON_VERIFY_FAILED: ${error.message}`)
  }
}