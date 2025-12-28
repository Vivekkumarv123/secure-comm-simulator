
export async function generateRSAEncryptionKeys(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  )
}

export async function rsaEncrypt(
  message: string,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  const encoded = new TextEncoder().encode(message)
  return crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoded
  )
}

export async function rsaDecrypt(
  cipher: ArrayBuffer,
  privateKey: CryptoKey
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    cipher
  )
  return new TextDecoder().decode(decrypted)
}

// ---------- RSA-PSS (Digital Signature) ----------
export async function generateRSASignatureKeys(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  )
}

export async function signMessage(
  message: string,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  const encoded = new TextEncoder().encode(message)
  return crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    encoded
  )
}

export async function verifySignature(
  message: string,
  signature: ArrayBuffer,
  publicKey: CryptoKey
): Promise<boolean> {
  const encoded = new TextEncoder().encode(message)
  return crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    publicKey,
    signature,
    encoded
  )
}
