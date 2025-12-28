/**
 * mitm.ts
 * Module 5: Attack Simulation Module - Man-in-the-Middle Attack
 *
 * Demonstrates MITM attack where attacker intercepts and
 * modifies communication between two parties.
 */

export interface AttackerContext {
  attackerId: string
  interceptedMessages: Map<string, string>
  replacedKeys: Map<string, CryptoKey>
  createdAt: number
}

const activeAttacks = new Map<string, AttackerContext>()

/**
 * Simulate key replacement attack
 */
export function replacePublicKey(
  originalKey: CryptoKey,
  attackerKey: CryptoKey,
  attackId?: string
): { replacedKey: CryptoKey; attackId: string } {
  const id = attackId || `mitm-${Date.now()}`

  if (!activeAttacks.has(id)) {
    activeAttacks.set(id, {
      attackerId: id,
      interceptedMessages: new Map(),
      replacedKeys: new Map(),
      createdAt: Date.now(),
    })
  }

  const attack = activeAttacks.get(id)!
  attack.replacedKeys.set(`original`, originalKey)

  return { replacedKey: attackerKey, attackId: id }
}

/**
 * Get active attacks
 */
export function getActiveAttacks(): string[] {
  return Array.from(activeAttacks.keys())
}

/**
 * Get attack details
 */
export function getAttackDetails(attackId: string): AttackerContext | undefined {
  return activeAttacks.get(attackId)
}

/**
 * End attack
 */
export function endAttack(attackId: string): boolean {
  return activeAttacks.delete(attackId)
}
