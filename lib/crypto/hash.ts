// lib/crypto/hash.ts

export async function sha256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function generateHMACKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"]
  )
}

export async function createHMAC(
  data: string,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const encoded = new TextEncoder().encode(data)
  return crypto.subtle.sign("HMAC", key, encoded)
}

export async function verifyHMAC(
  data: string,
  signature: ArrayBuffer,
  key: CryptoKey
): Promise<boolean> {
  const encoded = new TextEncoder().encode(data)
  return crypto.subtle.verify("HMAC", key, signature, encoded)
}
