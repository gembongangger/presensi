import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { classes, users } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const list = await locals.db
		.select({ id: classes.id, name: classes.name, grade: classes.grade, year: classes.year })
		.from(classes)
		.where(eq(classes.tenantId, tenant.id))
		.orderBy(asc(classes.name));
	return { classes: list };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const grade = String(form.get('grade') ?? '').trim();
		const yearRaw = String(form.get('year') ?? '').trim();
		if (!name) return fail(400, { error: 'Nama kelas wajib diisi' });
		const year = yearRaw ? Number(yearRaw) : null;
		await locals.db.insert(classes).values({
			tenantId: tenant.id,
			name,
			grade: grade || null,
			year: year && Number.isFinite(year) ? year : null
		});
		return { success: true };
	},
	remove: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id)) return fail(400, { error: 'ID tidak valid' });
		await locals.db.delete(classes).where(eq(classes.id, id));
		return { success: true };
	}
};
