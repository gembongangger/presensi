import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tenants = sqliteTable('tenants', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	address: text('address'),
	phone: text('phone'),
	logoUrl: text('logo_url'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now')*1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now')*1000)`)
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
