import { fail } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { leaveRequests, parents, students, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	studentId: z.coerce.number().int().positive('Pilih siswa'),
	leaveType: z.enum([ 'izin', 'sakit', 'lainnya' ]),
	startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
	endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
	reason: z.string().trim().min(3, 'Alasan minimal 3 karakter')
});

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const uid = locals.user!.id;

	const linkRows = await locals.db
		.select({
			parentId: parents.id,
			studentId: students.id,
			name: users.fullName,
			className: students.classId
		})
		.from(parents)
		.innerJoin(students, eq(parents.studentId, students.id))
		.innerJoin(users, eq(students.userId, users.id))
		.where(and(eq(parents.tenantId, tenant.id), eq(parents.userId, uid)));

	const parentIds = linkRows.map((r) => r.parentId);
	let requests: {
		id: number;
		leaveType: string;
		startDate: Date;
		endDate: Date;
		reason: string;
		status: string;
		studentName: string;
	}[] = [];

	if (parentIds.length > 0) {
		const rows = await locals.db
			.select({
				id: leaveRequests.id,
				leaveType: leaveRequests.leaveType,
				startDate: leaveRequests.startDate,
				endDate: leaveRequests.endDate,
				reason: leaveRequests.reason,
				status: leaveRequests.status,
				studentName: users.fullName
			})
			.from(leaveRequests)
			.innerJoin(students, eq(leaveRequests.studentId, students.id))
			.innerJoin(users, eq(students.userId, users.id))
			.where(and(eq(leaveRequests.tenantId, tenant.id), inArray(leaveRequests.parentId, parentIds)))
			.orderBy(desc(leaveRequests.createdAt));
		requests = rows;
	}

	return {
		children: linkRows.map((r) => ({ id: r.studentId, name: r.name })),
		requests
	};
};

function parseDate(value: string): Date | null {
	const d = new Date(`${value}T00:00:00`);
	return Number.isNaN(d.getTime()) ? null : d;
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const uid = locals.user!.id;
		const raw = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' });
		}
		const data = parsed.data;

		const start = parseDate(data.startDate);
		const end = parseDate(data.endDate);
		if (!start || !end) return fail(400, { error: 'Format tanggal tidak valid' });
		if (end < start) return fail(400, { error: 'Tanggal selesai harus setelah tanggal mulai' });

		const [link] = await locals.db
			.select({ parentId: parents.id })
			.from(parents)
			.where(
				and(
					eq(parents.tenantId, tenant.id),
					eq(parents.userId, uid),
					eq(parents.studentId, data.studentId)
				)
			)
			.limit(1);
		if (!link) return fail(403, { error: 'Siswa bukan anak Anda' });

		await locals.db.insert(leaveRequests).values({
			tenantId: tenant.id,
			studentId: data.studentId,
			parentId: link.parentId,
			leaveType: data.leaveType,
			startDate: start,
			endDate: end,
			reason: data.reason,
			status: 'pending'
		});
		return { success: true };
	}
};
