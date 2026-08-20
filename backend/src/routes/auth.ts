import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { sign } from 'jsonwebtoken'
import { compare } from 'bcryptjs'

import { db } from '../db'
import { users } from '../db/schema'
import { authMiddleware } from '../middleware/auth' 
const auth = new Hono()

// Route Login 
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()

    const { email, password } = body

    if (!email || !password) {
      return c.json(
        {
          message: 'Email and password are required',
        },
        400,
      )
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    const user = result[0]

    if (!user) {
      return c.json(
        {
          message: 'Invalid email or password',
        },
        401,
      )
    }

    if (!user.isActive) {
      return c.json(
        {
          message: 'User account is inactive',
        },
        403,
      )
    }

    const passwordValid = await compare(
      password,
      user.passwordHash,
    )

    if (!passwordValid) {
      return c.json(
        {
          message: 'Invalid email or password',
        },
        401,
      )
    }

    const token = sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '8h',
      },
    )

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
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

// Route Middleware
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')

  return c.json({
    user,
  })
})

export default auth