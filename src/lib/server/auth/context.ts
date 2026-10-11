import { and, eq } from 'drizzle-orm';
import { tenants, tenantUsers, users } from '#lib/schema';
import type { Tenant, User } from '#lib/schema';
import type { DB } from '#lib/server/db';

export interface UserContext {
	user: User | null;
	tenant: Tenant | null;
}

export async function loadUserContext(
	db: DB,
	uid: number,
	tid: number | null
): Promise<UserContext> {
	const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
	if (!user || !user.isActive) return { user: null, tenant: null };

	if (user.role === 'superadmin') {
		return { user, tenant: null };
	}

	const condition = tid
		? and(eq(tenantUsers.userId, uid), eq(tenantUsers.tenantId, tid))
		: eq(tenantUsers.userId, uid);

	const [row] = await db
		.select({ tenant: tenants })
		.from(tenantUsers)
		.innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
		.where(condition)
		.limit(1);

	return { user, tenant: row?.tenant ?? null };
}
