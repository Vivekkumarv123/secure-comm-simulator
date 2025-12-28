"use client"

import { AttackOptions } from "@/lib/types/crypto"

interface AttackToggleProps {
  options: AttackOptions
  onChange: (options: AttackOptions) => void
}

export default function AttackToggle({
  options,
  onChange,
}: AttackToggleProps) {
  function toggle(key: keyof AttackOptions) {
    onChange({ ...options, [key]: !options[key] })
  }

  return (
    <div className="p-4 border rounded space-y-2">
      <h2 className="font-semibold">Attack Simulation</h2>

      {(["tamper", "replay", "mitm"] as const).map((attack) => (
        <label key={attack} className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={options[attack]}
            onChange={() => toggle(attack)}
          />
          {attack.toUpperCase()}
        </label>
      ))}
    </div>
  )
}
