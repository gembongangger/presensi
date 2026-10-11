import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';

const useCloudflare =
	process.env.ADAPTER === 'cloudflare' ||
	!!process.env.CF_PAGES ||
	!!process.env.WORKERS_CI ||
	!!process.env.CI;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// `ADAPTER=cloudflare` builds for Cloudflare (Pages/Workers + D1).
			// Otherwise the auto adapter is used, which keeps local dev on
			// better-sqlite3.
			adapter: useCloudflare
				? adapterCloudflare({
						platformProxy: { configPath: 'wrangler.jsonc', persist: true }
					})
				: adapterAuto()
		})
	],
	// The native better-sqlite3 driver is only used locally and must never be
	// bundled into the Cloudflare Worker build.
	ssr: { external: [ 'better-sqlite3' ] },
	optimizeDeps: { exclude: [ 'better-sqlite3' ] }
});
