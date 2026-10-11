<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
</script>

<h1>Siswa</h1>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Tersimpan.</div>{/if}

<div class="card">
	<h2>Tambah siswa</h2>
	<form method="POST" action="?/create" use:enhance>
		<div class="form-row">
			<div class="field"><label for="fullName">Nama lengkap</label><input id="fullName" name="fullName" required /></div>
			<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /></div>
			<div class="field"><label for="password">Password awal</label><input id="password" name="password" type="password" minlength="8" required /></div>
		</div>
		<div class="form-row">
			<div class="field"><label for="nis">NIS</label><input id="nis" name="nis" /></div>
			<div class="field"><label for="nisn">NISN</label><input id="nisn" name="nisn" /></div>
			<div class="field">
				<label for="divisi">Divisi</label>
				<select id="divisi" name="divisi">
					<option value="">— pilih divisi —</option>
					{#each data.divisions as d (d)}<option value={d}>{d}</option>{/each}
				</select>
				{#if !data.divisions || data.divisions.length === 0}
					<p class="muted">Belum ada divisi. Tambahkan lewat <a href="/admin/settings">Pengaturan</a>.</p>
				{/if}
			</div>
		</div>
		<div class="form-row">
			<div class="field">
				<label for="classId">Kelas</label>
				<select id="classId" name="classId">
					<option value="">— tanpa kelas —</option>
					{#each data.classes as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
				</select>
			</div>
		</div>
		<div class="form-row">
			<div class="field"><label for="phone">Telepon</label><input id="phone" name="phone" /></div>
			<div class="field"><label for="address">Alamat</label><input id="address" name="address" /></div>
		</div>
		<button type="submit">Tambah siswa</button>
	</form>
</div>

<div class="card">
	<h2>Daftar siswa ({data.students.length})</h2>
	{#if data.students.length === 0}
		<p class="muted">Belum ada siswa.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Nama</th><th>Email</th><th>NIS</th><th>Divisi</th><th>Kelas</th><th></th></tr></thead>
				<tbody>
					{#each data.students as s (s.id)}
						<tr>
							<td>{s.name}</td>
							<td class="muted">{s.email}</td>
							<td>{s.nis ?? '-'}</td>
							<td>{s.divisi ?? '-'}</td>
							<td>{s.className ?? '-'}</td>
							<td class="right">
								<form method="POST" action="?/remove" use:enhance style="display:inline;">
									<input type="hidden" name="id" value={s.id} />
									<button class="danger small" type="submit" onclick={(e) => !confirm('Hapus siswa ini?') && e.preventDefault()}>Hapus</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
