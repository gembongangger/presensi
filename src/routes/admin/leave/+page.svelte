<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
	const fmtDate = (v: number | string | Date) =>
		new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<h1>Pengajuan Izin</h1>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Tindakan tersimpan.</div>{/if}

<div class="card">
	{#if data.requests.length === 0}
		<p class="muted">Belum ada pengajuan.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Siswa</th><th>Wali</th><th>Jenis</th><th>Periode</th><th>Alasan</th><th>Status</th><th></th></tr></thead>
				<tbody>
					{#each data.requests as r (r.id)}
						<tr>
							<td>{r.studentName}</td>
							<td class="muted">{r.parentName ?? '-'}</td>
							<td>{r.leaveType}</td>
							<td class="muted">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</td>
							<td>{r.reason}</td>
							<td><span class="badge {r.status}">{r.status}</span></td>
							<td class="right">
								{#if r.status === 'pending'}
									<div style="display:flex; gap:0.35rem; justify-content:flex-end;">
										<form method="POST" action="?/approve" use:enhance>
											<input type="hidden" name="id" value={r.id} />
											<button class="small" type="submit">Setujui</button>
										</form>
										<form method="POST" action="?/reject" use:enhance>
											<input type="hidden" name="id" value={r.id} />
											<button class="danger small" type="submit">Tolak</button>
										</form>
									</div>
								{:else}
									<span class="muted">{r.notes ?? ''}</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
