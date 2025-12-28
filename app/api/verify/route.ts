import { NextRequest, NextResponse } from "next/server"
import { isReplay, markNonceUsed } from "@/lib/attacks/replay"
import { VerificationResult } from "@/lib/types/crypto"

export async function POST(req: NextRequest) {
    try {
        const {
            nonce,
            integrity,
            authentication,
            replayEnabled,
            signatureValid,
            freshnessValid,
        } = await req.json()

        // Check for replay attacks
        const isReplayAttack = replayEnabled && isReplay(nonce)

        const replaySafe = !isReplayAttack

        // Mark nonce as used after verification
        if (!isReplayAttack) {
            markNonceUsed(nonce)
        }

        // Determine detected attacks
        const detectedAttacks: string[] = []
        if (!integrity) detectedAttacks.push("tamper")
        if (isReplayAttack) detectedAttacks.push("replay")
        if (signatureValid === false && replayEnabled) {
            detectedAttacks.push("mitm")
        }

        if (freshnessValid === false) detectedAttacks.push("stale")

        const result: VerificationResult = {
            integrity,
            authentication,
            replaySafe,
            signatureValid,
            freshnessValid,
            detectedAttacks,
            message:
                detectedAttacks.length > 0
                    ? `Attacks detected: ${detectedAttacks.join(", ")}`
                    : "Message verified successfully",
        }

        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            {
                integrity: false,
                authentication: false,
                replaySafe: false,
                detectedAttacks: ["error"],
                message:
                    "Verification failed: " +
                    ((error as Error).message || "Unknown error"),
            } satisfies VerificationResult,
            { status: 400 }
        )
    }
}
