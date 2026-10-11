import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { parents, students, tenantUsers, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import { hashPassword } from '#lib/server/auth/password';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	fullName: z.string().trim().min(3, 'Nama minimal 3 karakter'),
	email: z.string().trim().toLowerCase().email('Email tidak valid'),
	password: z.string().min(8, 'Password minimal 8 karakter'),
	relationship: z.string().trim().optional().default(''),
	studentId: z.coerce.number().int().positive('Pilih siswa')
});

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const parentUser = alias(users, 'parent_user');
	const studentUser = alias(users, 'student_user');

	const [list, studentList] = await Promise.all([
		locals.db
			.select({
				id: parents.id,
				name: parentUser.fullName,
				email: parentUser.email,
				relationship: parents.relationship,
				studentName: studentUser.fullName
			})
			.from(parents)
			.innerJoin(parentUser, eq(parents.userId, parentUser.id))
			.innerJoin(students, eq(parents.studentId, students.id))
			.innerJoin(studentUser, eq(students.userId, studentUser.id))
			.where(eq(parents.tenantId, tenant.id))
			.orderBy(asc(parentUser.fullName)),
		locals.db
			.select({ id: students.id, name: users.fullName })
			.from(students)
			.innerJoin(users, eq(students.userId, users.id))
			.where(eq(students.tenantId, tenant.id))
			.orderBy(asc(users.fullName))
	]);
	return { parents: list, students: studentList };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const raw = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' });
		}
		const data = parsed.data;

		const [student] = await locals.db
			.select({ id: students.id, tenantId: students.tenantId })
			.from(students)
			.where(eq(students.id, data.studentId))
			.limit(1);
		if (!student || student.tenantId !== tenant.id) {
			return fail(400, { error: 'Siswa tidak ditemukan pada lembaga ini' });
		}

		const [dup] = await locals.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, data.email))
			.limit(1);
		if (dup) return fail(400, { error: 'Email sudah terdaftar' });

		const passwordHash = await hashPassword(data.password);
		const [user] = await locals.db
			.insert(users)
			.values({ email: data.email, passwordHash, fullName: data.fullName, role: 'wali' })
			.returning({ id: users.id });

		await locals.db.insert(parents).values({
			tenantId: tenant.id,
			userId: user.id,
			studentId: student.id,
			relationship: data.relationship || null
		});
		await locals.db.insert(tenantUsers).values({ tenantId: tenant.id, userId: user.id });
		return { success: true };
	},
	remove: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id)) return fail(400, { error: 'ID tidak valid' });
		const [row] = await locals.db
			.select({ userId: parents.userId, tenantId: parents.tenantId })
			.from(parents)
			.where(eq(parents.id, id))
			.limit(1);
		if (!row || row.tenantId !== tenant.id) return fail(403, { error: 'Tidak diizinkan' });
		await locals.db.delete(parents).where(eq(parents.id, id));
		await locals.db.delete(users).where(eq(users.id, row.userId));
		return { success: true };
	}
};
