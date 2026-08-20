import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  name: varchar('name', {
    length: 100,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  }).notNull().unique(),

  passwordHash: varchar('password_hash', {
    length: 255,
  }).notNull(),

  role: varchar('role', {
    length: 20,
  }).notNull(),

  isActive: boolean('is_active')
    .notNull()
    .default(true),

  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow(),
})

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: serial('id').primaryKey(),

  machineAssetId: varchar('machine_asset_id', {
    length: 100,
  }).notNull(),

  problemDescription: text('problem_description').notNull(),

  priority: varchar('priority', {
    length: 20,
  }).notNull(),

  status: varchar('status', {
    length: 20,
  }).notNull().default('SUBMITTED'),

  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),

  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(),

  lastReviewedBy: integer('last_reviewed_by')
    .references(() => users.id),

  lastReviewedAt: timestamp('last_reviewed_at'),

  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow(),
})