<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean; message?: string } } =
		$props();
	const fmtTime = (v: number | string | Date | null) =>
		v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';
	const timeOf = (v: number | string | Date | null) => {
		if (!v) return '';
		const d = new Date(v);
		if (Number.isNaN(d.getTime())) return '';
		return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	};
</script>

<h1>Presensi Siswa</h1>

{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">{form.message ?? 'Tersimpan.'}</div>{/if}

<div class="card">
	<form method="GET" style="display:flex; gap:0.75rem; align-items:end; flex-wrap:wrap;">
		<div class="field" style="margin:0; min-width:200px;">
			<label for="date">Tanggal</label>
			<input id="date" type="date" name="date" value={data.date} />
		</div>
		<div class="field" style="margin:0; min-width:180px;">
			<label for="class">Kelas</label>
			<select id="class" name="class">
				<option value="">— semua kelas —</option>
				{#each data.classList as c (c.id)}<option value={c.id} selected={data.classId === c.id}>{c.name}</option>{/each}
			</select>
		</div>
		<button type="submit">Tampilkan</button>
	</form>
</div>

<div class="grid" style="margin-bottom:1rem;">
	<div class="stat"><div class="value" style="color:var(--success)">{data.summary.hadir}</div><div class="label">Hadir</div></div>
	<div class="stat"><div class="value">{data.summary.izin}</div><div class="label">Izin</div></div>
	<div class="stat"><div class="value">{data.summary.sakit}</div><div class="label">Sakit</div></div>
	<div class="stat"><div class="value" style="color:var(--danger)">{data.summary.alpa}</div><div class="label">Alpa</div></div>
</div>

<div class="card">
	<h2>Presensi Manual</h2>
	<p class="muted">Isi status untuk siswa yang akan dicatat, lalu simpan. Status dan jam yang sudah terisi akan diperbarui.</p>
	<form method="POST" action="?/manual" use:enhance>
		<input type="hidden" name="date" value={data.date} />
		{#if data.rollCall.length === 0}
			<p class="muted">Belum ada siswa pada tanggal ini.</p>
		{:else}
			<div class="table-wrap">
				<table>
					<thead><tr><th>Siswa</th><th>Kelas</th><th>Status</th><th>Masuk</th><th>Pulang</th><th>Catatan</th></tr></thead>
					<tbody>
						{#each data.rollCall as s (s.id)}
							<tr>
								<td>
									{s.name}
									{#if s.nis}<span class="muted">· {s.nis}</span>{/if}
								</td>
								<td>{s.className ?? '-'}</td>
								<td>
									<select name="status_{s.id}">
										{#each ['hadir', 'izin', 'sakit', 'alpa'] as st (st)}
											<option value={st} selected={s.record?.status === st || (!s.record && st === 'hadir')}>{st}</option>
										{/each}
									</select>
								</td>
								<td><input type="time" name="in_{s.id}" value={timeOf(s.record?.checkInAt) || '07:00'} /></td>
								<td><input type="time" name="out_{s.id}" value={timeOf(s.record?.checkOutAt) || '15:30'} /></td>
								<td><input type="text" name="notes_{s.id}" value={s.record?.notes ?? ''} placeholder="catatan" /></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div style="margin-top:1rem;">
				<button type="submit">Simpan Presensi</button>
			</div>
		{/if}
	</form>
</div>

<div class="card">
	<h2>Detail ({data.rows.length})</h2>
	{#if data.rows.length === 0}
		<p class="muted">Tidak ada data pada tanggal ini.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Siswa</th><th>Kelas</th><th>Status</th><th>Masuk</th><th>Pulang</th></tr></thead>
				<tbody>
					{#each data.rows as r (r.id)}
						<tr>
							<td>{r.studentName}</td>
							<td>{r.className ?? '-'}</td>
							<td><span class="badge {r.status}">{r.status}</span></td>
							<td>{fmtTime(r.checkInAt)}</td>
							<td>{fmtTime(r.checkOutAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>