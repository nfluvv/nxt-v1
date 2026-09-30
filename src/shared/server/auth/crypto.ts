import { signVerify } from '@ton/crypto';
import { Address } from '@ton/core';

export async function verifyTonSignature(
  address: string,
  signature: string,
  nonce: string,
  publicKey: string
): Promise<boolean> {
  try {
    Address.parse(address);
    
    const message = Buffer.from(nonce, 'utf-8');
    const signatureBuffer = Buffer.from(signature, 'base64url');
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    
    return signVerify(message, signatureBuffer, publicKeyBuffer);
  } catch (error) {
    console.error('[TON Crypto] Signature verification error:', error);
    return false;
  }
}