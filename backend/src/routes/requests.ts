import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'

import { db } from '../db'
import { maintenanceRequests } from '../db/schema'
import { authMiddleware } from '../middleware/auth'

const requests = new Hono()

requests.get('/', authMiddleware, async (c) => {
  const user = c.get('user')

  if (user.role === 'operator') {
    const result = await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.createdBy, user.id))
      .orderBy(desc(maintenanceRequests.createdAt))

    return c.json(result)
  }

  const result = await db
    .select()
    .from(maintenanceRequests)
    .orderBy(desc(maintenanceRequests.createdAt))

  return c.json(result)
})

export default requests