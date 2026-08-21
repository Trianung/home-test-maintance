import 'dotenv/config'
import { db } from './index'
import { users, maintenanceRequests } from './schema'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('Starting database seed...')

  // === IDEMPOTENT CHECK ===
  // Cek apakah seed sudah pernah dijalankan (cek admin user)
  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, 'admin@example.com'))
    .limit(1)

  if (existingAdmin.length > 0) {
    console.log('Seed already ran — skipping to prevent duplicate data.')
    return
  }

  // Hash passwords
  const adminPassword = await hash('Admin123!', 10)
  const supervisorPassword = await hash('Supervisor123!', 10)
  const operatorPassword = await hash('Operator123!', 10)

  // Insert users
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: adminPassword,
        role: 'admin',
      },
      {
        name: 'Supervisor',
        email: 'supervisor@example.com',
        passwordHash: supervisorPassword,
        role: 'supervisor',
      },
      {
        name: 'Operator',
        email: 'operator@example.com',
        passwordHash: operatorPassword,
        role: 'operator',
      },
    ])
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })

  console.log('Users created:')
  console.table(insertedUsers)

  // Get user IDs
  const admin = insertedUsers.find((user) => user.role === 'admin')
  const supervisor = insertedUsers.find(
    (user) => user.role === 'supervisor',
  )
  const operator = insertedUsers.find(
    (user) => user.role === 'operator',
  )

  if (!admin || !supervisor || !operator) {
    throw new Error('Failed to create seed users')
  }

  // Insert maintenance requests
  const insertedRequests = await db
    .insert(maintenanceRequests)
    .values([
      {
        machineAssetId: 'MC-001',
        problemDescription: 'Motor mesin mengalami suhu tinggi',
        priority: 'HIGH',
        status: 'SUBMITTED',
        createdBy: operator.id,
      },
      {
        machineAssetId: 'MC-002',
        problemDescription: 'Terdapat suara abnormal pada mesin',
        priority: 'MEDIUM',
        status: 'APPROVED',
        createdBy: operator.id,
        lastReviewedBy: supervisor.id,
        lastReviewedAt: new Date(),
      },
      {
        machineAssetId: 'MC-003',
        problemDescription: 'Sensor mesin tidak membaca dengan baik',
        priority: 'LOW',
        status: 'REJECTED',
        createdBy: operator.id,
        lastReviewedBy: supervisor.id,
        lastReviewedAt: new Date(),
      },
    ])
    .returning()

  console.log('Maintenance requests created:')
  console.table(insertedRequests)

  console.log('Seed completed successfully!')
}

seed()
  .catch((error) => {
    console.error('Seed failed:')
    console.error(error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })