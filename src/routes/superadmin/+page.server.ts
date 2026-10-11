import { fail } from '@sveltejs/kit';
import { asc, countDistinct, eq } from 'drizzle-orm';
import { students, tenants, tenantUsers } from '#lib/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await locals.db
		.select({
			id: tenants.id,
			name: tenants.name,
			slug: tenants.slug,
			address: tenants.address,
			phone: tenants.phone,
			isActive: tenants.isActive,
			createdAt: tenants.createdAt,
			userCount: countDistinct(tenantUsers.id),
			studentCount: countDistinct(students.id)
		})
		.from(tenants)
		.leftJoin(tenantUsers, eq(tenantUsers.tenantId, tenants.id))
		.leftJoin(students, eq(students.tenantId, tenants.id))
		.groupBy(tenants.id)
		.orderBy(asc(tenants.name));
	return { tenants: rows };
};

export const actions: Actions = {
	toggle: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id)) return fail(400, { error: 'ID tidak valid' });
		const [row] = await locals.db
			.select({ isActive: tenants.isActive })
			.from(tenants)
			.where(eq(tenants.id, id))
			.limit(1);
		if (!row) return fail(404, { error: 'Lembaga tidak ditemukan' });
		await locals.db.update(tenants).set({ isActive: !row.isActive }).where(eq(tenants.id, id));
		return { success: true };
	}
};
