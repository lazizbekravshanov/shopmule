/**
 * Migration script: Hash all existing plaintext PINs in the database.
 *
 * Usage: npx tsx web/scripts/hash-existing-pins.ts
 */
import { PrismaClient } from '@prisma/client'
import { hashPin } from '../lib/pin-utils'

const prisma = new PrismaClient()

async function main() {
  const employees = await prisma.employeeProfile.findMany({
    where: { pin: { not: null } },
    select: { id: true, name: true, pin: true },
  })

  let migrated = 0
  let skipped = 0

  for (const emp of employees) {
    if (!emp.pin) continue

    // Already hashed — skip
    if (emp.pin.startsWith('$2a$') || emp.pin.startsWith('$2b$')) {
      skipped++
      continue
    }

    const hashed = await hashPin(emp.pin)
    await prisma.employeeProfile.update({
      where: { id: emp.id },
      data: { pin: hashed },
    })

    console.log(`Hashed PIN for: ${emp.name} (${emp.id})`)
    migrated++
  }

  console.log(`\nDone. Migrated: ${migrated}, Already hashed: ${skipped}, Total: ${employees.length}`)
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
