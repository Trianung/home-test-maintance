import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sign } from 'jsonwebtoken'
import app from '../src/app'

// Mock the database to prevent real DB queries during routing tests
vi.mock('../src/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      id: 1,
      machineAssetId: 'TEST-001',
      problemDescription: 'Broken fan',
      priority: 'LOW',
      status: 'SUBMITTED',
      createdBy: 999, // Created by a different user
      createdAt: new Date(),
      updatedAt: new Date(),
    }]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }
}))

// Helper to generate a JWT token for testing
function generateToken(user: { id: number; email: string; role: string }) {
  return sign(
    { sub: user.id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET!
  )
}

const OPERATOR_TOKEN = generateToken({ id: 1, email: 'operator@test.com', role: 'operator' })
const SUPERVISOR_TOKEN = generateToken({ id: 2, email: 'supervisor@test.com', role: 'supervisor' })
const ADMIN_TOKEN = generateToken({ id: 3, email: 'admin@test.com', role: 'admin' })

describe('RBAC Matrix (requests.ts)', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Operator role', () => {
    it('cannot approve a request', async () => {
      const res = await app.request('/api/requests/1/approve', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPERATOR_TOKEN}` }
      })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.message).toMatch(/cannot approve/)
    })

    it('cannot reject a request', async () => {
      const res = await app.request('/api/requests/1/reject', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPERATOR_TOKEN}` }
      })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.message).toMatch(/cannot reject/)
    })

    it('cannot delete another user\'s request', async () => {
      const res = await app.request('/api/requests/1', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${OPERATOR_TOKEN}` }
      })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.message).toMatch(/only delete your own/)
    })

    it('cannot edit another user\'s request', async () => {
      const res = await app.request('/api/requests/1', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${OPERATOR_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority: 'HIGH' })
      })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.message).toMatch(/only edit your own/)
    })
  })

  describe('Supervisor role', () => {
    it('can approve a request', async () => {
      const res = await app.request('/api/requests/1/approve', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPERVISOR_TOKEN}` }
      })
      // Status should be 200 (Success) since it bypassed the 403 check
      expect(res.status).toBe(200)
    })

    it('can reject a request', async () => {
      const res = await app.request('/api/requests/1/reject', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPERVISOR_TOKEN}` }
      })
      expect(res.status).toBe(200)
    })

    // Supervisor doesn't have specific block logic in current requests.ts for delete, 
    // Wait, the requests.ts says if (user.role === 'operator') then blocks.
    // If user.role === 'supervisor', it does NOT block delete?
    // Let's check requests.ts DELETE method:
    // It only checks if (user.role === 'operator'). It doesn't block supervisor explicitly.
    // Actually, maybe Supervisor CAN delete because it's not blocked?
    // If the requirements are "Supervisor cannot delete", the implementation in requests.ts might have a bug.
    // Let's write the test based on what the user wants: "Supervisor cannot delete".
    it('cannot delete a request', async () => {
      const res = await app.request('/api/requests/1', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPERVISOR_TOKEN}` }
      })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.message).toMatch(/supervisors cannot delete/)
    })
  })

  describe('Admin role', () => {
    it('can delete a request', async () => {
      const res = await app.request('/api/requests/1', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      })
      expect(res.status).toBe(200) // Assumes success because DB is mocked and no 403
    })
  })

})
