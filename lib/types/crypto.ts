/**
 * crypto.ts
 * Centralized TypeScript types for cryptographic operations
 *
 * Purpose:
 * - Strong typing for crypto payloads
 * - Prevent misuse of keys and attacks
 * - Cleaner UI ↔ Crypto ↔ API integration
 */

/* ---------- BASIC TYPES ---------- */

export type Base64String = string
export type HexString = string
export type Nonce = string
export type SessionId = string
export type KeyId = string

/* ---------- ENCRYPTION METHODS ---------- */

export type EncryptionMethod = "caesar" | "aes" | "rsa"
export type AuthMethod = "none" | "hmac" | "signature"

/* ---------- AES TYPES ---------- */

export interface AESEncryptedPayload {
  cipher: ArrayBuffer
  iv: Uint8Array
}

export interface AESPayload {
  ciphertext: Base64String
  iv: Base64String
  algorithm: "AES-GCM"
}

/* ---------- RSA TYPES ---------- */

export interface RSAEncryptionKeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface RSASignatureKeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface RSAPayload {
  ciphertext: Base64String
  algorithm: "RSA-OAEP"
  keySize: number
}

/* ---------- HASH & AUTH ---------- */

export interface HashResult {
  hash: HexString
  algorithm: "SHA-256"
  timestamp: number
}

export interface HMACResult {
  mac: Base64String
  algorithm: "HMAC-SHA256"
  timestamp: number
}

export interface SignatureResult {
  signature: Base64String
  algorithm: "RSA-PSS"
  timestamp: number
  messageHash: HexString
}

/* ---------- DIFFIE-HELLMAN ---------- */

export interface DHKeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

/* ---------- AUTHENTICATION CONTEXT ---------- */

export interface AuthenticationContext {
  senderId: string
  receiverId: string
  sessionId: SessionId
  timestamp: number
  nonce: Nonce
}

export interface AuthenticatedMessage {
  content: string
  context: AuthenticationContext
  hash: HashResult
  mac?: HMACResult
  signature?: SignatureResult
}

/* ---------- MESSAGE PAYLOAD ---------- */

export interface SecureMessage {
  message: string
  nonce: Nonce
  timestamp: number
  encryptionMethod: EncryptionMethod
  authMethod: AuthMethod
}

export interface EncryptedMessage {
  encryptedData: Base64String
  iv: Base64String
  nonce: Nonce
  timestamp: number
  encryptionMethod: EncryptionMethod
  mac?: Base64String
  signature?: Base64String
}

/* ---------- ATTACK FLAGS ---------- */

export interface AttackOptions {
  tamper: boolean
  replay: boolean
  mitm: boolean
  bruteForce?: boolean
}

/* ---------- VERIFICATION RESULT ---------- */

export interface VerificationResult {
  integrity: boolean
  authentication: boolean
  replaySafe: boolean
  signatureValid?: boolean
  macValid?: boolean
  freshnessValid?: boolean
  detectedAttacks?: string[]
  message?: string
}

/* ---------- SESSION MANAGEMENT ---------- */

export interface SessionContext {
  sessionId: SessionId
  rsaEncryptionKeyId?: KeyId
  rsaSignatureKeyId?: KeyId
  aesSessionKeyId?: KeyId
  ecdhKeyId?: KeyId
  createdAt: Date
  expiresAt: Date
}

/* ---------- API PAYLOADS ---------- */

export interface RelayRequest {
  payload: EncryptedMessage
  attackOptions: AttackOptions
}

export interface RelayResponse {
  success: boolean
  data?: EncryptedMessage
  error?: string
}

export interface VerifyRequest {
  nonce: Nonce
  integrity: boolean
  authentication: boolean
  replayEnabled: boolean
  signatureValid?: boolean
  macValid?: boolean
}

/* ---------- KEY MANAGEMENT ---------- */

export interface KeyMetadata {
  keyId: KeyId
  type: "RSA-ENCRYPT" | "RSA-SIGN" | "AES" | "ECDH"
  algorithm: string
  keySize: number
  createdAt: Date
  expiresAt: Date
  status: "active" | "expired" | "revoked"
}

/* ---------- ATTACK DETECTION ---------- */

export interface AttackDetection {
  detected: boolean
  attackType?: "tamper" | "replay" | "mitm" | "bruteForce"
  confidence: number // 0-1
  evidence: string[]
  timestamp: number
}
