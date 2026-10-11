<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form }: { data: any; form?: { error?: string; success?: boolean } } = $props();
	const fmtDate = (v: number | string | Date) =>
		new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<h1>Manajemen Lembaga</h1>
<p class="muted">Total {data.tenants.length} lembaga terdaftar</p>
{#if form?.error}<div class="flash error">{form.error}</div>{/if}
{#if form?.success}<div class="flash success">Status diperbarui.</div>{/if}

<div class="card">
	{#if data.tenants.length === 0}
		<p class="muted">Belum ada lembaga.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Nama</th><th>Slug</th><th>Pengguna</th><th>Siswa</th><th>Terdaftar</th><th>Status</th><th></th></tr></thead>
				<tbody>
					{#each data.tenants as t (t.id)}
						<tr>
							<td>{t.name}</td>
							<td class="muted">{t.slug}</td>
							<td>{t.userCount}</td>
							<td>{t.studentCount}</td>
							<td class="muted">{fmtDate(t.createdAt)}</td>
							<td>
								{#if t.isActive}<span class="badge hadir">aktif</span>{:else}<span class="badge alpa">nonaktif</span>{/if}
							</td>
							<td class="right">
								<form method="POST" action="?/toggle" use:enhance style="display:inline;">
									<input type="hidden" name="id" value={t.id} />
									<button class={t.isActive ? 'danger small' : 'small'} type="submit">
										{t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
