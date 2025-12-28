/**
 * replay.ts
 * Module 5: Attack Simulation Module - Replay Attack
 *
 * Demonstrates replay attack where an attacker captures and
 * retransmits valid messages to cause unintended actions.
 *
 * Defense: Nonces, timestamps, and sequence numbers
 */

export interface NonceRecord {
  nonce: string
  usedAt: number
  count: number
}

const usedNonces = new Map<string, NonceRecord>()

/**
 * Check if nonce has been used (anti-replay check)
 */
export function isReplay(nonce: string): boolean {
  const record = usedNonces.get(nonce)
  return record !== undefined && record.count > 0
}

/**
 * Mark nonce as consumed (should happen only once per message)
 */
export function markNonceUsed(nonce: string): void {
  const record = usedNonces.get(nonce)

  if (record) {
    record.count++
    record.usedAt = Date.now()
  } else {
    usedNonces.set(nonce, {
      nonce,
      usedAt: Date.now(),
      count: 1,
    })
  }
}

/**
 * Generate cryptographically secure nonce
 */
export function generateNonce(): string {
  return crypto.randomUUID()
}

/**
 * Get nonce statistics
 */
export function getNonceStats(): {
  totalNonces: number
  replayedNonces: number
  freshNonces: number
} {
  let replayedNonces = 0
  let freshNonces = 0

  usedNonces.forEach((record) => {
    if (record.count > 1) {
      replayedNonces++
    } else {
      freshNonces++
    }
  })

  return {
    totalNonces: usedNonces.size,
    replayedNonces,
    freshNonces,
  }
}
