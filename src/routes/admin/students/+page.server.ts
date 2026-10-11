import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { classes, settings, students, tenantUsers, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import { hashPassword } from '#lib/server/auth/password';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	fullName: z.string().trim().min(3, 'Nama minimal 3 karakter'),
	email: z.string().trim().toLowerCase().email('Email tidak valid'),
	password: z.string().min(8, 'Password minimal 8 karakter'),
	nis: z.string().trim().optional().default(''),
	nisn: z.string().trim().optional().default(''),
	divisi: z.string().trim().optional().default(''),
	phone: z.string().trim().optional().default(''),
	address: z.string().trim().optional().default(''),
	classId: z.coerce.number().int().positive().nullable().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const [list, classList, cfg] = await Promise.all([
		locals.db
			.select({
				id: students.id,
				name: users.fullName,
				email: users.email,
				nis: students.nis,
				nisn: students.nisn,
				divisi: students.divisi,
				className: classes.name
			})
			.from(students)
			.innerJoin(users, eq(students.userId, users.id))
			.leftJoin(classes, eq(students.classId, classes.id))
			.where(eq(students.tenantId, tenant.id))
			.orderBy(asc(users.fullName)),
		locals.db
			.select({ id: classes.id, name: classes.name })
			.from(classes)
			.where(eq(classes.tenantId, tenant.id))
			.orderBy(asc(classes.name)),
		locals.db
			.select({ divisions: settings.divisions })
			.from(settings)
			.where(eq(settings.tenantId, tenant.id))
			.limit(1)
	]);

	function parseDivisions(s?: string | null) {
		if (!s) return [] as string[];
		return s
			.split(/[,\n\r]+/)
			.map((x) => x.trim())
			.filter(Boolean);
	}

	return { students: list, classes: classList, divisions: parseDivisions(cfg[0]?.divisions) };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const raw = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse({ ...raw, classId: raw.classId || null });
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
			.values({ email: data.email, passwordHash, fullName: data.fullName, role: 'siswa' })
			.returning({ id: users.id });

		await locals.db.insert(students).values({
			tenantId: tenant.id,
			userId: user.id,
			classId: data.classId ?? null,
			divisi: data.divisi || null,
			nis: data.nis || null,
			nisn: data.nisn || null,
			phone: data.phone || null,
			address: data.address || null
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
			.select({ userId: students.userId, tenantId: students.tenantId })
			.from(students)
			.where(eq(students.id, id))
			.limit(1);
		if (!row || row.tenantId !== tenant.id) return fail(403, { error: 'Tidak diizinkan' });
		await locals.db.delete(students).where(eq(students.id, id));
		await locals.db.delete(users).where(eq(users.id, row.userId));
		return { success: true };
	}
};
