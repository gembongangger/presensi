import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';
import { users } from './users';
import { students } from './students';

export const parents = sqliteTable('parents', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	studentId: integer('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	relationship: text('relationship')
}, (t) => ({
	tenantIdx: index('parents_tenant_idx').on(t.tenantId),
	userIdx: index('parents_user_idx').on(t.userId),
	studentIdx: index('parents_student_idx').on(t.studentId)
}));

export type Parent = typeof parents.$inferSelect;
export type NewParent = typeof parents.$inferInsert;
