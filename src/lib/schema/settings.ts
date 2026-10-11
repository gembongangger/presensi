import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';

export const settings = sqliteTable('settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().unique().references(() => tenants.id, { onDelete: 'cascade' }),
	schoolName: text('school_name'),
	address: text('address'),
	phone: text('phone'),
	lat: real('lat'),
	lng: real('lng'),
	radius: real('radius').default(100), // meters
	workingHoursStart: text('working_hours_start'), // HH:MM
	workingHoursEnd: text('working_hours_end')
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
