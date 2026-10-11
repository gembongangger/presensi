import { sqliteTable, integer, text, real, index } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';
import { students } from './students';

export const attendanceStatus = ['hadir', 'izin', 'sakit', 'alpa'] as const;
export type AttendanceStatus = typeof attendanceStatus[number];

export const attendance = sqliteTable('attendance', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
	studentId: integer('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	date: integer('date', { mode: 'timestamp' }).notNull(), // start of day
	checkInAt: integer('check_in_at', { mode: 'timestamp' }),
	checkOutAt: integer('check_out_at', { mode: 'timestamp' }),
	status: text('status', { enum: attendanceStatus }).notNull().default('hadir'),
	lat: real('lat'),
	lng: real('lng'),
	radiusOk: integer('radius_ok', { mode: 'boolean' }).default(true),
	notes: text('notes')
}, (t) => ({
	tenantIdx: index('attendance_tenant_idx').on(t.tenantId),
	studentIdx: index('attendance_student_idx').on(t.studentId),
	dateIdx: index('attendance_date_idx').on(t.date)
}));

export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
