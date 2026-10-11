import { and, count, eq, gte, lt } from 'drizzle-orm';
import { attendance, classes, students } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const tid = tenant.id;

	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(start.getTime() + 86_400_000);

	const [[studentCount], [classCount], today] = await Promise.all([
		locals.db.select({ c: count() }).from(students).where(eq(students.tenantId, tid)),
		locals.db.select({ c: count() }).from(classes).where(eq(classes.tenantId, tid)),
		locals.db
			.select({ status: attendance.status })
			.from(attendance)
			.where(and(eq(attendance.tenantId, tid), gte(attendance.date, start), lt(attendance.date, end)))
	]);

	const summary = { hadir: 0, izin: 0, sakit: 0, alpa: 0 } as Record<string, number>;
	for (const r of today) summary[r.status] = (summary[r.status] ?? 0) + 1;

	return {
		stats: { students: studentCount?.c ?? 0, classes: classCount?.c ?? 0, today: summary }
	};
};
