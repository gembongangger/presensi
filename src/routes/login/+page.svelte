<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { form, data }: { form?: { error?: string; email?: string }; data: { redirectTo: string } } = $props();

	const tenantError = $derived(page.url.searchParams.get('error') === 'tenant');
</script>

<svelte:head>
	<title>Masuk — Presensi Siswa</title>
</svelte:head>

<div class="auth-wrap">
	<div class="auth-card">
		<div class="brand">Presensi Siswa</div>
		<p class="sub">Masuk ke akun Anda</p>

		{#if form?.error}
			<div class="flash error">{form.error}</div>
		{:else if tenantError}
			<div class="flash error">Akun tidak terhubung ke lembaga. Hubungi administrator.</div>
		{/if}

		<form method="POST" use:enhance>
			<input type="hidden" name="redirect" value={data.redirectTo} />
			<div class="field">
				<label for="email">Email</label>
				<input id="email" name="email" type="email" required value={form?.email ?? ''} autocomplete="email" />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" required autocomplete="current-password" />
			</div>
			<button type="submit" style="width:100%;">Masuk</button>
		</form>

		<p class="muted center" style="margin-top:1.25rem; font-size:0.9rem;">
			Belum punya akun? <a href="/register">Daftarkan lembaga &amp; admin</a>
		</p>
	</div>
</div>
