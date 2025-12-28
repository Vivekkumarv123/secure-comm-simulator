/**
 * verificationService.ts
 * Module 6: Verification & Detection Module
 *
 * Detects attacks by verifying hashes, signatures, and timestamps
 * - Hash comparison
 * - Signature verification
 * - Nonce/timestamp validation
 * - Attack alert generation
 */

import { sha256 } from "./crypto/hash"
import { verifySignature } from "./crypto/rsa"
import { isReplay } from "./attacks/replay"
import { AttackDetection } from "./types/crypto"

export interface VerificationReport {
  messageId: string
  timestamp: number
  checks: {
    integrityCheck: boolean
    signatureCheck: boolean
    replayCheck: boolean
    freshnessCheck: boolean
    timeSyncCheck: boolean
  }
  detectedAttacks: AttackDetection[]
  overallStatus: "SAFE" | "SUSPICIOUS" | "COMPROMISED"
  riskScore: number // 0-100
}

export class VerificationService {
  private readonly MAX_CLOCK_SKEW_MS = 5000 // 5 seconds
  private readonly MESSAGE_MAX_AGE_MS = 3600000 // 1 hour

  /**
   * Verify message hash integrity
   */
  async verifyHash(
    message: string,
    expectedHash: string
  ): Promise<{ valid: boolean; actualHash: string }> {
    const actualHash = await sha256(message)

    return {
      valid: actualHash === expectedHash,
      actualHash,
    }
  }

  /**
   * Verify digital signature
   */
  async verifySignatureAuthenticity(
    message: string,
    signature: string,
    publicKey: CryptoKey,
    expectedMessageHash?: string
  ): Promise<{
    signatureValid: boolean
    messageHashValid: boolean
    overallValid: boolean
  }> {
    const signatureBuffer = Buffer.from(signature, "base64")

    const signatureValid = await verifySignature(
      message,
      signatureBuffer.buffer,
      publicKey
    )

    let messageHashValid = true
    if (expectedMessageHash) {
      const actualHash = await sha256(message)
      messageHashValid = actualHash === expectedMessageHash
    }

    return {
      signatureValid,
      messageHashValid,
      overallValid: signatureValid && messageHashValid,
    }
  }

  /**
   * Check nonce freshness (anti-replay)
   */
  checkNonceFreshness(nonce: string): {
    isFresh: boolean
    isReplayed: boolean
  } {
    const isReplayed = isReplay(nonce)

    return {
      isFresh: !isReplayed,
      isReplayed,
    }
  }

  /**
   * Check message timestamp freshness
   */
  checkTimestampFreshness(
    messageTimestamp: number,
    maxAge: number = this.MESSAGE_MAX_AGE_MS
  ): {
    isFresh: boolean
    age: number
    maxAge: number
  } {
    const now = Date.now()
    const age = now - messageTimestamp

    return {
      isFresh: age < maxAge && age >= 0,
      age,
      maxAge,
    }
  }

  /**
   * Check clock synchronization between sender and receiver
   */
  checkClockSync(
    senderTimestamp: number,
    receiverTimestamp: number = Date.now()
  ): {
    synchronized: boolean
    skew: number
    maxSkew: number
  } {
    const skew = Math.abs(receiverTimestamp - senderTimestamp)

    return {
      synchronized: skew <= this.MAX_CLOCK_SKEW_MS,
      skew,
      maxSkew: this.MAX_CLOCK_SKEW_MS,
    }
  }

  /**
   * Detect potential tampering
   */
  detectTampering(
    originalHash: string,
    receivedHash: string
  ): AttackDetection {
    const detected = originalHash !== receivedHash

    return {
      detected,
      attackType: "tamper",
      confidence: detected ? 1.0 : 0,
      evidence: detected
        ? [
            `Hash mismatch: ${originalHash} != ${receivedHash}`,
            "Ciphertext integrity violated",
          ]
        : [],
      timestamp: Date.now(),
    }
  }

  /**
   * Detect replay attacks
   */
  detectReplay(nonce: string): AttackDetection {
    const isReplayedNonce = isReplay(nonce)

    return {
      detected: isReplayedNonce,
      attackType: "replay",
      confidence: isReplayedNonce ? 1.0 : 0,
      evidence: isReplayedNonce
        ? [`Nonce reuse detected: ${nonce}`, "Message has been replayed"]
        : [],
      timestamp: Date.now(),
    }
  }

  /**
   * Detect MITM attacks via signature failure
   */
  detectMITM(
    signatureValid: boolean,
    expectedSender: string
  ): AttackDetection {
    const detected = !signatureValid

    return {
      detected,
      attackType: "mitm",
      confidence: detected ? 0.9 : 0,
      evidence: detected
        ? [
            `Signature verification failed for sender: ${expectedSender}`,
            "Message may have been intercepted or modified by third party",
          ]
        : [],
      timestamp: Date.now(),
    }
  }

  /**
   * Generate comprehensive verification report
   */
  async generateVerificationReport(
    messageId: string,
    message: string,
    messageHash: string,
    nonce: string,
    messageTimestamp: number,
    signatureValid?: boolean
  ): Promise<VerificationReport> {
    const now = Date.now()

    // Perform all checks
    const integrityCheck = await this.verifyHash(message, messageHash)
    const replayCheck = this.checkNonceFreshness(nonce)
    const freshnessCheck = this.checkTimestampFreshness(messageTimestamp)
    const timeSyncCheck = this.checkClockSync(messageTimestamp)

    const detectedAttacks: AttackDetection[] = []
    let riskScore = 0

    // Check for tampering
    if (!integrityCheck.valid) {
      detectedAttacks.push(
        this.detectTampering(integrityCheck.actualHash, messageHash)
      )
      riskScore += 35
    }

    // Check for replay
    if (replayCheck.isReplayed) {
      detectedAttacks.push(this.detectReplay(nonce))
      riskScore += 30
    }

    // Check for freshness
    if (!freshnessCheck.isFresh) {
      riskScore += 15
    }

    // Check for clock skew
    if (!timeSyncCheck.synchronized) {
      riskScore += 10
    }

    // Check for MITM
    if (signatureValid === false) {
      detectedAttacks.push(this.detectMITM(false, "unknown"))
      riskScore += 20
    }

    // Cap risk score
    riskScore = Math.min(riskScore, 100)

    const overallStatus =
      riskScore > 70
        ? ("COMPROMISED" as const)
        : riskScore > 30
          ? ("SUSPICIOUS" as const)
          : ("SAFE" as const)

    return {
      messageId,
      timestamp: now,
      checks: {
        integrityCheck: integrityCheck.valid,
        signatureCheck: signatureValid ?? false,
        replayCheck: replayCheck.isFresh,
        freshnessCheck: freshnessCheck.isFresh,
        timeSyncCheck: timeSyncCheck.synchronized,
      },
      detectedAttacks,
      overallStatus,
      riskScore,
    }
  }
}

export const verificationService = new VerificationService()
