/**
 * tamper.ts
 * Module 5: Attack Simulation Module - Message Tampering
 *
 * Demonstrates how attackers can modify encrypted messages
 * and how detection mechanisms identify tampering.
 */

export interface TamperResult {
  originalHash: string
  tamperedHash: string
  bytesTampered: number
  tamperLocations: number[]
  detectable: boolean
}

/**
 * Flip random bits in ciphertext
 * Detection: Hash mismatch, decryption failure (GCM authentication)
 */
export function tamperCiphertext(
  cipher: ArrayBuffer,
  tamperCount: number = 1
): { tamperedCipher: ArrayBuffer; tamperLocations: number[] } {
  const bytes = new Uint8Array(cipher)
  const tamperLocations: number[] = []

  for (let i = 0; i < tamperCount; i++) {
    const randomIndex = Math.floor(Math.random() * bytes.length)
    const randomBitPosition = Math.floor(Math.random() * 8)

    bytes[randomIndex] ^= 1 << randomBitPosition
    tamperLocations.push(randomIndex)
  }

  return { tamperedCipher: bytes.buffer, tamperLocations }
}

/**
 * Truncate ciphertext (removes authentication tag)
 * Detection: GCM authentication will fail
 */
export function truncateCiphertext(cipher: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(cipher)
  return bytes.slice(0, Math.max(0, bytes.length - 16)).buffer
}
