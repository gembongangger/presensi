import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { students } from './students';
import { parents } from './parents';

export const leaveTypes = ['izin', 'sakit', 'lainnya'] as const;
export type LeaveType = typeof leaveTypes[number];
export const leaveStatuses = ['pending', 'approved', 'rejected'] as const;
export type LeaveStatus = typeof leaveStatuses[number];

export const leaveRequests = sqliteTable('leave_requests', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	studentId: integer('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	parentId: integer('parent_id').references(() => parents.id),
	leaveType: text('leave_type', { enum: leaveTypes }).notNull().default('izin'),
	startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
	endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
	reason: text('reason').notNull(),
	status: text('status', { enum: leaveStatuses }).notNull().default('pending'),
	approvedBy: integer('approved_by'), // user id (admin/guru)
	approvedAt: integer('approved_at', { mode: 'timestamp' }),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now')*1000)`)
}, (t) => ({
	tenantIdx: index('leave_tenant_idx').on(t.tenantId),
	studentIdx: index('leave_student_idx').on(t.studentId),
	statusIdx: index('leave_status_idx').on(t.status)
}));

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
