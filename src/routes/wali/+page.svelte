<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
	const fmtDate = (v: number | string | Date) =>
		new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<h1>Anak &amp; Pengajuan Izin</h1>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Pengajuan dikirim, menunggu persetujuan admin.</div>{/if}

{#if data.children.length === 0}
	<div class="flash error">Belum ada siswa yang terhubung dengan akun Anda. Hubungi admin sekolah.</div>
{:else}
	<div class="card">
		<h2>Ajukan izin / sakit</h2>
		<form method="POST" action="?/create" use:enhance>
			<div class="form-row">
				<div class="field">
					<label for="studentId">Siswa</label>
					<select id="studentId" name="studentId" required>
						{#each data.children as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label for="leaveType">Jenis</label>
					<select id="leaveType" name="leaveType">
						<option value="izin">Izin</option>
						<option value="sakit">Sakit</option>
						<option value="lainnya">Lainnya</option>
					</select>
				</div>
			</div>
			<div class="form-row">
				<div class="field"><label for="startDate">Dari tanggal</label><input id="startDate" name="startDate" type="date" required /></div>
				<div class="field"><label for="endDate">Sampai tanggal</label><input id="endDate" name="endDate" type="date" required /></div>
			</div>
			<div class="field"><label for="reason">Alasan</label><textarea id="reason" name="reason" required></textarea></div>
			<button type="submit">Kirim pengajuan</button>
		</form>
	</div>
{/if}

<div class="card">
	<h2>Riwayat pengajuan</h2>
	{#if data.requests.length === 0}
		<p class="muted">Belum ada pengajuan.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Siswa</th><th>Jenis</th><th>Periode</th><th>Alasan</th><th>Status</th></tr></thead>
				<tbody>
					{#each data.requests as r (r.id)}
						<tr>
							<td>{r.studentName}</td>
							<td>{r.leaveType}</td>
							<td class="muted">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</td>
							<td>{r.reason}</td>
							<td><span class="badge {r.status}">{r.status}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
