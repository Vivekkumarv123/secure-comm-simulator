// lib/crypto/aes.ts

export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
}

export async function encryptAES(
  plaintext: string,
  key: CryptoKey
): Promise<{ cipher: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) // MUST be 12 bytes
  const encoded = new TextEncoder().encode(plaintext)

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  )

  return { cipher, iv }
}

export async function decryptAES(
  cipher: ArrayBuffer,
  iv: Uint8Array,
  key: CryptoKey
): Promise<string | null> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      cipher
    )

    return new TextDecoder().decode(decrypted)
  } catch (err) {
    // 🔐 AES-GCM authentication failure
    return null
  }
}
