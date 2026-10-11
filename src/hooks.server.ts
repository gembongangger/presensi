import type { Handle } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { SESSION_SECRET } from '$app/env/private';
import { getDb } from '#lib/server/db';
import { loadUserContext } from '#lib/server/auth/context';
import { SESSION_COOKIE, verifySession } from '#lib/server/auth/session';

const ROLE_GUARDS: { prefix: string; roles: string[] }[] = [
	{ prefix: '/superadmin', roles: [ 'superadmin' ] },
	{ prefix: '/admin', roles: [ 'admin' ] },
	{ prefix: '/guru', roles: [ 'guru', 'admin' ] },
	{ prefix: '/siswa', roles: [ 'siswa' ] },
	{ prefix: '/wali', roles: [ 'wali' ] }
];

const PUBLIC_PREFIXES = [ '/login', '/register', '/logout' ];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = await getDb(event.platform);
	event.locals.user = null;
	event.locals.tenant = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const session = await verifySession(token, SESSION_SECRET);
		if (session) {
			const context = await loadUserContext(event.locals.db, session.uid, session.tid);
			event.locals.user = context.user;
			event.locals.tenant = context.tenant;
		} else {
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		}
	}

	const path = event.url.pathname;
	const isPublic = path === '/' || PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

	if (!isPublic) {
		const guard = ROLE_GUARDS.find((g) => path === g.prefix || path.startsWith(`${g.prefix}/`));
		if (guard) {
			if (!event.locals.user) {
				throw redirect(303, `/login?redirect=${encodeURIComponent(path)}`);
			}
			if (!guard.roles.includes(event.locals.user.role)) {
				throw redirect(303, '/dashboard');
			}
			if (event.locals.user.role !== 'superadmin' && !event.locals.tenant) {
				throw redirect(303, '/login?error=tenant');
			}
		}
	}

	return resolve(event);
};
