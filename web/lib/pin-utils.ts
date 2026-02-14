import bcrypt from 'bcryptjs'

const PIN_SALT_ROUNDS = 10

/**
 * Hash a plaintext PIN using bcrypt.
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, PIN_SALT_ROUNDS)
}

/**
 * Verify a plaintext PIN against a bcrypt hash.
 * Returns true if the PIN matches the stored hash,
 * or if the stored value is plaintext (legacy) and matches directly.
 */
export async function verifyPin(pin: string, storedPin: string): Promise<boolean> {
  // bcrypt hashes always start with $2a$ or $2b$
  if (storedPin.startsWith('$2a$') || storedPin.startsWith('$2b$')) {
    return bcrypt.compare(pin, storedPin)
  }
  // Legacy plaintext comparison (for un-migrated PINs)
  return pin === storedPin
}
