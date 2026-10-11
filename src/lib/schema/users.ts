import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userRoles = ['superadmin', 'admin', 'guru', 'siswa', 'wali'] as const;
export type UserRole = typeof userRoles[number];

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	fullName: text('full_name').notNull(),
	role: text('role', { enum: userRoles }).notNull().default('admin'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now')*1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now')*1000)`)
}, (t) => ({
	emailIdx: index('users_email_idx').on(t.email)
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
