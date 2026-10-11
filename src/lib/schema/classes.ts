import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';

export const classes = sqliteTable('classes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	grade: text('grade'),
	year: integer('year'),
	waliKelasId: integer('wali_kelas_id') // optional link to guru user
}, (t) => ({
	tenantIdx: index('classes_tenant_idx').on(t.tenantId)
}));

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
