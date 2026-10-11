import { fail } from '@sveltejs/kit';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { attendance, classes, students, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import { dayRange, formatDateInput, getRollCall, parseDateInput, saveRollCall } from '#lib/server/presensi';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenant = requireTenant(locals);
	const day = parseDateInput(url.searchParams.get('date'));
	const { start, end } = dayRange(day);

	const [rows, rollCall] = await Promise.all([
		locals.db
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
			.where(
				and(eq(attendance.tenantId, tenant.id), gte(attendance.date, start), lt(attendance.date, end))
			)
			.orderBy(asc(users.fullName)),
		getRollCall(locals.db, tenant.id, day)
	]);

	const summary = { hadir: 0, izin: 0, sakit: 0, alpa: 0 } as Record<string, number>;
	for (const r of rows) summary[r.status] = (summary[r.status] ?? 0) + 1;

	return { date: formatDateInput(day), rows, summary, rollCall };
};

export const actions: Actions = {
	manual: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();
		const date = parseDateInput(String(form.get('date') ?? ''));

		const entries = [];
		for (const key of form.keys()) {
			const m = /^status_(\d+)$/.exec(key);
			if (!m) continue;
			const studentId = Number(m[1]);
			entries.push({
				studentId,
				status: String(form.get(key) ?? ''),
				checkInAt: String(form.get(`in_${studentId}`) ?? ''),
				checkOutAt: String(form.get(`out_${studentId}`) ?? ''),
				notes: String(form.get(`notes_${studentId}`) ?? '')
			});
		}

		const { saved } = await saveRollCall(locals.db, tenant.id, date, entries);
		return { success: true, message: `Presensi disimpan untuk ${saved} siswa pada ${formatDateInput(date)}.` };
	}
};