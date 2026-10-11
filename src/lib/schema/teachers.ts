import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';
import { users } from './users';

export const teachers = sqliteTable('teachers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	nip: text('nip'),
	phone: text('phone')
}, (t) => ({
	tenantIdx: index('teachers_tenant_idx').on(t.tenantId),
	userIdx: index('teachers_user_idx').on(t.userId)
}));

export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
