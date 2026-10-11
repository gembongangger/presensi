import type { DB } from '#lib/server/db';
import type { Tenant, User } from '#lib/schema';

declare global {
	namespace App {
		interface Error {
			message?: string;
		}
		interface Locals {
			db: DB;
			user: User | null;
			tenant: Tenant | null;
		}
		interface PageData {
			user: User | null;
			tenant: Tenant | null;
		}
		interface Platform {
			env: {
				DB: unknown;
				SESSION_SECRET?: string;
				[ key: string ]: unknown;
			};
			context?: unknown;
			cf?: unknown;
		}
	}
}

export {};
