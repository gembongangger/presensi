<svelte:head>
	<title>Presensi Siswa — Absensi Sekolah Berbasis Lokasi</title>
</svelte:head>

<div class="auth-wrap">
	<div class="auth-card" style="max-width: 560px;">
		<div class="brand">Presensi Siswa</div>
		<p class="sub">Sistem absensi siswa multi-lembaga berbasis lokasi (GPS radius).</p>
		<ul class="muted" style="font-size:0.9rem; line-height:1.8;">
			<li>Multi tenant — setiap sekolah/lembaga terpisah</li>
			<li>Peran: superadmin, admin sekolah, guru, siswa, wali</li>
			<li>Siswa presensi mandiri dengan validasi radius lokasi</li>
			<li>Wali dapat mengajukan izin, admin menyetujui</li>
		</ul>
		<div style="display:flex; gap:0.75rem; margin-top:1.5rem;">
			<a class="btn" href="/login" style="flex:1;">Masuk</a>
			<a class="btn secondary" href="/register" style="flex:1;">Daftarkan Lembaga</a>
		</div>
	</div>
</div>
