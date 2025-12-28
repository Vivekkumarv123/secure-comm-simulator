/**
 * authenticationService.ts
 * Module 3: Authentication & Hashing Module
 *
 * Ensures message integrity and sender authentication:
 * - Generate hash (SHA-256)
 * - Create HMAC for message authentication
 * - Generate and verify digital signatures
 * - Timestamp-based anti-replay protection
 */

import { sha256, createHMAC, verifyHMAC } from "./crypto/hash"
import { signMessage, verifySignature } from "./crypto/rsa"

// ========== MESSAGE AUTHENTICATION CODE ==========

export interface MACResult {
  mac: string // Base64 encoded
  algorithm: "HMAC-SHA256"
  timestamp: number
}

export async function generateMAC(
  message: string,
  hmacKey: CryptoKey
): Promise<MACResult> {
  const macBuffer = await createHMAC(message, hmacKey)

  return {
    mac: Buffer.from(macBuffer).toString("base64"),
    algorithm: "HMAC-SHA256",
    timestamp: Date.now(),
  }
}

export async function verifyMAC(
  message: string,
  macResult: MACResult,
  hmacKey: CryptoKey
): Promise<boolean> {
  const macBuffer = Buffer.from(macResult.mac, "base64")
  return verifyHMAC(message, macBuffer.buffer, hmacKey)
}

// ========== INTEGRITY VERIFICATION ==========

export interface HashResult {
  hash: string // Hex string
  algorithm: "SHA-256"
  timestamp: number
}

export async function hashMessage(message: string): Promise<HashResult> {
  return {
    hash: await sha256(message),
    algorithm: "SHA-256",
    timestamp: Date.now(),
  }
}

export async function verifyIntegrity(
  message: string,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await sha256(message)
  return actualHash === expectedHash
}

// ========== DIGITAL SIGNATURES ==========

export interface SignatureResult {
  signature: string // Base64 encoded
  algorithm: "RSA-PSS"
  timestamp: number
  messageHash: string // SHA-256 of the message
}

export async function signAndHash(
  message: string,
  privateKey: CryptoKey
): Promise<SignatureResult> {
  const signatureBuffer = await signMessage(message, privateKey)
  const messageHash = await sha256(message)

  return {
    signature: Buffer.from(signatureBuffer).toString("base64"),
    algorithm: "RSA-PSS",
    timestamp: Date.now(),
    messageHash,
  }
}

export async function verifySignatureAndHash(
  message: string,
  signatureResult: SignatureResult,
  publicKey: CryptoKey
): Promise<{
  signatureValid: boolean
  integrityValid: boolean
  overallValid: boolean
}> {
  const signatureBuffer = Buffer.from(signatureResult.signature, "base64")

  const signatureValid = await verifySignature(
    message,
    signatureBuffer.buffer,
    publicKey
  )

  const integrityValid = await verifyIntegrity(
    message,
    signatureResult.messageHash
  )

  return {
    signatureValid,
    integrityValid,
    overallValid: signatureValid && integrityValid,
  }
}

// ========== AUTHENTICATION SERVICE ==========

export interface AuthenticationContext {
  senderId: string
  receiverId: string
  sessionId: string
  timestamp: number
  nonce: string
}

export interface AuthenticatedMessage {
  content: string
  context: AuthenticationContext
  hash: HashResult
  mac?: MACResult
  signature?: SignatureResult
}

export class AuthenticationService {
  /**
   * Create authenticated message with hash and optional MAC/Signature
   */
  async createAuthenticatedMessage(
    content: string,
    context: AuthenticationContext,
    options: {
      includeMAC?: boolean
      macKey?: CryptoKey
      includeSignature?: boolean
      signatureKey?: CryptoKey
    } = {}
  ): Promise<AuthenticatedMessage> {
    const message: AuthenticatedMessage = {
      content,
      context,
      hash: await hashMessage(content),
    }

    if (options.includeMAC && options.macKey) {
      message.mac = await generateMAC(content, options.macKey)
    }

    if (options.includeSignature && options.signatureKey) {
      message.signature = await signAndHash(
        content,
        options.signatureKey
      )
    }

    return message
  }

  /**
   * Verify authenticated message integrity and authenticity
   */
  async verifyAuthenticatedMessage(
    message: AuthenticatedMessage,
    options: {
      verifyMAC?: boolean
      macKey?: CryptoKey
      verifySignature?: boolean
      signatureKey?: CryptoKey
      maxAge?: number // in milliseconds
    } = {}
  ): Promise<{
    integrityValid: boolean
    macValid: boolean
    signatureValid: boolean
    freshnessValid: boolean
    overallValid: boolean
  }> {
    const now = Date.now()
    const age = now - message.context.timestamp
    const maxAge = options.maxAge || 3600000 // 1 hour default

    // Verify integrity
    const integrityValid = await verifyIntegrity(
      message.content,
      message.hash.hash
    )

    // Verify MAC if provided
    let macValid = true
    if (options.verifyMAC && message.mac && options.macKey) {
      macValid = await verifyMAC(message.content, message.mac, options.macKey)
    }

    // Verify signature if provided
    let signatureValid = true
    if (
      options.verifySignature &&
      message.signature &&
      options.signatureKey
    ) {
      const result = await verifySignatureAndHash(
        message.content,
        message.signature,
        options.signatureKey
      )
      signatureValid = result.overallValid
    }

    const freshnessValid = age < maxAge

    return {
      integrityValid,
      macValid,
      signatureValid,
      freshnessValid,
      overallValid:
        integrityValid && macValid && signatureValid && freshnessValid,
    }
  }

  /**
   * Generate authentication context
   */
  generateAuthContext(
    senderId: string,
    receiverId: string,
    sessionId: string,
    nonce: string
  ): AuthenticationContext {
    return {
      senderId,
      receiverId,
      sessionId,
      timestamp: Date.now(),
      nonce,
    }
  }
}

export const authenticationService = new AuthenticationService()
