import { NextRequest, NextResponse } from "next/server"
import { tamperCiphertext } from "@/lib/attacks/tamper"
import { isReplay, markNonceUsed } from "@/lib/attacks/replay"
import { communicationService } from "@/lib/communicationService"
import { RelayRequest, RelayResponse } from "@/lib/types/crypto"

/**
 * Relay endpoint - acts as secure intermediary
 * Implements Module 7: Backend Communication Module
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RelayRequest
    const { payload, attackOptions } = body

    const messageId = `relay-${Date.now()}`
    const attacks: string[] = []

    // Check for replay attack
    if (attackOptions.replay) {
      if (isReplay(payload.nonce)) {
        // Log replay attack
        communicationService.logAttackAttempt(
          messageId,
          "replay"
        )

        return NextResponse.json(
          {
            success: false,
            error: "Replay attack detected: nonce reuse",
          } satisfies RelayResponse,
          { status: 409 }
        )
      }
    }

    const modifiedPayload = { ...payload }

    // Simulate tampering attack
    if (attackOptions.tamper && payload.encryptedData) {
      attacks.push("tamper")

      // Convert base64 to buffer, tamper, convert back
      const encryptedBuffer = Buffer.from(payload.encryptedData, "base64")
      const { tamperedCipher } = tamperCiphertext(encryptedBuffer.buffer)
      modifiedPayload.encryptedData = Buffer.from(tamperedCipher).toString(
        "base64"
      )

      communicationService.logAttackAttempt(
        messageId,
        "tamper"
      )
    }

    // Simulate MITM attack flag (in real scenario, attacker would modify key)
    if (attackOptions.mitm) {
      attacks.push("mitm")
      communicationService.logAttackAttempt(
        messageId,
        "mitm"
      )
    }

    // Mark nonce as used (AFTER checks, to record it as processed)
    markNonceUsed(payload.nonce)

    // Store message temporarily (no plaintext!)
    communicationService.storeEncryptedMessage(
      "default-session",
      modifiedPayload,
      messageId
    )

    // Log the message
    const encryptedDataHash = Buffer.from(
      modifiedPayload.encryptedData,
      "base64"
    )
      .toString("hex")
      .slice(0, 16)

    communicationService.logMessage(
      messageId,
      "sender@example.com",
      "receiver@example.com",
      encryptedDataHash,
      attacks
    )

    return NextResponse.json(
      {
        success: true,
        data: modifiedPayload,
      } satisfies RelayResponse,
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid relay request" +
          ((err as Error).message ? ": " + (err as Error).message : ""),
      } satisfies RelayResponse,
      { status: 400 }
    )
  }
}

/**
 * GET endpoint for relay health check
 */
export async function GET() {
  const stats = communicationService.getAttackStatistics()
  const bufferStats = communicationService.getBufferStats()

  return NextResponse.json(
    {
      status: "healthy",
      timestamp: Date.now(),
      attackStatistics: stats,
      bufferStatus: bufferStats,
    },
    { status: 200 }
  )
}
