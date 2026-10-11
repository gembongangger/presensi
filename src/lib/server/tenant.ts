import { error } from '@sveltejs/kit';
import type { Tenant } from '#lib/schema';

export function requireTenant(locals: App.Locals): Tenant {
	if (!locals.tenant) {
		throw error(403, 'Lembaga tidak ditemukan untuk akun ini.');
	}
	return locals.tenant;
}
