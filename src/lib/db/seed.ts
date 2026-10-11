import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { users } from '../schema';
import { hashPassword } from '../server/auth/password';

const DB_PATH = process.env.DATABASE_PATH ?? './data/app.db';
const EMAIL = process.env.SUPERADMIN_EMAIL ?? 'superadmin@presensi.local';
const PASSWORD = process.env.SUPERADMIN_PASSWORD ?? 'superadmin123';
const FULL_NAME = process.env.SUPERADMIN_NAME ?? 'Super Admin';

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

async function main() {
	const [existing] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, EMAIL))
		.limit(1);

	if (existing) {
		console.log(`Superadmin ${EMAIL} sudah ada (id ${existing.id}).`);
		return;
	}

	const passwordHash = await hashPassword(PASSWORD);
	await db.insert(users).values({
		email: EMAIL,
		passwordHash,
		fullName: FULL_NAME,
		role: 'superadmin'
	});
	console.log(`Superadmin dibuat: ${EMAIL} / ${PASSWORD}`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})
	.finally(() => sqlite.close());
