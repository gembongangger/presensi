import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { SESSION_SECRET } from '$app/env/private';
import { tenants, users, tenantUsers, settings } from '#lib/schema';
import { hashPassword } from '#lib/server/auth/password';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '#lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter'),
	email: z.string().trim().toLowerCase().email('Email tidak valid'),
	password: z.string().min(8, 'Password minimal 8 karakter'),
	schoolName: z.string().trim().min(3, 'Nama lembaga minimal 3 karakter'),
	address: z.string().trim().optional().default(''),
	phone: z.string().trim().optional().default('')
});

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40) || 'lembaga';
}

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(303, '/dashboard');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, url, locals }) => {
		const raw = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
				values: { fullName: raw.fullName, email: raw.email, schoolName: raw.schoolName, address: raw.address, phone: raw.phone }
			});
		}
		const data = parsed.data;

		const [existingUser] = await locals.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, data.email))
			.limit(1);
		if (existingUser) {
			return fail(400, { error: 'Email sudah terdaftar', values: { ...data, password: '' } });
		}

		const base = toSlug(data.schoolName);
		let slug = base;
		for (let i = 2; i < 50; i++) {
			const [taken] = await locals.db
				.select({ id: tenants.id })
				.from(tenants)
				.where(eq(tenants.slug, slug))
				.limit(1);
			if (!taken) break;
			slug = `${base}-${i}`;
		}

		const passwordHash = await hashPassword(data.password);

		const [tenant] = await locals.db
			.insert(tenants)
			.values({
				slug,
				name: data.schoolName,
				address: data.address || null,
				phone: data.phone || null
			})
			.returning({ id: tenants.id });

		const [user] = await locals.db
			.insert(users)
			.values({
				email: data.email,
				passwordHash,
				fullName: data.fullName,
				role: 'admin'
			})
			.returning({ id: users.id });

		await locals.db.insert(tenantUsers).values({ tenantId: tenant.id, userId: user.id });
		await locals.db.insert(settings).values({
			tenantId: tenant.id,
			schoolName: data.schoolName,
			address: data.address || null,
			phone: data.phone || null,
			radius: 100,
			workingHoursStart: '07:00',
			workingHoursEnd: '15:00'
		});

		const token = await createSession(
			{ uid: user.id, tid: tenant.id, role: 'admin' },
			SESSION_SECRET
		);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions(url.protocol === 'https:'));

		throw redirect(303, '/admin/settings');
	}
};
