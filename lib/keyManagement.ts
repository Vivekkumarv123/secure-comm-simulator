/**
 * keyManagement.ts
 * Module 4: Key Management Module
 *
 * Handles generation, storage, and usage of cryptographic keys
 * - RSA key pair generation
 * - Session key creation for AES
 * - Public key distribution
 * - Private key protection
 */

import {
  generateRSAEncryptionKeys,
  generateRSASignatureKeys,
} from "./crypto/rsa"
import { generateAESKey } from "./crypto/aes"
import { generateDHKeyPair } from "./crypto/dh"

// ========== Key Storage (In-Memory Session) ==========
interface StoredKeyPair {
  id: string
  type: "RSA-ENCRYPT" | "RSA-SIGN" | "AES" | "ECDH"
  publicKey?: CryptoKey
  privateKey?: CryptoKey
  symmetricKey?: CryptoKey
  createdAt: Date
  expiresAt: Date
}

class KeyStore {
  private keys: Map<string, StoredKeyPair> = new Map()
  private readonly DEFAULT_KEY_LIFESPAN_MS = 3600000 // 1 hour

  /**
   * Generate and store RSA encryption key pair
   */
  async generateAndStoreRSAEncryptionKeys(
    keyId?: string
  ): Promise<{
    id: string
    publicKey: CryptoKey
  }> {
    const id = keyId || `rsa-enc-${Date.now()}`
    const { publicKey, privateKey } =
      await generateRSAEncryptionKeys()

    this.keys.set(id, {
      id,
      type: "RSA-ENCRYPT",
      publicKey,
      privateKey,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + this.DEFAULT_KEY_LIFESPAN_MS
      ),
    })

    return { id, publicKey }
  }

  /**
   * Generate and store RSA signature key pair
   */
  async generateAndStoreRSASignatureKeys(
    keyId?: string
  ): Promise<{
    id: string
    publicKey: CryptoKey
  }> {
    const id = keyId || `rsa-sign-${Date.now()}`
    const { publicKey, privateKey } =
      await generateRSASignatureKeys()

    this.keys.set(id, {
      id,
      type: "RSA-SIGN",
      publicKey,
      privateKey,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + this.DEFAULT_KEY_LIFESPAN_MS
      ),
    })

    return { id, publicKey }
  }

  /**
   * Generate and store ECDH key pair
   */
  async generateAndStoreECDHKeyPair(keyId?: string): Promise<{
    id: string
    publicKey: CryptoKey
  }> {
    const id = keyId || `ecdh-${Date.now()}`
    const { publicKey, privateKey } = await generateDHKeyPair()

    this.keys.set(id, {
      id,
      type: "ECDH",
      publicKey,
      privateKey,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + this.DEFAULT_KEY_LIFESPAN_MS
      ),
    })

    return { id, publicKey }
  }

  /**
   * Generate and store AES session key
   */
  async generateAndStoreAESSessionKey(
    keyId?: string
  ): Promise<{ id: string; key: CryptoKey }> {
    const id = keyId || `aes-session-${Date.now()}`
    const key = await generateAESKey()

    this.keys.set(id, {
      id,
      type: "AES",
      symmetricKey: key,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + this.DEFAULT_KEY_LIFESPAN_MS
      ),
    })

    return { id, key }
  }

  /**
   * Retrieve stored key pair
   */
  getKeyPair(
    keyId: string
  ): StoredKeyPair | undefined {
    const stored = this.keys.get(keyId)

    // Check expiration
    if (
      stored &&
      stored.expiresAt.getTime() < Date.now()
    ) {
      this.keys.delete(keyId)
      return undefined
    }

    return stored
  }

  /**
   * Get public key only (safe for distribution)
   */
  getPublicKey(keyId: string): CryptoKey | undefined {
    const stored = this.getKeyPair(keyId)
    return stored?.publicKey
  }

  /**
   * Get private key (only for local operations)
   */
  getPrivateKey(keyId: string): CryptoKey | undefined {
    const stored = this.getKeyPair(keyId)
    return stored?.privateKey
  }

  /**
   * Get symmetric key
   */
  getSymmetricKey(keyId: string): CryptoKey | undefined {
    const stored = this.getKeyPair(keyId)
    return stored?.symmetricKey
  }

  /**
   * Revoke a key (delete immediately)
   */
  revokeKey(keyId: string): boolean {
    return this.keys.delete(keyId)
  }

  /**
   * Get all active key IDs
   */
  getActiveKeyIds(): string[] {
    const now = Date.now()
    return Array.from(this.keys.entries())
      .filter(([, stored]) => stored.expiresAt.getTime() > now)
      .map(([id]) => id)
  }

  /**
   * Cleanup expired keys
   */
  cleanupExpiredKeys(): number {
    const now = Date.now()
    let removed = 0

    this.keys.forEach((stored, id) => {
      if (stored.expiresAt.getTime() < now) {
        this.keys.delete(id)
        removed++
      }
    })

    return removed
  }
}

// Export singleton instance
export const keyStore = new KeyStore()

/**
 * Session Key Management
 * Creates isolated session contexts with unique keys
 */
export interface SessionContext {
  sessionId: string
  rsaEncryptionKeyId?: string
  rsaSignatureKeyId?: string
  aesSessionKeyId?: string
  ecdhKeyId?: string
  createdAt: Date
  expiresAt: Date
}

class SessionManager {
  private sessions: Map<string, SessionContext> = new Map()
  private readonly SESSION_LIFESPAN_MS = 1800000 // 30 minutes

  /**
   * Create new session with fresh keys
   */
  async createSession(
    sessionId?: string
  ): Promise<SessionContext> {
    const id = sessionId || `session-${Date.now()}`

    const session: SessionContext = {
      sessionId: id,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + this.SESSION_LIFESPAN_MS
      ),
    }

    // Generate keys for this session
    const rsaEnc = await keyStore.generateAndStoreRSAEncryptionKeys(
      `${id}-rsa-enc`
    )
    const rsaSig = await keyStore.generateAndStoreRSASignatureKeys(
      `${id}-rsa-sig`
    )
    const aes = await keyStore.generateAndStoreAESSessionKey(
      `${id}-aes`
    )
    const ecdh = await keyStore.generateAndStoreECDHKeyPair(
      `${id}-ecdh`
    )

    session.rsaEncryptionKeyId = rsaEnc.id
    session.rsaSignatureKeyId = rsaSig.id
    session.aesSessionKeyId = aes.id
    session.ecdhKeyId = ecdh.id

    this.sessions.set(id, session)
    return session
  }

  /**
   * Get session context
   */
  getSession(sessionId: string): SessionContext | undefined {
    const session = this.sessions.get(sessionId)

    // Check expiration
    if (session && session.expiresAt.getTime() < Date.now()) {
      this.terminateSession(sessionId)
      return undefined
    }

    return session
  }

  /**
   * Terminate session and cleanup keys
   */
  terminateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)

    if (!session) return false

    // Revoke all keys associated with this session
    if (session.rsaEncryptionKeyId)
      keyStore.revokeKey(session.rsaEncryptionKeyId)
    if (session.rsaSignatureKeyId)
      keyStore.revokeKey(session.rsaSignatureKeyId)
    if (session.aesSessionKeyId)
      keyStore.revokeKey(session.aesSessionKeyId)
    if (session.ecdhKeyId)
      keyStore.revokeKey(session.ecdhKeyId)

    return this.sessions.delete(sessionId)
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    const now = Date.now()
    return Array.from(this.sessions.entries())
      .filter(([, session]) => session.expiresAt.getTime() > now)
      .map(([id]) => id)
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = Date.now()
    let removed = 0

    this.sessions.forEach((session, id) => {
      if (session.expiresAt.getTime() < now) {
        this.terminateSession(id)
        removed++
      }
    })

    return removed
  }
}

// Export singleton session manager
export const sessionManager = new SessionManager()
