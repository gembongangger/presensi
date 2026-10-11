<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
</script>

<h1>Wali / Orang Tua</h1>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Tersimpan.</div>{/if}

<div class="card">
	<h2>Tambah wali</h2>
	<p class="muted">Hubungkan akun wali dengan seorang siswa agar dapat mengajukan izin.</p>
	<form method="POST" action="?/create" use:enhance>
		<div class="form-row">
			<div class="field"><label for="fullName">Nama wali</label><input id="fullName" name="fullName" required /></div>
			<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /></div>
			<div class="field"><label for="password">Password awal</label><input id="password" name="password" type="password" minlength="8" required /></div>
		</div>
		<div class="form-row">
			<div class="field">
				<label for="studentId">Siswa</label>
				<select id="studentId" name="studentId" required>
					<option value="">— pilih siswa —</option>
					{#each data.students as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
				</select>
			</div>
			<div class="field"><label for="relationship">Hubungan</label><input id="relationship" name="relationship" placeholder="Ayah / Ibu / Wali" /></div>
		</div>
		<button type="submit">Tambah wali</button>
	</form>
</div>

<div class="card">
	<h2>Daftar wali ({data.parents.length})</h2>
	{#if data.parents.length === 0}
		<p class="muted">Belum ada wali.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Nama</th><th>Email</th><th>Siswa</th><th>Hubungan</th><th></th></tr></thead>
				<tbody>
					{#each data.parents as p (p.id)}
						<tr>
							<td>{p.name}</td>
							<td class="muted">{p.email}</td>
							<td>{p.studentName}</td>
							<td>{p.relationship ?? '-'}</td>
							<td class="right">
								<form method="POST" action="?/remove" use:enhance style="display:inline;">
									<input type="hidden" name="id" value={p.id} />
									<button class="danger small" type="submit" onclick={(e) => !confirm('Hapus wali ini?') && e.preventDefault()}>Hapus</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
