<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';

	let { data, form }: { data: any; form?: { success?: boolean; error?: string } } = $props();
	const s = $derived(data.settings);

	let lat = $state<number | null>(untrack(() => data.settings.lat ?? null));
	let lng = $state<number | null>(untrack(() => data.settings.lng ?? null));
	let locating = $state(false);
	let geoError = $state('');

	function useMyLocation() {
		if (!navigator.geolocation) {
			geoError = 'Browser tidak mendukung geolokasi';
			return;
		}
		locating = true;
		geoError = '';
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				lat = Number(pos.coords.latitude.toFixed(6));
				lng = Number(pos.coords.longitude.toFixed(6));
				locating = false;
			},
			(err) => {
				geoError = `Gagal mengambil lokasi: ${err.message}`;
				locating = false;
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	const mapsUrl = $derived(
		lat != null && lng != null ? `https://maps.google.com/?q=${lat},${lng}` : ''
	);
</script>

<h1>Pengaturan Lembaga</h1>

{#if form?.success}<div class="flash success">Pengaturan berhasil disimpan.</div>{/if}
{#if form?.error}<div class="flash error">{form.error}</div>{/if}

<form method="POST" action="?/save" use:enhance>
	<div class="card">
		<h2>Informasi Lembaga</h2>
		<div class="form-row">
			<div class="field">
				<label for="schoolName">Nama sekolah</label>
				<input id="schoolName" name="schoolName" value={s.schoolName ?? ''} />
			</div>
			<div class="field">
				<label for="phone">Telepon</label>
				<input id="phone" name="phone" value={s.phone ?? ''} />
			</div>
		</div>
		<div class="field">
			<label for="address">Alamat</label>
			<input id="address" name="address" value={s.address ?? ''} />
		</div>
		<div class="form-row">
			<div class="field">
				<label for="workingHoursStart">Jam masuk</label>
				<input id="workingHoursStart" name="workingHoursStart" type="time" value={s.workingHoursStart ?? '07:00'} />
			</div>
			<div class="field">
				<label for="workingHoursEnd">Jam pulang</label>
				<input id="workingHoursEnd" name="workingHoursEnd" type="time" value={s.workingHoursEnd ?? '15:00'} />
			</div>
		</div>
	</div>

	<div class="card">
		<h2>Titik Lokasi Presensi &amp; Radius</h2>
		<p class="muted">Tentukan titik pusat lokasi sekolah dan radius maksimal (meter) siswa dapat melakukan presensi.</p>
		{#if geoError}<div class="flash error">{geoError}</div>{/if}
		<div class="form-row">
			<div class="field">
				<label for="lat">Latitude</label>
				<input id="lat" name="lat" type="number" step="any" bind:value={lat} />
			</div>
			<div class="field">
				<label for="lng">Longitude</label>
				<input id="lng" name="lng" type="number" step="any" bind:value={lng} />
			</div>
			<div class="field">
				<label for="radius">Radius (meter)</label>
				<input id="radius" name="radius" type="number" min="10" step="1" value={s.radius ?? 100} />
			</div>
		</div>
		<div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
			<button type="button" class="secondary" onclick={useMyLocation} disabled={locating}>
				{locating ? 'Mengambil lokasi…' : 'Gunakan lokasi perangkat ini'}
			</button>
			{#if mapsUrl}
				<a class="btn secondary small" href={mapsUrl} target="_blank" rel="noreferrer">Lihat di peta</a>
			{/if}
		</div>
	</div>

	<button type="submit">Simpan pengaturan</button>
</form>
