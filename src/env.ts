import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	SESSION_SECRET: {
		description: 'Rahasia untuk menandatangani cookie sesi (JWT).',
		schema: (value) => value ?? 'dev-secret-change-me'
	}
});
