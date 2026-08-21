import { describe, it, expect, vi } from 'vitest'
import app from '../src/app'

// Mock the database module
vi.mock('../src/db', () => ({
  db: {
    // Mock for health check: db.execute(sql`SELECT 1`)
    execute: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    // Keep the other mocks for RBAC tests that also import this module
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}))

describe('Health Check Endpoint', () => {
  it('GET /api/health returns 200 when database is reachable', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.status).toBe('healthy')
    expect(data.services.api).toBe('up')
    expect(data.services.database).toBe('up')
    expect(data.timestamp).toBeDefined()
    expect(data.uptime).toBeDefined()
  })

  it('GET /api/health returns 503 when database is unreachable', async () => {
    // Temporarily make the db.execute mock reject
    const { db } = await import('../src/db')
    const executeMock = vi.mocked(db.execute)
    executeMock.mockRejectedValueOnce(new Error('Connection refused'))

    const res = await app.request('/api/health')
    expect(res.status).toBe(503)

    const data = await res.json()
    expect(data.status).toBe('unhealthy')
    expect(data.services.api).toBe('up')
    expect(data.services.database).toBe('down')
    expect(data.error).toBe('Connection refused')
  })

  it('does not require authentication', async () => {
    // No Authorization header — should still succeed (not 401)
    const res = await app.request('/api/health')
    expect(res.status).not.toBe(401)
  })
})
