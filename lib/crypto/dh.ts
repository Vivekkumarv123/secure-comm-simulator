
export async function generateDHKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  )
}

// ---------- Derive Shared AES Key ----------
export async function deriveSharedAESKey(
  privateKey: CryptoKey,
  otherPublicKey: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: otherPublicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}
