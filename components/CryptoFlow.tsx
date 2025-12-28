"use client"

interface CryptoFlowProps {
    plaintextEntered: boolean
    encrypted: boolean
    attacked: boolean
    verified?: boolean
    algorithms: string[]
}

export default function CryptoFlow({
    plaintextEntered,
    encrypted,
    attacked,
    verified,
    algorithms,
}: CryptoFlowProps) {
    return (
        <div className="p-4 border rounded space-y-3">
            <h2 className="font-semibold">Crypto Flow Visualization</h2>

            <FlowStep
                label="Plaintext Message"
                status={plaintextEntered ? "done" : "pending"}
                description={
                    plaintextEntered
                        ? "Message entered by user"
                        : "Waiting for user input"
                }
            />

            <FlowStep
                label="Encryption"
                status={encrypted ? "done" : "pending"}
                description="Message encrypted before transmission"
            />

            <FlowStep
                label="Authentication"
                status={encrypted ? "done" : "pending"}
                description="Integrity and authenticity added"
            />

            <FlowStep
                label="Attack Simulation"
                status={attacked ? "failed" : "done"}
                description={
                    attacked
                        ? "Attack attempted on message"
                        : "No attack detected"
                }
            />

            <FlowStep
                label="Verification"
                status={
                    verified === undefined
                        ? "pending"
                        : verified
                            ? "done"
                            : "failed"
                }
                description={
                    verified === undefined
                        ? "Waiting for verification"
                        : verified
                            ? "Integrity, authentication, and freshness verified"
                            : "Verification failed (integrity/authentication/replay)"
                }
            />


            {/* 🔐 Algorithms Used */}
            <div className="pt-3 border-t">
                <h3 className="text-sm font-semibold">
                    Cryptographic Algorithms Used
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-300">
                    {algorithms.length === 0 ? (
                        <li>No algorithms executed yet</li>
                    ) : (
                        algorithms.map((algo) => (
                            <li key={algo}>{algo}</li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}

interface FlowStepProps {
    label: string
    description: string
    status: "done" | "pending" | "failed"
}

function FlowStep({ label, description, status }: FlowStepProps) {
    const color =
        status === "done"
            ? "text-green-600"
            : status === "failed"
                ? "text-red-600"
                : "text-gray-500"

    return (
        <div className="flex gap-3">
            <span className={`font-bold ${color}`}>
                {status === "done" ? "✔" : status === "failed" ? "✖" : "…"}
            </span>
            <div>
                <p className={`font-medium ${color}`}>{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    )
}
