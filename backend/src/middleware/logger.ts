import type { Context, Next } from 'hono'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  method: string
  path: string
  status?: number
  duration?: string
  message?: string
  userId?: number
  userRole?: string
  ip?: string
  error?: string
}

/**
 * Outputs a structured JSON log line to stdout.
 */
export function log(level: LogLevel, data: Omit<LogEntry, 'timestamp' | 'level'>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    ...data,
  }
  const line = JSON.stringify(entry)

  if (level === 'error') {
    console.error(line)
  } else {
    console.log(line)
  }
}

/**
 * Hono middleware that logs every request/response as structured JSON.
 *
 * Output example:
 * {"timestamp":"2026-08-21T02:30:00.000Z","level":"info","method":"GET","path":"/api/requests","status":200,"duration":"12ms"}
 */
export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path

  await next()

  const duration = Date.now() - start
  const status = c.res.status

  // Grab user info if available (set by authMiddleware)
  const user = c.get('user') as { id: number; role: string } | undefined

  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  log(level, {
    method,
    path,
    status,
    duration: `${duration}ms`,
    ...(user ? { userId: user.id, userRole: user.role } : {}),
  })
}
