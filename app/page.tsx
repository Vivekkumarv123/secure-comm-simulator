"use client"

import { useState } from "react"
import { Shield, Lock, Key, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from "lucide-react"
import Image from "next/image"

// Mock types (in real app, these come from @/lib/types/crypto)
interface AttackOptions {
  tamper: boolean
  replay: boolean
  mitm: boolean
}

interface VerificationResult {
  integrity: boolean
  authentication: boolean
  replaySafe: boolean
  message?: string
  detectedAttacks?: string[]
}

// ==================== ATTACK TOGGLE (Enhanced) ====================
interface AttackToggleProps {
  options: AttackOptions
  onChange: (options: AttackOptions) => void
}

function AttackToggle({ options, onChange }: AttackToggleProps) {
  function toggle(key: keyof AttackOptions) {
    onChange({ ...options, [key]: !options[key] })
  }

  const anyEnabled = options.tamper || options.replay || options.mitm
  
  const attackInfo = {
    tamper: { name: "Tamper Attack", desc: "Modify message in transit", icon: "🔧" },
    replay: { name: "Replay Attack", desc: "Resend captured message", icon: "🔄" },
    mitm: { name: "MITM Attack", desc: "Intercept & alter communication", icon: "👤" }
  }

  return (
    <div className={`rounded-lg border-2 transition-all ${
      anyEnabled 
        ? 'border-red-500 bg-red-50' 
        : 'border-gray-300 bg-white'
    }`}>
      <div className={`px-4 py-3 border-b-2 flex items-center gap-2 ${
        anyEnabled ? 'border-red-200 bg-red-100' : 'border-gray-200'
      }`}>
        <AlertTriangle className={anyEnabled ? "text-red-600" : "text-gray-400"} size={20} />
        <h2 className="font-bold text-lg">Attack Simulator</h2>
        {anyEnabled && (
          <span className="ml-auto bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
            ACTIVE
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {(["tamper", "replay", "mitm"] as const).map((attack) => (
          <label
            key={attack}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              options[attack]
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={options[attack]}
              onChange={() => toggle(attack)}
              className="w-5 h-5 accent-red-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{attackInfo[attack].icon}</span>
                <span className="font-semibold">{attackInfo[attack].name}</span>
              </div>
              <p className="text-sm text-gray-600">{attackInfo[attack].desc}</p>
            </div>
            {options[attack] && (
              <span className="text-red-600 font-bold">ENABLED</span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

// ==================== CRYPTO FLOW (Enhanced Pipeline) ====================
interface CryptoFlowProps {
  plaintextEntered: boolean
  encrypted: boolean
  attacked: boolean
  verified?: boolean
  algorithms: string[]
}

function CryptoFlow({
  plaintextEntered,
  encrypted,
  attacked,
  verified,
  algorithms,
}: CryptoFlowProps) {
  return (
    <div className="rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="px-4 py-3 border-b-2 border-blue-200 bg-blue-100 flex items-center gap-2">
        <Shield className="text-blue-600" size={20} />
        <h2 className="font-bold text-lg">Security Pipeline</h2>
      </div>

      <div className="p-6">
        {/* Pipeline Steps */}
        <div className="space-y-4">
          <PipelineStep
            icon={<Zap className="w-5 h-5" />}
            label="1. Plaintext Message"
            status={plaintextEntered ? "done" : "pending"}
            description={plaintextEntered ? "Message received from user" : "Awaiting input"}
          />

          <PipelineArrow status={encrypted ? "active" : "inactive"} />

          <PipelineStep
            icon={<Lock className="w-5 h-5" />}
            label="2. Encryption & Authentication"
            status={encrypted ? "done" : "pending"}
            description="AES-256-GCM + SHA-256 + Nonce"
          />

          <PipelineArrow status={attacked ? "danger" : encrypted ? "active" : "inactive"} />

          <PipelineStep
            icon={<AlertTriangle className="w-5 h-5" />}
            label="3. Transmission (Attack Zone)"
            status={attacked ? "warning" : encrypted ? "done" : "pending"}
            description={attacked ? "⚠️ Attack detected in transit" : "Secure transmission"}
          />

          <PipelineArrow 
            status={
              verified === undefined ? "inactive" : 
              verified ? "active" : "danger"
            } 
          />

          <PipelineStep
            icon={<CheckCircle className="w-5 h-5" />}
            label="4. Verification"
            status={
              verified === undefined ? "pending" :
              verified ? "done" : "failed"
            }
            description={
              verified === undefined ? "Awaiting verification" :
              verified ? "✓ All checks passed" :
              "✗ Security breach detected"
            }
          />
        </div>

        {/* Security Stack */}
        <div className="mt-6 pt-6 border-t-2 border-blue-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Active Security Layers
          </h3>
          <div className="space-y-2">
            {algorithms.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No algorithms active yet</div>
            ) : (
              algorithms.map((algo, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white border-l-4 border-blue-500 p-3 rounded-r shadow-sm"
                >
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{algo}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PipelineStepProps {
  icon: React.ReactNode
  label: string
  description: string
  status: "done" | "pending" | "failed" | "warning"
}

function PipelineStep({ icon, label, description, status }: PipelineStepProps) {
  const styles = {
    done: "border-green-500 bg-green-50 text-green-700",
    pending: "border-gray-300 bg-gray-50 text-gray-500",
    failed: "border-red-500 bg-red-50 text-red-700",
    warning: "border-orange-500 bg-orange-50 text-orange-700"
  }

  const iconStyles = {
    done: "bg-green-500 text-white",
    pending: "bg-gray-300 text-gray-600",
    failed: "bg-red-500 text-white",
    warning: "bg-orange-500 text-white"
  }

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${styles[status]} transition-all`}>
      <div className={`p-2 rounded-full ${iconStyles[status]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {status === "done" && <CheckCircle className="text-green-600" size={20} />}
        {status === "failed" && <XCircle className="text-red-600" size={20} />}
        {status === "warning" && <AlertTriangle className="text-orange-600" size={20} />}
        {status === "pending" && <Clock className="text-gray-400" size={20} />}
      </div>
    </div>
  )
}

function PipelineArrow({ status }: { status: "active" | "inactive" | "danger" }) {
  const color = status === "active" ? "border-blue-500" : 
                status === "danger" ? "border-red-500" : 
                "border-gray-300"
  
  return (
    <div className="flex justify-center">
      <div className={`w-1 h-8 border-l-2 border-dashed ${color} transition-colors`}></div>
    </div>
  )
}

// ==================== RESULT VIEWER (Enhanced Report) ====================
interface ResultViewerProps {
  result: VerificationResult | null
}

function ResultViewer({ result }: ResultViewerProps) {
  if (!result) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Awaiting verification results</p>
        <p className="text-sm text-gray-400 mt-1">Send a message to start the security test</p>
      </div>
    )
  }

  const allPassed = result.integrity && result.authentication && result.replaySafe
  const allFailed = !result.integrity && !result.authentication && !result.replaySafe

  return (
    <div className={`rounded-lg border-2 ${
      allPassed ? 'border-green-500 bg-green-50' :
      allFailed ? 'border-red-500 bg-red-50' :
      'border-orange-500 bg-orange-50'
    }`}>
      <div className={`px-4 py-3 border-b-2 flex items-center gap-2 ${
        allPassed ? 'border-green-200 bg-green-100' :
        allFailed ? 'border-red-200 bg-red-100' :
        'border-orange-200 bg-orange-100'
      }`}>
        {allPassed ? (
          <>
            <CheckCircle className="text-green-600" size={20} />
            <h2 className="font-bold text-lg text-green-900">✓ Security Verified</h2>
          </>
        ) : (
          <>
            <XCircle className="text-red-600" size={20} />
            <h2 className="font-bold text-lg text-red-900">✗ Security Breach Detected</h2>
          </>
        )}
      </div>

      <div className="p-4 space-y-3">
        <SecurityCheck
          label="Data Integrity"
          passed={result.integrity}
          description={result.integrity ? "Message hash verified" : "Message was tampered with"}
        />

        <SecurityCheck
          label="Authentication"
          passed={result.authentication}
          description={result.authentication ? "Sender identity confirmed" : "Authentication failed"}
        />

        <SecurityCheck
          label="Replay Protection"
          passed={result.replaySafe}
          description={result.replaySafe ? "Nonce is unique" : "Replay attack detected"}
        />

        {result.detectedAttacks && result.detectedAttacks.length > 0 && (
          <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded">
            <p className="font-bold text-sm text-red-900 mb-2">🚨 Detected Attacks:</p>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              {result.detectedAttacks.map((attack, idx) => (
                <li key={idx}>{attack}</li>
              ))}
            </ul>
          </div>
        )}

        {result.message && (
          <div className="mt-3 p-3 bg-gray-100 rounded text-sm text-gray-700">
            <strong>Details:</strong> {result.message}
          </div>
        )}
      </div>
    </div>
  )
}

function SecurityCheck({ label, passed, description }: { 
  label: string
  passed: boolean
  description: string 
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      passed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
    }`}>
      {passed ? (
        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
      ) : (
        <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
      )}
      <div className="flex-1">
        <p className={`font-semibold text-sm ${passed ? 'text-green-900' : 'text-red-900'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-700 mt-0.5">{description}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded ${
        passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
      }`}>
        {passed ? 'PASS' : 'FAIL'}
      </span>
    </div>
  )
}

// ==================== MESSAGE INPUT (Enhanced) ====================
interface MessageInputProps {
  onSend: (message: string) => void
}

function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("")

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white">
      <div className="px-4 py-3 border-b-2 border-gray-200 bg-gray-50">
        <h2 className="font-bold text-lg">Message Input</h2>
      </div>

      <div className="p-4 space-y-3">
        <textarea
          className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm"
          rows={4}
          placeholder="Enter your confidential message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            message 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => onSend(message)}
          disabled={!message}
        >
          <Lock size={18} />
          Send Securely
        </button>
      </div>
    </div>
  )
}

// ==================== MAIN APP (Demo Version) ====================
export default function SecureCommunicationSimulator() {
  const [message, setMessage] = useState("")
  const [attackOptions, setAttackOptions] = useState<AttackOptions>({
    tamper: false,
    replay: false,
    mitm: false,
  })

  const [result, setResult] = useState<VerificationResult | null>(null)
  const [plaintextEntered, setPlaintextEntered] = useState(false)
  const [encrypted, setEncrypted] = useState(false)
  const [attacked, setAttacked] = useState(false)
  const [algorithmsUsed, setAlgorithmsUsed] = useState<string[]>([])

  const handleSend = (msg: string) => {
    // Simulate the flow
    setPlaintextEntered(true)
    setAlgorithmsUsed([])
    
    setTimeout(() => {
      setEncrypted(true)
      setAlgorithmsUsed([
        "UUID Nonce (Replay Prevention)",
        "AES-256-GCM (Symmetric Encryption)",
        "SHA-256 (Integrity Verification)"
      ])
    }, 500)

    setTimeout(() => {
      const anyAttack = attackOptions.tamper || attackOptions.replay || attackOptions.mitm
      setAttacked(anyAttack)
      
      const detectedAttacks: string[] = []
      if (attackOptions.tamper) detectedAttacks.push("Message tampering detected")
      if (attackOptions.replay) detectedAttacks.push("Replay attack detected")
      if (attackOptions.mitm) detectedAttacks.push("MITM attack detected")

      setResult({
        integrity: !attackOptions.tamper,
        authentication: !attackOptions.mitm,
        replaySafe: !attackOptions.replay,
        message: anyAttack ? "Security breach occurred" : "All security checks passed",
        detectedAttacks: detectedAttacks.length > 0 ? detectedAttacks : undefined
      })
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src={'/logo.png'} alt="App Logo" width={100} height={100} />
            <h1 className="text-3xl font-bold text-gray-900">
              Secure Communication Simulator
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Demonstrating layered cryptographic security with attack simulation
          </p>
          <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
            Session: demo-session-001
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <MessageInput onSend={handleSend} />
            <AttackToggle options={attackOptions} onChange={setAttackOptions} />
          </div>

          <div>
            <CryptoFlow
              plaintextEntered={plaintextEntered}
              encrypted={encrypted}
              attacked={attacked}
              verified={result ? (result.integrity && result.authentication && result.replaySafe) : undefined}
              algorithms={algorithmsUsed}
            />
          </div>
        </div>

        <ResultViewer result={result} />
      </div>
    </main>
  )
}