<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
</script>

<h1>Guru</h1>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Tersimpan.</div>{/if}

<div class="card">
	<h2>Tambah guru</h2>
	<form method="POST" action="?/create" use:enhance>
		<div class="form-row">
			<div class="field"><label for="fullName">Nama lengkap</label><input id="fullName" name="fullName" required /></div>
			<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /></div>
			<div class="field"><label for="password">Password awal</label><input id="password" name="password" type="password" minlength="8" required /></div>
		</div>
		<div class="form-row">
			<div class="field"><label for="nip">NIP</label><input id="nip" name="nip" /></div>
			<div class="field"><label for="phone">Telepon</label><input id="phone" name="phone" /></div>
		</div>
		<button type="submit">Tambah guru</button>
	</form>
</div>

<div class="card">
	<h2>Daftar guru ({data.teachers.length})</h2>
	{#if data.teachers.length === 0}
		<p class="muted">Belum ada guru.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Nama</th><th>Email</th><th>NIP</th><th>Telepon</th><th></th></tr></thead>
				<tbody>
					{#each data.teachers as t (t.id)}
						<tr>
							<td>{t.name}</td>
							<td class="muted">{t.email}</td>
							<td>{t.nip ?? '-'}</td>
							<td>{t.phone ?? '-'}</td>
							<td class="right">
								<form method="POST" action="?/remove" use:enhance style="display:inline;">
									<input type="hidden" name="id" value={t.id} />
									<button class="danger small" type="submit" onclick={(e) => !confirm('Hapus guru ini?') && e.preventDefault()}>Hapus</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
