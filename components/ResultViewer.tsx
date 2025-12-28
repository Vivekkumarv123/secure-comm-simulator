"use client"

import { VerificationResult } from "@/lib/types/crypto"

interface ResultViewerProps {
  result: VerificationResult | null
}

export default function ResultViewer({ result }: ResultViewerProps) {
  if (!result) {
    return (
      <div className="p-4 border rounded text-gray-500">
        No result yet
      </div>
    )
  }

  return (
    <div className="p-4 border rounded space-y-1">
      <h2 className="font-semibold">Verification Result</h2>

      <p>
        Integrity:{" "}
        <span className={result.integrity ? "text-green-600" : "text-red-600"}>
          {result.integrity ? "OK" : "FAILED"}
        </span>
      </p>

      <p>
        Authentication:{" "}
        <span
          className={
            result.authentication ? "text-green-600" : "text-red-600"
          }
        >
          {result.authentication ? "OK" : "FAILED"}
        </span>
      </p>

      <p>
        Replay Safe:{" "}
        <span
          className={result.replaySafe ? "text-green-600" : "text-red-600"}
        >
          {result.replaySafe ? "YES" : "NO"}
        </span>
      </p>

      {result.message && (
        <p className="text-sm text-gray-600">{result.message}</p>
      )}
    </div>
  )
}
