import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { SESSION_SECRET } from '$app/env/private';
import { users, tenantUsers, tenants } from '#lib/schema';
import { verifyPassword } from '#lib/server/auth/password';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '#lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	email: z.string().trim().toLowerCase().email('Email tidak valid'),
	password: z.string().min(1, 'Password wajib diisi')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) throw redirect(303, '/dashboard');
	return { redirectTo: url.searchParams.get('redirect') ?? '/dashboard' };
};

export const actions: Actions = {
	default: async ({ request, cookies, url, locals }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(form);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Data tidak valid', email: String(form.email ?? '') });
		}
		const { email, password } = parsed.data;

		const [user] = await locals.db.select().from(users).where(eq(users.email, email)).limit(1);
		if (!user || !user.isActive) {
			return fail(400, { error: 'Email atau password salah', email });
		}

		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) {
			return fail(400, { error: 'Email atau password salah', email });
		}

		let tid: number | null = null;
		if (user.role !== 'superadmin') {
			const [membership] = await locals.db
				.select({ tenantId: tenantUsers.tenantId, active: tenants.isActive })
				.from(tenantUsers)
				.innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
				.where(eq(tenantUsers.userId, user.id))
				.limit(1);
			if (!membership) {
				return fail(403, { error: 'Akun ini tidak terdaftar pada lembaga manapun', email });
			}
			if (!membership.active) {
				return fail(403, { error: 'Lembaga Anda tidak aktif. Hubungi superadmin.', email });
			}
			tid = membership.tenantId;
		}

		const token = await createSession(
			{ uid: user.id, tid, role: user.role },
			SESSION_SECRET
		);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions(url.protocol === 'https:'));

		throw redirect(303, url.searchParams.get('redirect') ?? '/dashboard');
	}
};
