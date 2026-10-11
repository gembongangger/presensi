import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { attendance, classes, students, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import type { PageServerLoad } from './$types';

function parseDate(value: string | null): Date {
	if (value) {
		const d = new Date(`${value}T00:00:00`);
		if (!Number.isNaN(d.getTime())) return d;
	}
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenant = requireTenant(locals);
	const day = parseDate(url.searchParams.get('date'));
	const end = new Date(day.getTime() + 86_400_000);

	const rows = await locals.db
		.select({
			id: attendance.id,
			studentName: users.fullName,
			className: classes.name,
			status: attendance.status,
			checkInAt: attendance.checkInAt,
			checkOutAt: attendance.checkOutAt,
			radiusOk: attendance.radiusOk
		})
		.from(attendance)
		.innerJoin(students, eq(attendance.studentId, students.id))
		.innerJoin(users, eq(students.userId, users.id))
		.leftJoin(classes, eq(students.classId, classes.id))
		.where(and(eq(attendance.tenantId, tenant.id), gte(attendance.date, day), lt(attendance.date, end)))
		.orderBy(asc(users.fullName));

	const summary = { hadir: 0, izin: 0, sakit: 0, alpa: 0 } as Record<string, number>;
	for (const r of rows) summary[r.status] = (summary[r.status] ?? 0) + 1;

	return { date: day.toISOString().slice(0, 10), rows, summary };
};
