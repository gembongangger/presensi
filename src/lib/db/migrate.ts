import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../schema';

const DB_PATH = process.env.DATABASE_PATH ?? './data/app.db';

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: './src/lib/db/drizzle' });
sqlite.close();
console.log(`Migrasi selesai untuk ${DB_PATH}`);
