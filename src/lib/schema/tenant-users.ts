import { sqliteTable, integer, index } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';
import { users } from './users';

export const tenantUsers = sqliteTable('tenant_users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
}, (t) => ({
	tenantUserIdx: index('tenant_user_idx').on(t.tenantId, t.userId)
}));

export type TenantUser = typeof tenantUsers.$inferSelect;
export type NewTenantUser = typeof tenantUsers.$inferInsert;
