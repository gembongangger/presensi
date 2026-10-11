import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { settings } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import { isValidCoordinate } from '#lib/server/geo';
import type { Actions, PageServerLoad } from './$types';

async function getSettings(db: App.Locals['db'], tid: number) {
	let [row] = await db.select().from(settings).where(eq(settings.tenantId, tid)).limit(1);
	if (!row) {
		const [created] = await db
			.insert(settings)
			.values({ tenantId: tid, radius: 100, workingHoursStart: '07:00', workingHoursEnd: '15:00' })
			.returning();
		row = created;
	}
	return row;
}

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	return { settings: await getSettings(locals.db, tenant.id) };
};

function num(value: FormDataEntryValue | null): number | null {
	if (value == null || value === '') return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const form = await request.formData();

		const lat = num(form.get('lat'));
		const lng = num(form.get('lng'));
		if ((lat != null || lng != null) && !isValidCoordinate(lat, lng)) {
			return fail(400, { error: 'Koordinat lokasi tidak valid' });
		}

		const radius = num(form.get('radius'));
		if (radius != null && radius < 10) {
			return fail(400, { error: 'Radius minimal 10 meter' });
		}

		await locals.db
			.update(settings)
			.set({
				schoolName: String(form.get('schoolName') ?? '').trim() || null,
				address: String(form.get('address') ?? '').trim() || null,
				phone: String(form.get('phone') ?? '').trim() || null,
				lat,
				lng,
				radius: radius ?? 100,
				divisions: String(form.get('divisions') ?? '').trim() || null,
				workingHoursStart: String(form.get('workingHoursStart') ?? '').trim() || null,
				workingHoursEnd: String(form.get('workingHoursEnd') ?? '').trim() || null
			})
			.where(eq(settings.tenantId, tenant.id));

		return { success: true };
	}
};
