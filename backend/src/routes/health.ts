import { Hono } from 'hono'
import { db } from '../db'
import { sql } from 'drizzle-orm'

const health = new Hono()

health.get('/', async (c) => {
  const uptime = process.uptime()
  const timestamp = new Date().toISOString()

  try {
    // Ping the database with a simple query
    await db.execute(sql`SELECT 1`)

    return c.json({
      status: 'healthy',
      timestamp,
      uptime: `${Math.floor(uptime)}s`,
      services: {
        api: 'up',
        database: 'up',
      },
    })
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy',
        timestamp,
        uptime: `${Math.floor(uptime)}s`,
        services: {
          api: 'up',
          database: 'down',
        },
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      503,
    )
  }
})

export default health
