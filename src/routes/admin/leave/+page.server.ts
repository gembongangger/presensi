import { fail } from '@sveltejs/kit';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { attendance, leaveRequests, parents, students, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const studentUser = alias(users, 'student_user');
	const parentUser = alias(users, 'parent_user');

	const rows = await locals.db
		.select({
			id: leaveRequests.id,
			studentName: studentUser.fullName,
			leaveType: leaveRequests.leaveType,
			startDate: leaveRequests.startDate,
			endDate: leaveRequests.endDate,
			reason: leaveRequests.reason,
			status: leaveRequests.status,
			notes: leaveRequests.notes,
			parentName: parentUser.fullName
		})
		.from(leaveRequests)
		.innerJoin(students, eq(leaveRequests.studentId, students.id))
		.innerJoin(studentUser, eq(students.userId, studentUser.id))
		.leftJoin(parents, eq(leaveRequests.parentId, parents.id))
		.leftJoin(parentUser, eq(parents.userId, parentUser.id))
		.where(eq(leaveRequests.tenantId, tenant.id))
		.orderBy(desc(leaveRequests.createdAt));

	return { requests: rows };
};

async function applyAttendance(
	db: App.Locals['db'],
	tenantId: number,
	studentId: number,
	start: Date,
	end: Date,
	status: 'izin' | 'sakit'
) {
	const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
	const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
	while (cursor <= last) {
		const dayStart = new Date(cursor);
		const dayEnd = new Date(cursor.getTime() + 86_400_000);
		const [existing] = await db
			.select({ id: attendance.id })
			.from(attendance)
			.where(
				and(
					eq(attendance.studentId, studentId),
					gte(attendance.date, dayStart),
					lte(attendance.date, dayEnd)
				)
			)
			.limit(1);
		if (!existing) {
			await db.insert(attendance).values({
				tenantId,
				studentId,
				date: dayStart,
				status,
				notes: 'Dari pengajuan izin'
			});
		}
		cursor.setDate(cursor.getDate() + 1);
	}
}

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id)) return fail(400, { error: 'ID tidak valid' });

		const [row] = await locals.db
			.select()
			.from(leaveRequests)
			.where(eq(leaveRequests.id, id))
			.limit(1);
		if (!row || row.tenantId !== tenant.id) return fail(404, { error: 'Pengajuan tidak ditemukan' });

		await locals.db
			.update(leaveRequests)
			.set({ status: 'approved', approvedBy: locals.user!.id, approvedAt: new Date(), notes: String(form.get('notes') ?? '') || null })
			.where(eq(leaveRequests.id, id));

		const status = row.leaveType === 'sakit' ? 'sakit' : 'izin';
		await applyAttendance(
			locals.db,
			tenant.id,
			row.studentId,
			new Date(row.startDate),
			new Date(row.endDate),
			status
		);
		return { success: true };
	},
	reject: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id)) return fail(400, { error: 'ID tidak valid' });

		const [row] = await locals.db
			.select({ tenantId: leaveRequests.tenantId })
			.from(leaveRequests)
			.where(eq(leaveRequests.id, id))
			.limit(1);
		if (!row || row.tenantId !== tenant.id) return fail(404, { error: 'Pengajuan tidak ditemukan' });

		await locals.db
			.update(leaveRequests)
			.set({ status: 'rejected', approvedBy: locals.user!.id, approvedAt: new Date(), notes: String(form.get('notes') ?? '') || null })
			.where(eq(leaveRequests.id, id));
		return { success: true };
	}
};
