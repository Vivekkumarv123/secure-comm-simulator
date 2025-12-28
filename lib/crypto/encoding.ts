// lib/crypto/encoding.ts

export function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export function uint8ToBase64(arr: Uint8Array): string {
  return arrayBufferToBase64(arr.buffer)
}

export function base64ToUint8(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64))
}
