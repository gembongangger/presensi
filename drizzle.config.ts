import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/schema/index.ts',
	out: './src/lib/db/drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: './data/app.db'
	}
});
