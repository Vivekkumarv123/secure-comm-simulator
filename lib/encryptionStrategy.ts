/**
 * encryptionStrategy.ts
 * Module 2: Encryption Module
 *
 * Strategy pattern for multiple encryption techniques:
 * - Classical Encryption (Caesar Cipher - Educational)
 * - Symmetric Encryption (AES-GCM)
 * - Asymmetric Encryption (RSA-OAEP)
 */

import { encryptAES, decryptAES } from "./crypto/aes"
import { rsaEncrypt, rsaDecrypt } from "./crypto/rsa"

// ========== CLASSICAL ENCRYPTION (Educational Demo) ==========

/**
 * Caesar Cipher - Simple substitution cipher
 * Shifts each character by n positions
 */
export class CaesarCipherStrategy {
  private shift: number

  constructor(shift: number = 3) {
    this.shift = shift % 26
  }

  encrypt(plaintext: string): string {
    return plaintext
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0)

        // Uppercase letters
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(
            ((code - 65 + this.shift) % 26) + 65
          )
        }

        // Lowercase letters
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(
            ((code - 97 + this.shift) % 26) + 97
          )
        }

        // Non-alphabetic characters remain unchanged
        return char
      })
      .join("")
  }

  decrypt(ciphertext: string): string {
    return new CaesarCipherStrategy(-this.shift).encrypt(
      ciphertext
    )
  }
}

// ========== SYMMETRIC ENCRYPTION STRATEGY ==========

export interface SymmetricEncryptionResult {
  ciphertext: string // Base64 encoded
  iv: string // Base64 encoded
  algorithm: "AES-GCM"
}

export class AESEncryptionStrategy {
  async encrypt(
    plaintext: string,
    key: CryptoKey
  ): Promise<SymmetricEncryptionResult> {
    const { cipher, iv } = await encryptAES(plaintext, key)

    return {
      ciphertext: Buffer.from(cipher).toString("base64"),
      iv: Buffer.from(iv).toString("base64"),
      algorithm: "AES-GCM",
    }
  }

  async decrypt(
    ciphertext: string,
    iv: string,
    key: CryptoKey
  ): Promise<string> {
    const cipherBuffer = Buffer.from(ciphertext, "base64")
    const ivBuffer = Buffer.from(iv, "base64")

    return decryptAES(cipherBuffer.buffer, ivBuffer, key)
  }
}

// ========== ASYMMETRIC ENCRYPTION STRATEGY ==========

export interface AsymmetricEncryptionResult {
  ciphertext: string // Base64 encoded
  algorithm: "RSA-OAEP"
  keySize: number
}

export class RSAEncryptionStrategy {
  async encrypt(
    plaintext: string,
    publicKey: CryptoKey
  ): Promise<AsymmetricEncryptionResult> {
    const cipher = await rsaEncrypt(plaintext, publicKey)

    return {
      ciphertext: Buffer.from(cipher).toString("base64"),
      algorithm: "RSA-OAEP",
      keySize: 2048,
    }
  }

  async decrypt(
    ciphertext: string,
    privateKey: CryptoKey
  ): Promise<string> {
    const cipherBuffer = Buffer.from(ciphertext, "base64")
    return rsaDecrypt(cipherBuffer.buffer, privateKey)
  }
}

// ========== UNIFIED ENCRYPTION INTERFACE ==========

export type EncryptionMethod = "caesar" | "aes" | "rsa"

export interface EncryptedMessage {
  method: EncryptionMethod
  payload: string
  metadata: Record<string, unknown>
}

export interface DecryptionOptions {
  key?: CryptoKey
  shift?: number // For Caesar cipher
}

export class EncryptionManager {
  private caesarStrategy = new CaesarCipherStrategy()
  private aesStrategy = new AESEncryptionStrategy()
  private rsaStrategy = new RSAEncryptionStrategy()

  /**
   * Encrypt message using specified method
   */
  async encrypt(
    plaintext: string,
    method: EncryptionMethod,
    options: {
      key?: CryptoKey
      shift?: number
    } = {}
  ): Promise<EncryptedMessage> {
    switch (method) {
      case "caesar": {
        const shift = options.shift || 3
        const strategy = new CaesarCipherStrategy(shift)
        return {
          method: "caesar",
          payload: strategy.encrypt(plaintext),
          metadata: { shift },
        }
      }

      case "aes": {
        if (!options.key) throw new Error("AES requires CryptoKey")
        const result = await this.aesStrategy.encrypt(
          plaintext,
          options.key
        )
        return {
          method: "aes",
          payload: JSON.stringify(result),
          metadata: { algorithm: "AES-GCM", keySize: 256 },
        }
      }

      case "rsa": {
        if (!options.key) throw new Error("RSA requires CryptoKey")
        const result = await this.rsaStrategy.encrypt(
          plaintext,
          options.key
        )
        return {
          method: "rsa",
          payload: JSON.stringify(result),
          metadata: { algorithm: "RSA-OAEP", keySize: 2048 },
        }
      }

      default:
        throw new Error(`Unknown encryption method: ${method}`)
    }
  }

  /**
   * Decrypt message using specified method
   */
  async decrypt(
    encrypted: EncryptedMessage,
    options: DecryptionOptions = {}
  ): Promise<string> {
    switch (encrypted.method) {
      case "caesar": {
        const shift = (encrypted.metadata.shift as number) || 3
        const strategy = new CaesarCipherStrategy(shift)
        return strategy.decrypt(encrypted.payload)
      }

      case "aes": {
        if (!options.key) throw new Error("AES requires CryptoKey")
        const data = JSON.parse(
          encrypted.payload
        ) as SymmetricEncryptionResult
        return this.aesStrategy.decrypt(
          data.ciphertext,
          data.iv,
          options.key
        )
      }

      case "rsa": {
        if (!options.key) throw new Error("RSA requires CryptoKey")
        const data = JSON.parse(
          encrypted.payload
        ) as AsymmetricEncryptionResult
        return this.rsaStrategy.decrypt(data.ciphertext, options.key)
      }

      default:
        throw new Error(
          `Unknown encryption method: ${encrypted.method}`
        )
    }
  }
}

export const encryptionManager = new EncryptionManager()
