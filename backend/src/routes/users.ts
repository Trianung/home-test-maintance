import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { z } from 'zod'

import { db } from '../db'
import { users } from '../db/schema'
import {
    authMiddleware,
    requireRole,
} from '../middleware/auth'

const userRoutes = new Hono()

/*
 * GET /api/users
 * Admin only
 */
userRoutes.get(
    '/',
    authMiddleware,
    requireRole('admin'),
    async (c) => {
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .orderBy(desc(users.createdAt))

        return c.json(result)
    },
)

userRoutes.post(
    '/',
    authMiddleware,
    requireRole('admin'),
    async (c) => {
        try {
            const body = await c.req.json()

            const schema = z.object({
                name: z.string().min(1).max(100),
                email: z.string().email().max(255),
                password: z.string().min(8),
                role: z.enum([
                    'admin',
                    'supervisor',
                    'operator',
                ]),
            })

            const validation = schema.safeParse(body)

            if (!validation.success) {
                return c.json(
                    {
                        message: 'Validation failed',
                        errors:
                            validation.error.flatten().fieldErrors,
                    },
                    400,
                )
            }

            const {
                name,
                email,
                password,
                role,
            } = validation.data

            const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1)

            if (existingUser.length > 0) {
                return c.json(
                    {
                        message: 'Email already registered',
                    },
                    409,
                )
            }

            const passwordHash = await hash(password, 10)

            const result = await db
                .insert(users)
                .values({
                    name,
                    email,
                    passwordHash,
                    role,
                })
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: users.role,
                    isActive: users.isActive,
                })

            return c.json(
                {
                    message: 'User created successfully',
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
    },
)

userRoutes.put(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    async (c) => {
        try {
            const id = Number(c.req.param('id'))

            if (!Number.isInteger(id)) {
                return c.json(
                    {
                        message: 'Invalid user ID',
                    },
                    400,
                )
            }

            const body = await c.req.json()

            const schema = z.object({
                name: z.string().min(1).max(100),
                email: z.string().email().max(255),
                role: z.enum([
                    'admin',
                    'supervisor',
                    'operator',
                ]),
            })

            const validation = schema.safeParse(body)

            if (!validation.success) {
                return c.json(
                    {
                        message: 'Validation failed',
                        errors:
                            validation.error.flatten().fieldErrors,
                    },
                    400,
                )
            }

            const { name, email, role } = validation.data

            // Cek apakah user ada
            const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1)

            if (existingUser.length === 0) {
                return c.json(
                    {
                        message: 'User not found',
                    },
                    404,
                )
            }

            // Cek email digunakan user lain
            const emailUser = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1)

            if (
                emailUser.length > 0 &&
                emailUser[0].id !== id
            ) {
                return c.json(
                    {
                        message: 'Email already registered',
                    },
                    409,
                )
            }

            const result = await db
                .update(users)
                .set({
                    name,
                    email,
                    role,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, id))
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: users.role,
                    isActive: users.isActive,
                    updatedAt: users.updatedAt,
                })

            return c.json({
                message: 'User updated successfully',
                data: result[0],
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
    },
)

userRoutes.patch(
    '/:id/deactivate',
    authMiddleware,
    requireRole('admin'),
    async (c) => {
        try {
            const id = Number(c.req.param('id'))

            if (!Number.isInteger(id)) {
                return c.json(
                    {
                        message: 'Invalid user ID',
                    },
                    400,
                )
            }

            const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1)

            if (existingUser.length === 0) {
                return c.json(
                    {
                        message: 'User not found',
                    },
                    404,
                )
            }

            const result = await db
                .update(users)
                .set({
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, id))
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: users.role,
                    isActive: users.isActive,
                    updatedAt: users.updatedAt,
                })

            return c.json({
                message: 'User deactivated successfully',
                data: result[0],
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
    },
)

export default userRoutes