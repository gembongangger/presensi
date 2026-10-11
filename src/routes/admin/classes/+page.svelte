<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
</script>

<h1>Kelas</h1>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Tersimpan.</div>{/if}

<div class="card">
	<h2>Tambah kelas</h2>
	<form method="POST" action="?/create" use:enhance>
		<div class="form-row">
			<div class="field"><label for="name">Nama kelas</label><input id="name" name="name" required placeholder="X IPA 1" /></div>
			<div class="field"><label for="grade">Tingkat</label><input id="grade" name="grade" placeholder="10" /></div>
			<div class="field"><label for="year">Tahun</label><input id="year" name="year" type="number" placeholder="2026" /></div>
		</div>
		<button type="submit">Tambah</button>
	</form>
</div>

<div class="card">
	<h2>Daftar kelas</h2>
	{#if data.classes.length === 0}
		<p class="muted">Belum ada kelas.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Nama</th><th>Tingkat</th><th>Tahun</th><th></th></tr></thead>
				<tbody>
					{#each data.classes as c (c.id)}
						<tr>
							<td>{c.name}</td>
							<td>{c.grade ?? '-'}</td>
							<td>{c.year ?? '-'}</td>
							<td class="right">
								<form method="POST" action="?/remove" use:enhance style="display:inline;">
									<input type="hidden" name="id" value={c.id} />
									<button class="danger small" type="submit" onclick={(e) => !confirm('Hapus kelas ini?') && e.preventDefault()}>Hapus</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
