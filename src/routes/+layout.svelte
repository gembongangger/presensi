<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';

	let { children, data }: LayoutProps = $props();

	const roleHome: Record<string, string> = {
		superadmin: '/superadmin',
		admin: '/admin',
		guru: '/guru',
		siswa: '/siswa',
		wali: '/wali'
	};

	const navItems = $derived(
		data.user
			? data.user.role === 'superadmin'
				? [ { href: '/superadmin', label: 'Lembaga' } ]
				: data.user.role === 'admin'
					? [
							{ href: '/admin', label: 'Beranda' },
							{ href: '/admin/students', label: 'Siswa' },
							{ href: '/admin/classes', label: 'Kelas' },
							{ href: '/admin/teachers', label: 'Guru' },
							{ href: '/admin/parents', label: 'Wali' },
							{ href: '/admin/attendance', label: 'Presensi' },
							{ href: '/admin/leave', label: 'Pengajuan Izin' },
							{ href: '/admin/settings', label: 'Pengaturan' }
						]
					: data.user.role === 'guru'
						? [
								{ href: '/guru', label: 'Beranda' },
								{ href: '/guru/attendance', label: 'Presensi' }
							]
						: data.user.role === 'siswa'
							? [ { href: '/siswa', label: 'Presensi Saya' } ]
							: [ { href: '/wali', label: 'Anak & Izin' } ]
			: []
	);

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return path === href || path.startsWith(`${href}/`);
	}

	let menuOpen = $state(false);

	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Presensi Siswa</title>
</svelte:head>

{#if data.user}
	<div class="app-shell">
		<header class="topbar">
			<button class="icon-btn menu-toggle" onclick={() => (menuOpen = !menuOpen)} aria-label="Buka menu" aria-expanded={menuOpen}>
				{menuOpen ? '✕' : '☰'}
			</button>
			<span class="brand">Presensi Siswa</span>
			{#if data.tenant}<span class="muted">· {data.tenant.name}</span>{/if}
			<span class="spacer"></span>
			<span class="who">{data.user.fullName} ({data.user.role})</span>
			<a class="btn secondary small" href="/logout">Keluar</a>
		</header>

		<aside class:open={menuOpen} class="sidebar">
			<div class="sidebar-header">
				<span class="brand">Presensi Siswa</span>
				<button class="icon-btn" onclick={() => (menuOpen = false)} aria-label="Tutup menu">✕</button>
			</div>
			<nav>
				{#each navItems as item (item.href)}
					<a href={item.href} class:active={isActive(item.href)} onclick={() => (menuOpen = false)}>{item.label}</a>
				{/each}
			</nav>
		</aside>

		{#if menuOpen}
			<button class="backdrop" onclick={() => (menuOpen = false)} aria-label="Tutup menu"></button>
		{/if}

		<main class="container">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}
