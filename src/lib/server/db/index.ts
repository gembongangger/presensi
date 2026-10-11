import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from '#lib/schema';

export type DB = BetterSQLite3Database<typeof schema>;

const DB_PATH = process.env.DATABASE_PATH ?? './data/app.db';

let localDb: DB | null = null;

async function createLocalDb(): Promise<DB> {
	const { drizzle } = await import(/* @vite-ignore */ 'drizzle-orm/better-sqlite3');
	const { default: Database } = await import(/* @vite-ignore */ 'better-sqlite3');
	const sqlite = new Database(DB_PATH);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	return drizzle(sqlite, { schema });
}

/**
 * Returns a Drizzle database instance.
 *
 * - In production on Cloudflare Workers/Pages the D1 binding is used
 *   (`platform.env.DB`).
 * - Locally (vite dev / node) it falls back to a file backed SQLite
 *   database at `./data/app.db` via better-sqlite3.
 */
function isD1(db: unknown): db is D1Database {
	return !!db && typeof (db as { prepare?: unknown }).prepare === 'function';
}

/**
 * Resolves the D1 binding. adapter-cloudflare v8 does not expose the worker
 * `env` via `event.platform`, so we read it straight from the
 * `cloudflare:workers` module. Throws-free under plain Node/vite dev.
 */
async function resolveD1(platform?: App.Platform): Promise<D1Database | undefined> {
	const direct = platform?.env?.DB;
	if (isD1(direct)) return direct;
	try {
		// @ts-expect-error virtual module provided by Cloudflare runtime
		const mod = await import('cloudflare:workers');
		const env = mod?.env as App.Platform['env'] | undefined;
		if (env && isD1(env.DB)) return env.DB;
	} catch {
		// not running inside Workerd — local dev
	}
	return undefined;
}

export async function getDb(platform?: App.Platform): Promise<DB> {
	const d1 = await resolveD1(platform);
	if (d1) {
		const { drizzle } = await import('drizzle-orm/d1');
		return drizzle(d1, { schema }) as unknown as DB;
	}

	if (!localDb) {
		localDb = await createLocalDb();
	}
	return localDb;
}
