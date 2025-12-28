import { NextRequest, NextResponse } from "next/server"
import { communicationService } from "@/lib/communicationService"
import { sessionManager, keyStore } from "@/lib/keyManagement"
import { getNonceStats } from "@/lib/attacks/replay"

/**
 * Health check and statistics endpoint
 * Module 7: Backend Communication Module
 */
export async function GET(req: NextRequest) {
  try {
    const stats = communicationService.getAttackStatistics()
    const bufferStats = communicationService.getBufferStats()
    const nonceStats = getNonceStats()
    const activeSessions = sessionManager.getActiveSessions()

    // Cleanup old data periodically
    communicationService.cleanupExpiredMessages()
    sessionManager.cleanupExpiredSessions()
    keyStore.cleanupExpiredKeys()

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: Date.now(),
        communication: {
          messageBuffer: bufferStats,
          attackStatistics: stats,
        },
        replay: {
          nonceStatistics: nonceStats,
        },
        sessions: {
          activeSessions: activeSessions.length,
          sessions: activeSessions.slice(0, 5), // Show first 5
        },
        crypto: {
          activeKeys: keyStore.getActiveKeyIds().length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: (error as Error).message,
      },
      { status: 500 }
    )
  }
}