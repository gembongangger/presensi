<script lang="ts">
	import { enhance } from '$app/forms';

	let { form }: { form?: { error?: string; values?: Record<string, string> } } = $props();
</script>

<svelte:head>
	<title>Daftar Lembaga — Presensi Siswa</title>
</svelte:head>

<div class="auth-wrap">
	<div class="auth-card" style="max-width: 520px;">
		<div class="brand">Daftarkan Lembaga</div>
		<p class="sub">Buat akun admin sekolah sekaligus lembaganya</p>

		{#if form?.error}
			<div class="flash error">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="field">
				<label for="fullName">Nama admin</label>
				<input id="fullName" name="fullName" required value={form?.values?.fullName ?? ''} />
			</div>
			<div class="field">
				<label for="email">Email admin</label>
				<input id="email" name="email" type="email" required value={form?.values?.email ?? ''} autocomplete="email" />
			</div>
			<div class="field">
				<label for="password">Password (min. 8 karakter)</label>
				<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" />
			</div>
			<div class="field">
				<label for="schoolName">Nama lembaga / sekolah</label>
				<input id="schoolName" name="schoolName" required value={form?.values?.schoolName ?? ''} />
			</div>
			<div class="form-row">
				<div class="field">
					<label for="phone">Telepon</label>
					<input id="phone" name="phone" value={form?.values?.phone ?? ''} />
				</div>
				<div class="field">
					<label for="address">Alamat</label>
					<input id="address" name="address" value={form?.values?.address ?? ''} />
				</div>
			</div>
			<button type="submit" style="width:100%;">Daftar</button>
		</form>

		<p class="muted center" style="margin-top:1.25rem; font-size:0.9rem;">
			Sudah punya akun? <a href="/login">Masuk</a>
		</p>
	</div>
</div>
