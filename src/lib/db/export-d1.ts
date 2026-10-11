import Database from 'better-sqlite3';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DB_PATH = process.env.DATABASE_PATH ?? './data/app.db';
const OUT_PATH = process.env.D1_SEED_PATH ?? 'seed-d1.sql';

/**
 * Urutan aman untuk FK:
 *  - DELETE: dari tabel yang direferensikan, mundur ke induknya.
 *  - INSERT: dari induk, maju ke tabel yang mereferensikan.
 */
const TABLE_ORDER = [
	'tenants',
	'users',
	'classes',
	'tenant_users',
	'settings',
	'students',
	'parents',
	'attendance',
	'leave_requests'
] as const;

const sqlite = new Database(DB_PATH);
sqlite.pragma('foreign_keys = ON');

function sqlLiteral(value: unknown): string {
	if (value === null || value === undefined) return 'NULL';
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) return 'NULL';
		return String(value);
	}
	if (typeof value === 'bigint') return value.toString();
	if (typeof value === 'boolean') return value ? '1' : '0';
	if (value instanceof Uint8Array) {
		return `X'${Buffer.from(value).toString('hex')}'`;
	}
	if (typeof value === 'string') {
		return `'${value.replace(/'/g, "''")}'`;
	}
	return "''";
}

function rowToInsert(table: string, row: Record<string, unknown>): string {
	const cols = Object.keys(row);
	const vals = cols.map((c) => sqlLiteral(row[c])).join(', ');
	return `INSERT INTO \`${table}\` (\`${cols.join('`, `')}\`) VALUES (${vals});`;
}

function buildSql(rowsByTable: Record<string, Record<string, unknown>[]>) {
	const deleteSql = [ ...TABLE_ORDER ].reverse().map((t) => `DELETE FROM \`${t}\`;`);

	const insertSql: string[] = [];
	for (const table of TABLE_ORDER) {
		for (const row of rowsByTable[table] ?? []) {
			insertSql.push(rowToInsert(table, row));
		}
	}

	return [
		'-- seed-d1.sql (dibuat otomatis oleh src/lib/db/export-d1.ts)',
		'-- Sumber: ' + DB_PATH,
		`-- Dihasilkan: ${new Date().toISOString()}`,
		'',
		'PRAGMA foreign_keys = OFF;',
		...deleteSql,
		'',
		...insertSql,
		'',
		'PRAGMA foreign_keys = ON;',
		''
	].join('\n');
}

function run() {
	const rowsByTable: Record<string, Record<string, unknown>[]> = {};
	for (const table of TABLE_ORDER) {
		if (!sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table)) {
			console.warn(`[skip] tabel ${table} tidak ada di ${DB_PATH}`);
			continue;
		}
		rowsByTable[table] = sqlite
			.prepare(`SELECT * FROM \`${table}\``)
			.all() as Record<string, unknown>[];
		const names = rowsByTable[table].map((r) => `id=${String(r.id)}`).join(', ');
		console.log(`[ok]   ${table}: ${rowsByTable[table].length} baris${names ? ` (${names})` : ''}`);
	}
	writeFileSync(OUT_PATH, buildSql(rowsByTable), 'utf8');
	console.log(`\nseed-d1.sql ditulis ke ${OUT_PATH}`);
}

try {
	run();
} finally {
	sqlite.close();
}