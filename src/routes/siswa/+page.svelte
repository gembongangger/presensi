<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';

	let { data, form }: { data: any; form?: { error?: string; success?: boolean; message?: string } } = $props();

	let lat = $state<number | null>(null);
	let lng = $state<number | null>(null);
	let locating = $state(false);
	let geoError = $state('');
	let inForm = $state<HTMLFormElement>();
	let outForm = $state<HTMLFormElement>();

	const fmtTime = (v: number | string | Date | null) =>
		v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';
	const fmtDate = (v: number | string | Date) =>
		new Date(v).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' });

	function getPosition(): Promise<{ lat: number; lng: number }> {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) return reject(new Error('Browser tidak mendukung GPS'));
			navigator.geolocation.getCurrentPosition(
				(pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
				(err) => reject(new Error(err.message)),
				{ enableHighAccuracy: true, timeout: 12000 }
			);
		});
	}

	async function submit(kind: 'masuk' | 'pulang') {
		geoError = '';
		locating = true;
		try {
			const c = await getPosition();
			lat = c.lat;
			lng = c.lng;
			await tick();
			(kind === 'masuk' ? inForm : outForm)?.requestSubmit();
		} catch (e) {
			geoError = `Gagal mengambil lokasi: ${(e as Error).message}`;
		} finally {
			locating = false;
		}
	}
</script>

<h1>Presensi Saya</h1>
{#if !data.student}
	<div class="flash error">Data siswa tidak ditemukan untuk akun ini.</div>
{:else}
	<p class="muted">
		Presensi mandiri berbasis lokasi.
		{#if data.config?.hasLocation}
			Titik lokasi sekolah terpasang, radius <strong>{data.config.radius} m</strong>.
		{:else}
			<span style="color:var(--warning)">Admin belum mengatur titik lokasi sekolah.</span>
		{/if}
	</p>

	{#if form?.error}<div class="flash error">{form.error}</div>{/if}
	{#if form?.success}<div class="flash success">{form.message ?? 'Berhasil.'}</div>{/if}
	{#if geoError}<div class="flash error">{geoError}</div>{/if}

	<div class="card">
		<h2>Status hari ini</h2>
		{#if data.today}
			<p>
				Status: <span class="badge {data.today.status}">{data.today.status}</span>
				· Masuk: <strong>{fmtTime(data.today.checkInAt)}</strong>
				· Pulang: <strong>{fmtTime(data.today.checkOutAt)}</strong>
			</p>
		{:else}
			<p class="muted">Belum ada presensi hari ini.</p>
		{/if}

		<div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:0.75rem;">
			<form bind:this={inForm} method="POST" action="?/presensi" use:enhance>
				<input type="hidden" name="lat" bind:value={lat} />
				<input type="hidden" name="lng" bind:value={lng} />
				<button type="button" onclick={() => submit('masuk')} disabled={locating || !!data.today?.checkInAt}>
					{locating ? 'Mengambil lokasi…' : 'Presensi Masuk'}
				</button>
			</form>
			<form bind:this={outForm} method="POST" action="?/pulang" use:enhance>
				<input type="hidden" name="lat" bind:value={lat} />
				<input type="hidden" name="lng" bind:value={lng} />
				<button type="button" class="secondary" onclick={() => submit('pulang')} disabled={locating || !data.today?.checkInAt || !!data.today?.checkOutAt}>
					Presensi Pulang
				</button>
			</form>
		</div>
		{#if lat != null}<p class="muted" style="margin-top:0.5rem;">Koordinat terakhir: {lat?.toFixed(5)}, {lng?.toFixed(5)}</p>{/if}
	</div>

	<div class="card">
		<h2>Riwayat presensi</h2>
		{#if data.history.length === 0}
			<p class="muted">Belum ada riwayat.</p>
		{:else}
			<div class="table-wrap">
				<table>
					<thead><tr><th>Tanggal</th><th>Status</th><th>Masuk</th><th>Pulang</th></tr></thead>
					<tbody>
						{#each data.history as h}
							<tr>
								<td>{fmtDate(h.date)}</td>
								<td><span class="badge {h.status}">{h.status}</span></td>
								<td>{fmtTime(h.checkInAt)}</td>
								<td>{fmtTime(h.checkOutAt)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{/if}
