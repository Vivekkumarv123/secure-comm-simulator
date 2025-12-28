"use client"

import { useState } from "react"

interface MessageInputProps {
  onSend: (message: string) => void
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("")

  return (
    <div className="p-4 border rounded space-y-2">
      <h2 className="font-semibold">Message Input</h2>

      <textarea
        className="w-full border p-2 rounded"
        rows={4}
        placeholder="Enter message to secure"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => onSend(message)}
        disabled={!message}
      >
        Send Securely
      </button>
    </div>
  )
}
