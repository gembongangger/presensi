import { and, count, desc, eq, gte, lt } from 'drizzle-orm';
import { attendance, classes, leaveRequests, parents, students, teachers, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const db = locals.db;
	const tid = tenant.id;

	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(start.getTime() + 86_400_000);

	const [
		[studentCount],
		[classCount],
		[teacherCount],
		[parentCount],
		[leaveCount],
		today
	] = await Promise.all([
		db.select({ c: count() }).from(students).where(eq(students.tenantId, tid)),
		db.select({ c: count() }).from(classes).where(eq(classes.tenantId, tid)),
		db.select({ c: count() }).from(teachers).where(eq(teachers.tenantId, tid)),
		db.select({ c: count() }).from(parents).where(eq(parents.tenantId, tid)),
		db
			.select({ c: count() })
			.from(leaveRequests)
			.where(and(eq(leaveRequests.tenantId, tid), eq(leaveRequests.status, 'pending'))),
		db
			.select({ status: attendance.status })
			.from(attendance)
			.where(and(eq(attendance.tenantId, tid), gte(attendance.date, start), lt(attendance.date, end)))
	]);

	const summary = { hadir: 0, izin: 0, sakit: 0, alpa: 0 } as Record<string, number>;
	for (const row of today) summary[row.status] = (summary[row.status] ?? 0) + 1;

	const recentLeave = await db
		.select({
			id: leaveRequests.id,
			type: leaveRequests.leaveType,
			status: leaveRequests.status,
			start: leaveRequests.startDate,
			end: leaveRequests.endDate,
			reason: leaveRequests.reason,
			studentName: users.fullName
		})
		.from(leaveRequests)
		.innerJoin(students, eq(leaveRequests.studentId, students.id))
		.innerJoin(users, eq(students.userId, users.id))
		.where(eq(leaveRequests.tenantId, tid))
		.orderBy(desc(leaveRequests.createdAt))
		.limit(5);

	return {
		stats: {
			students: studentCount?.c ?? 0,
			classes: classCount?.c ?? 0,
			teachers: teacherCount?.c ?? 0,
			parents: parentCount?.c ?? 0,
			pendingLeave: leaveCount?.c ?? 0,
			today: summary
		},
		recentLeave
	};
};
