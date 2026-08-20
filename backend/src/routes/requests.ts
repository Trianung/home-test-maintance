import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'

import { db } from '../db'
import { maintenanceRequests } from '../db/schema'
import { authMiddleware } from '../middleware/auth'

import { z } from 'zod'

const requests = new Hono()

requests.get('/', authMiddleware, async (c) => {
  const user = c.get('user')

  const status = c.req.query('status')
  const priority = c.req.query('priority')

  const validStatuses = ['SUBMITTED', 'APPROVED', 'REJECTED']
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  if (status && !validStatuses.includes(status)) {
    return c.json(
      {
        message: 'Invalid status filter',
      },
      400,
    )
  }

  if (priority && !validPriorities.includes(priority)) {
    return c.json(
      {
        message: 'Invalid priority filter',
      },
      400,
    )
  }

  const conditions = []

  // Filter berdasarkan role
  if (user.role === 'operator') {
    conditions.push(
      eq(maintenanceRequests.createdBy, user.id),
    )
  }

  // Filter status
  if (status) {
    conditions.push(
      eq(maintenanceRequests.status, status),
    )
  }

  // Filter priority
  if (priority) {
    conditions.push(
      eq(maintenanceRequests.priority, priority),
    )
  }

  const result = await db
    .select()
    .from(maintenanceRequests)
    .where(
      conditions.length > 0
        ? and(...conditions)
        : undefined,
    )
    .orderBy(desc(maintenanceRequests.createdAt))

  return c.json(result)
})

requests.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    const body = await c.req.json()

    const schema = z.object({
      machineAssetId: z
        .string()
        .min(1, 'Machine asset ID is required')
        .max(100),

      problemDescription: z
        .string()
        .min(1, 'Problem description is required'),

      priority: z.enum([
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL',
      ]),
    })

    const validation = schema.safeParse(body)

    if (!validation.success) {
      return c.json(
        {
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        400,
      )
    }

    const { machineAssetId, problemDescription, priority } =
      validation.data

    const result = await db
      .insert(maintenanceRequests)
      .values({
        machineAssetId,
        problemDescription,
        priority,
        status: 'SUBMITTED',
        createdBy: user.id,
      })
      .returning()

    return c.json(
      {
        message: 'Maintenance request created successfully',
        data: result[0],
      },
      201,
    )
  } catch (error) {
    console.error(error)

    return c.json(
      {
        message: 'Internal server error',
      },
      500,
    )
  }
})
requests.get('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id)) {
    return c.json(
      {
        message: 'Invalid request ID',
      },
      400,
    )
  }

  const result = await db
    .select()
    .from(maintenanceRequests)
    .where(eq(maintenanceRequests.id, id))
    .limit(1)

  const request = result[0]

  if (!request) {
    return c.json(
      {
        message: 'Maintenance request not found',
      },
      404,
    )
  }

  if (
    user.role === 'operator' &&
    request.createdBy !== user.id
  ) {
    return c.json(
      {
        message: 'Forbidden: you can only view your own requests',
      },
      403,
    )
  }

  return c.json(request)
})

export default requests