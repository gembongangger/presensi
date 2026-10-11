<script lang="ts">
	let { data }: { data: any } = $props();
	const s = $derived(data.stats);
	const fmtDate = (v: number | string | Date) =>
		new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<h1>Beranda Admin</h1>
<p class="muted">{data.tenant?.name}</p>

<div class="grid" style="margin:1rem 0;">
	<div class="stat"><div class="value">{s.students}</div><div class="label">Siswa</div></div>
	<div class="stat"><div class="value">{s.classes}</div><div class="label">Kelas</div></div>
	<div class="stat"><div class="value">{s.teachers}</div><div class="label">Guru</div></div>
	<div class="stat"><div class="value">{s.parents}</div><div class="label">Wali</div></div>
	<div class="stat"><div class="value">{s.pendingLeave}</div><div class="label">Izin menunggu</div></div>
</div>

<div class="card">
	<h2>Presensi hari ini</h2>
	<div class="grid">
		<div class="stat"><div class="value" style="color:var(--success)">{s.today.hadir}</div><div class="label">Hadir</div></div>
		<div class="stat"><div class="value">{s.today.izin}</div><div class="label">Izin</div></div>
		<div class="stat"><div class="value">{s.today.sakit}</div><div class="label">Sakit</div></div>
		<div class="stat"><div class="value" style="color:var(--danger)">{s.today.alpa}</div><div class="label">Alpa</div></div>
	</div>
</div>

<div class="card">
	<h2>Pengajuan izin terbaru</h2>
	{#if data.recentLeave.length === 0}
		<p class="muted">Belum ada pengajuan.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Siswa</th><th>Jenis</th><th>Periode</th><th>Status</th></tr></thead>
				<tbody>
					{#each data.recentLeave as row (row.id)}
						<tr>
							<td>{row.studentName}</td>
							<td>{row.type}</td>
							<td class="muted">{fmtDate(row.start)} – {fmtDate(row.end)}</td>
							<td><span class="badge {row.status}">{row.status}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	<p><a href="/admin/leave">Kelola pengajuan izin →</a></p>
</div>
