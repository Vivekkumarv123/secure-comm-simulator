import { NextRequest, NextResponse } from "next/server"

/**
 * Simple in-memory rate limiter
 * (Ephemeral, resets on server restart)
 */

const RATE_LIMIT = 20           // max requests
const WINDOW_MS = 60_000        // per 60 seconds

type ClientRecord = {
  count: number
  startTime: number
}

const clients = new Map<string, ClientRecord>()

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"

  const now = Date.now()
  const record = clients.get(ip)

  if (!record) {
    clients.set(ip, { count: 1, startTime: now })
    return NextResponse.next()
  }

  // Reset window if time expired
  if (now - record.startTime > WINDOW_MS) {
    clients.set(ip, { count: 1, startTime: now })
    return NextResponse.next()
  }

  // Increment request count
  record.count++

  if (record.count > RATE_LIMIT) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests – possible DoS or brute-force attempt detected",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }

  return NextResponse.next()
}

/**
 * Apply middleware only to API routes
 */
export const config = {
  matcher: ["/api/:path*"],
}
