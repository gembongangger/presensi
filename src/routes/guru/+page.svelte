<script lang="ts">
	let { data }: { data: any } = $props();
	const s = $derived(data.stats);
</script>

<h1>Beranda Guru</h1>
<p class="muted">{data.tenant?.name}</p>

<div class="grid" style="margin:1rem 0;">
	<div class="stat"><div class="value">{s.students}</div><div class="label">Siswa</div></div>
	<div class="stat"><div class="value">{s.classes}</div><div class="label">Kelas</div></div>
</div>

<div class="card">
	<h2>Presensi hari ini</h2>
	<div class="grid">
		<div class="stat"><div class="value" style="color:var(--success)">{s.today.hadir}</div><div class="label">Hadir</div></div>
		<div class="stat"><div class="value">{s.today.izin}</div><div class="label">Izin</div></div>
		<div class="stat"><div class="value">{s.today.sakit}</div><div class="label">Sakit</div></div>
		<div class="stat"><div class="value" style="color:var(--danger)">{s.today.alpa}</div><div class="label">Alpa</div></div>
	</div>
	<p><a href="/guru/attendance">Lihat detail presensi →</a></p>
</div>
