import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const HOME: Record<string, string> = {
	superadmin: '/superadmin',
	admin: '/admin',
	guru: '/guru',
	siswa: '/siswa',
	wali: '/wali'
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	throw redirect(303, HOME[locals.user.role] ?? '/login');
};
