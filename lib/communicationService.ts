/**
 * communicationService.ts
 * Module 7: Backend Communication Module
 *
 * Acts as a secure relay between sender and receiver
 * - Message forwarding
 * - Temporary data storage
 * - Logging attack attempts
 * - No plaintext retention
 */

import { EncryptedMessage } from "./types/crypto"

export interface MessageLog {
  id: string
  timestamp: number
  sender: string
  receiver: string
  encrypted: boolean
  attacksDetected: string[]
  encryptedDataHash: string
  decrypted: boolean
}

export interface SessionMessage {
  id: string
  payload: EncryptedMessage
  receivedAt: number
  processedAt?: number
  wasDecrypted?: boolean
}

export class CommunicationService {
  private messageBuffer = new Map<string, SessionMessage>()
  private messageLog: MessageLog[] = []
  private readonly BUFFER_RETENTION_MS = 300000 // 5 minutes
  private readonly MAX_LOG_SIZE = 1000

  /**
   * Store encrypted message temporarily
   * No plaintext is retained at any point
   */
  storeEncryptedMessage(
    sessionId: string,
    payload: EncryptedMessage,
    messageId: string = `msg-${Date.now()}`
  ): { messageId: string; stored: boolean } {
    // Store only encrypted data
    this.messageBuffer.set(messageId, {
      id: messageId,
      payload,
      receivedAt: Date.now(),
    })

    return {
      messageId,
      stored: this.messageBuffer.has(messageId),
    }
  }

  /**
   * Retrieve encrypted message
   */
  retrieveEncryptedMessage(messageId: string): SessionMessage | undefined {
    const message = this.messageBuffer.get(messageId)

    if (message) {
      message.processedAt = Date.now()
    }

    return message
  }

  /**
   * Forward message to receiver
   * In production, this would actually deliver to receiver's server
   */
  async forwardMessage(
    messageId: string,
    receiverId: string
  ): Promise<{ forwarded: boolean; receiverId: string }> {
    const message = this.messageBuffer.get(messageId)

    if (!message) {
      return { forwarded: false, receiverId }
    }

    // In production: Make API call to receiver's endpoint
    // For now: Just mark as forwarded
    message.processedAt = Date.now()

    return { forwarded: true, receiverId }
  }

  /**
   * Log message for audit trail
   * Logs encrypted data hash only (no plaintext)
   */
  logMessage(
    messageId: string,
    sender: string,
    receiver: string,
    encryptedDataHash: string,
    attacksDetected: string[] = []
  ): void {
    const log: MessageLog = {
      id: messageId,
      timestamp: Date.now(),
      sender,
      receiver,
      encrypted: true,
      attacksDetected,
      encryptedDataHash,
      decrypted: false,
    }

    this.messageLog.push(log)

    // Maintain log size limit
    if (this.messageLog.length > this.MAX_LOG_SIZE) {
      this.messageLog.shift()
    }
  }

  /**
   * Log attack attempt
   */
  logAttackAttempt(
    messageId: string,
    attackType: string
  ): void {
    this.logMessage(
      messageId,
      "unknown",
      "unknown",
      "N/A",
      [attackType]
    )
  }

  /**
   * Get message audit log (for security review)
   */
  getMessageLog(limit: number = 100): MessageLog[] {
    return this.messageLog.slice(-limit)
  }

  /**
   * Get attack statistics
   */
  getAttackStatistics(): {
    totalMessages: number
    attackedMessages: number
    attackTypes: Record<string, number>
  } {
    const stats = {
      totalMessages: this.messageLog.length,
      attackedMessages: 0,
      attackTypes: {} as Record<string, number>,
    }

    this.messageLog.forEach((log) => {
      if (log.attacksDetected.length > 0) {
        stats.attackedMessages++
        log.attacksDetected.forEach((attack) => {
          stats.attackTypes[attack] = (stats.attackTypes[attack] || 0) + 1
        })
      }
    })

    return stats
  }

  /**
   * Clear expired messages from buffer
   */
  cleanupExpiredMessages(): number {
    let removed = 0
    const now = Date.now()

    this.messageBuffer.forEach((message, id) => {
      const age = now - message.receivedAt
      if (age > this.BUFFER_RETENTION_MS) {
        this.messageBuffer.delete(id)
        removed++
      }
    })

    return removed
  }

  /**
   * Get current buffer statistics
   */
  getBufferStats(): {
    messagesInBuffer: number
    oldestMessage?: number
    newestMessage?: number
  } {
    const messages = Array.from(this.messageBuffer.values())

    return {
      messagesInBuffer: messages.length,
      oldestMessage:
        messages.length > 0
          ? Math.min(...messages.map((m) => m.receivedAt))
          : undefined,
      newestMessage:
        messages.length > 0
          ? Math.max(...messages.map((m) => m.receivedAt))
          : undefined,
    }
  }

  /**
   * Simulate message delivery tracking
   */
  trackDelivery(messageId: string): {
    messageId: string
    status: "buffered" | "forwarded" | "delivered" | "not-found"
    timestamp: number
  } {
    const message = this.messageBuffer.get(messageId)

    if (!message) {
      return {
        messageId,
        status: "not-found",
        timestamp: Date.now(),
      }
    }

    const status = message.processedAt
      ? "forwarded"
      : "buffered"

    return {
      messageId,
      status,
      timestamp: Date.now(),
    }
  }

  /**
   * Clear all buffers (for testing)
   */
  clearAll(): void {
    this.messageBuffer.clear()
  }
}

export const communicationService = new CommunicationService()
