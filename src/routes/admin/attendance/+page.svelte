<script lang="ts">
	let { data }: { data: any } = $props();
	const fmtTime = (v: number | string | Date | null) =>
		v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';
</script>

<h1>Rekap Presensi</h1>

<div class="card">
	<form method="GET" style="display:flex; gap:0.75rem; align-items:end; flex-wrap:wrap;">
		<div class="field" style="margin:0; min-width:200px;">
			<label for="date">Tanggal</label>
			<input id="date" type="date" name="date" value={data.date} />
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
	<h2>Detail ({data.rows.length})</h2>
	{#if data.rows.length === 0}
		<p class="muted">Tidak ada data presensi pada tanggal ini.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Siswa</th><th>Kelas</th><th>Status</th><th>Masuk</th><th>Pulang</th><th>Radius</th><th>Koordinat</th></tr></thead>
				<tbody>
					{#each data.rows as r (r.id)}
						<tr>
							<td>{r.studentName}</td>
							<td>{r.className ?? '-'}</td>
							<td><span class="badge {r.status}">{r.status}</span></td>
							<td>{fmtTime(r.checkInAt)}</td>
							<td>{fmtTime(r.checkOutAt)}</td>
							<td>
								{#if r.radiusOk === false}<span class="badge alpa">luar radius</span>{:else}<span class="badge hadir">ok</span>{/if}
							</td>
							<td class="muted">{r.lat != null ? `${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}` : '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
