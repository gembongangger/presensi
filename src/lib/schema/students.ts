import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';
import { users } from './users';
import { classes } from './classes';

export const students = sqliteTable('students', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	classId: integer('class_id').references(() => classes.id),
	divisi: text('divisi'),
	nis: text('nis'),
	nisn: text('nisn'),
	phone: text('phone'),
	address: text('address')
}, (t) => ({
	tenantIdx: index('students_tenant_idx').on(t.tenantId),
	userIdx: index('students_user_idx').on(t.userId)
}));

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
