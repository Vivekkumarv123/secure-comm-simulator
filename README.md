# 🔐 Secure Communication Simulator

A comprehensive **educational security simulator** demonstrating modern cryptographic techniques, common network attacks, and defensive mechanisms — fully aligned with the **OSI Security Architecture** and standard **Cryptography & Network Security syllabus**.

> ⚠️ **Disclaimer**:  
> This project is strictly for **educational purposes**. It is **not production-ready** and should not be used for real-world security-critical systems without professional review.

---

## 📌 Project Overview

The **Secure Communication Simulator** is a full-stack, browser-based application that allows users to:

- Encrypt messages using modern cryptography
- Simulate real-world security attacks
- Verify integrity, authenticity, and freshness
- Visualize cryptographic workflows step-by-step
- Understand how layered security works in practice

The system is modular, type-safe, and intentionally designed to **demonstrate concepts**, not hide them.

---

## 🧱 Architecture Summary

The project is organized into **7 interconnected modules**:

```
┌─────────────────────────────────────────────────────────┐
│        Module 1: User Interface Module (UI/UX)          │
│    Components: MessageInput, AttackToggle, CryptoFlow   │
└──────────────────────┬──────────────────────────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
┌────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ Module 2  │  │  Module 3   │  │  Module 4   │
│Encryption │  │Authentication│  │Key Management│
│  (AES,    │  │  & Hashing   │  │ (RSA, ECDH) │
│  RSA,     │  │  (SHA, HMAC, │  │             │
│ Caesar)   │  │  Signatures) │  │             │
└────┬──────┘  └──────┬──────┘  └──────┬──────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
     ┌────────────────┼────────────────┐
     │                │                │
┌────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ Module 5  │  │  Module 6   │  │  Module 7   │
│ Attacks   │  │Verification │  │Communication│
│(Tamper,   │  │  & Detection│  │  (Relay,    │
│ Replay,   │  │             │  │  Logging)   │
│  MITM)    │  │             │  │             │
└───────────┘  └─────────────┘  └─────────────┘
```


---

## 🧩 Module Breakdown

---

### ✅ Module 1: User Interface (UI)

**Location:** `app/page.tsx`, `components/*`

**Features**
- Message input & submission
- Attack toggles (Tamper / Replay / MITM)
- Crypto flow visualization
- Verification result viewer
- Session ID tracking

**Key Components**
- `MessageInput`
- `AttackToggle`
- `CryptoFlow`
- `ResultViewer`

---

### 🔐 Module 2: Encryption

**Location:**  
- `lib/crypto/*`  
- `lib/encryptionStrategy.ts`

**Supported Algorithms**

| Type | Algorithm | Purpose |
|----|----|----|
Classical | Caesar Cipher | Educational demo |
Symmetric | AES-256-GCM | Confidentiality + Integrity |
Asymmetric | RSA-OAEP | Public-key encryption |
Key Exchange | ECDH (P-256) | Shared key derivation |

**Design Pattern**
- Strategy Pattern via `EncryptionManager`

---

### 🔑 Module 3: Authentication & Hashing

**Location:** `lib/authenticationService.ts`, `lib/crypto/hash.ts`

**Capabilities**
- SHA-256 hashing
- HMAC-SHA256
- RSA-PSS digital signatures
- Authenticated message creation
- Timestamp-based freshness validation

---

### 🗝️ Module 4: Key Management

**Location:** `lib/keyManagement.ts`

**Features**
- RSA encryption & signature keys
- AES session keys
- ECDH key pairs
- Key expiration & cleanup
- Session isolation
- Public/private key separation

---

### ⚠️ Module 5: Attack Simulation

**Location:** `lib/attacks/*`

**Attacks Implemented**

#### 🧨 Tampering
- Bit flipping
- Byte swapping
- Cipher truncation

#### 🔁 Replay
- Nonce reuse detection
- Timestamp validation
- Cleanup of expired nonces

#### 🕵️ MITM
- Public key replacement
- Key interception simulation
- Attack lifecycle management

---

### 🛡️ Module 6: Verification & Detection

**Location:** `lib/verificationService.ts`

**Checks Performed**
- Integrity (hash comparison)
- Authentication (signature/HMAC)
- Replay protection (nonce)
- Freshness (timestamp & clock skew)

**Outputs**
- Risk score (0–100%)
- Status: SAFE / SUSPICIOUS / COMPROMISED
- Detected attacks with evidence

---

### 🌐 Module 7: Communication Backend

**Location:**  
- `lib/communicationService.ts`  
- `app/api/*`

**Key Principles**
- No plaintext storage
- Encrypted payload relay
- Temporary buffer (5 min retention)
- Encrypted audit logging
- Attack statistics tracking

**API Endpoints**
- `POST /api/relay`
- `POST /api/verify`
- `GET /api/health`

---

## Security Flow Diagram

```
┌─────────────┐
│   Message   │
└──────┬──────┘
       │
       ▼
┌────────────────────────┐
│ Module 2: Encryption   │ ◄─── Module 4: Keys
│   ├─ Nonce generation  │
│   ├─ AES-GCM encrypt   │
│   └─ IV generation     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Module 3: Auth & Hash  │
│   ├─ SHA-256 hash      │
│   ├─ HMAC (optional)   │
│   └─ RSA-PSS sign      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Module 1: UI           │
│   └─ Display payload   │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Module 7: Relay API    │ ◄─── Module 5: Attacks
│   ├─ Attack injection  │
│   ├─ Message forwarding│
│   └─ Logging           │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Client-side Decrypt    │
│   ├─ Receive payload   │
│   ├─ AES-GCM decrypt   │
│   └─ Extract plaintext │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Module 6: Verification │
│   ├─ Hash comparison   │
│   ├─ Sig verification  │
│   ├─ Nonce check       │
│   └─ Timestamp check   │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Final Result          │
│  ✅ SAFE / ⚠️ SUSPICIOUS│
│  ❌ COMPROMISED        │
└────────────────────────┘
```

---

## 🧪 Testing Scenarios

### ✅ Normal Flow
- All attacks OFF
- Message encrypts, decrypts, and verifies successfully

### ❌ Tamper Attack
- Cipher modified
- Integrity fails
- Status: COMPROMISED

### ❌ Replay Attack
- Nonce reused
- Replay detected
- Status: COMPROMISED

### ❌ MITM Attack
- Key mismatch
- Signature invalid
- Status: COMPROMISED

---

## 🧠 Cryptographic Algorithms Used

- UUID Nonce (Replay Protection)
- AES-256-GCM (Symmetric Encryption)
- SHA-256 (Integrity)
- HMAC-SHA256 (MAC)
- RSA-OAEP (Public-key encryption)
- RSA-PSS (Digital Signatures)
- ECDH (Key Exchange)

> These algorithms operate **together as layered security**, not individually.

---

## 📖 References

- NIST Cryptographic Standards
- RFC 8017 (RSA)
- RFC 4106 (AES-GCM)
- RFC 2104 (HMAC)
- OWASP Secure Communication Guidelines
- ISO 10181 (OSI Security Architecture)

---

## 📜 License

MIT License — Educational Use Only