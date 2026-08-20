import type { Context, Next } from 'hono'
import { verify } from 'jsonwebtoken'

export type AuthUser = {
  id: number
  email: string
  role: string
}

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header('Authorization')

  if (!authorization) {
    return c.json(
      {
        message: 'Authorization header is required',
      },
      401,
    )
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return c.json(
      {
        message: 'Invalid authorization format',
      },
      401,
    )
  }

  try {
    const payload = verify(
      token,
      process.env.JWT_SECRET!,
    ) as {
      sub: string
      email: string
      role: string
    }

    const user: AuthUser = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    }

    c.set('user', user)

    await next()
  } catch {
    return c.json(
      {
        message: 'Invalid or expired token',
      },
      401,
    )
  }
}

export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthUser | undefined

    if (!user) {
      return c.json(
        {
          message: 'Authentication required',
        },
        401,
      )
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          message: 'Forbidden: insufficient permissions',
        },
        403,
      )
    }

    await next()
  }
}