import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { students, teachers, tenantUsers, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import { hashPassword } from '#lib/server/auth/password';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	fullName: z.string().trim().min(3, 'Nama minimal 3 karakter'),
	email: z.string().trim().toLowerCase().email('Email tidak valid'),
	password: z.string().min(8, 'Password minimal 8 karakter'),
	nip: z.string().trim().optional().default(''),
	phone: z.string().trim().optional().default('')
});

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const list = await locals.db
		.select({
			id: teachers.id,
			name: users.fullName,
			email: users.email,
			nip: teachers.nip,
			phone: teachers.phone
		})
		.from(teachers)
		.innerJoin(users, eq(teachers.userId, users.id))
		.where(eq(teachers.tenantId, tenant.id))
		.orderBy(asc(users.fullName));
	return { teachers: list };
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
		const [dup] = await locals.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, data.email))
			.limit(1);
		if (dup) return fail(400, { error: 'Email sudah terdaftar' });

		const passwordHash = await hashPassword(data.password);
		const [user] = await locals.db
			.insert(users)
			.values({ email: data.email, passwordHash, fullName: data.fullName, role: 'guru' })
			.returning({ id: users.id });
		await locals.db.insert(teachers).values({
			tenantId: tenant.id,
			userId: user.id,
			nip: data.nip || null,
			phone: data.phone || null
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
			.select({ userId: teachers.userId, tenantId: teachers.tenantId })
			.from(teachers)
			.where(eq(teachers.id, id))
			.limit(1);
		if (!row || row.tenantId !== tenant.id) return fail(403, { error: 'Tidak diizinkan' });
		await locals.db.delete(teachers).where(eq(teachers.id, id));
		await locals.db.delete(users).where(eq(users.id, row.userId));
		return { success: true };
	}
};
