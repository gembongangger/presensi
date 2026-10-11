import { fail } from '@sveltejs/kit';
import { and, desc, eq, gte, lt } from 'drizzle-orm';
import { attendance, settings, students } from '#lib/schema';
import { requireTenant } from '#lib/server/tenant';
import { haversineMeters, isValidCoordinate } from '#lib/server/geo';
import type { Actions, PageServerLoad } from './$types';

async function getStudent(db: App.Locals['db'], tenantId: number, userId: number) {
	const [row] = await db
		.select()
		.from(students)
		.where(and(eq(students.tenantId, tenantId), eq(students.userId, userId)))
		.limit(1);
	return row ?? null;
}

async function getSettings(db: App.Locals['db'], tenantId: number) {
	const [row] = await db.select().from(settings).where(eq(settings.tenantId, tenantId)).limit(1);
	return row ?? null;
}

export const load: PageServerLoad = async ({ locals }) => {
	const tenant = requireTenant(locals);
	const student = await getStudent(locals.db, tenant.id, locals.user!.id);
	const config = await getSettings(locals.db, tenant.id);

	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(start.getTime() + 86_400_000);

	let today = null;
	let history: {
		date: Date;
		status: string;
		checkInAt: Date | null;
		checkOutAt: Date | null;
	}[] = [];

	if (student) {
		const [row] = await locals.db
			.select()
			.from(attendance)
			.where(
				and(
					eq(attendance.studentId, student.id),
					gte(attendance.date, start),
					lt(attendance.date, end)
				)
			)
			.limit(1);
		today = row ?? null;

		history = await locals.db
			.select({
				date: attendance.date,
				status: attendance.status,
				checkInAt: attendance.checkInAt,
				checkOutAt: attendance.checkOutAt
			})
			.from(attendance)
			.where(eq(attendance.studentId, student.id))
			.orderBy(desc(attendance.date))
			.limit(30);
	}

	return {
		student,
		config: config
			? {
					hasLocation: config.lat != null && config.lng != null,
					lat: config.lat,
					lng: config.lng,
					radius: config.radius ?? 100,
					start: config.workingHoursStart,
					end: config.workingHoursEnd
				}
			: null,
		today,
		history
	};
};

function readCoord(form: FormData): { lat: number; lng: number } | null {
	const lat = Number(form.get('lat'));
	const lng = Number(form.get('lng'));
	if (!isValidCoordinate(lat, lng)) return null;
	return { lat, lng };
}

export const actions: Actions = {
	presensi: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const student = await getStudent(locals.db, tenant.id, locals.user!.id);
		if (!student) return fail(400, { error: 'Data siswa tidak ditemukan' });

		const coord = readCoord(await request.formData());
		if (!coord) return fail(400, { error: 'Koordinat lokasi tidak valid. Aktifkan GPS.' });

		const config = await getSettings(locals.db, tenant.id);
		if (!config || config.lat == null || config.lng == null) {
			return fail(400, { error: 'Lokasi sekolah belum diatur oleh admin' });
		}

		const distance = haversineMeters(coord.lat, coord.lng, config.lat, config.lng);
		const radius = config.radius ?? 100;
		if (distance > radius) {
			return fail(400, {
				error: `Anda berada di luar radius presensi (${Math.round(distance)} m dari titik lokasi, maksimal ${radius} m)`
			});
		}

		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date(start.getTime() + 86_400_000);

		const [existing] = await locals.db
			.select()
			.from(attendance)
			.where(
				and(
					eq(attendance.studentId, student.id),
					gte(attendance.date, start),
					lt(attendance.date, end)
				)
			)
			.limit(1);
		if (existing?.checkInAt) {
			return fail(400, { error: 'Anda sudah melakukan presensi hari ini' });
		}

		const now = new Date();
		if (existing) {
			await locals.db
				.update(attendance)
				.set({ checkInAt: now, lat: coord.lat, lng: coord.lng, radiusOk: true, status: 'hadir' })
				.where(eq(attendance.id, existing.id));
		} else {
			await locals.db.insert(attendance).values({
				tenantId: tenant.id,
				studentId: student.id,
				date: start,
				checkInAt: now,
				status: 'hadir',
				lat: coord.lat,
				lng: coord.lng,
				radiusOk: true
			});
		}
		return { success: true, message: `Presensi berhasil. Jarak ${Math.round(distance)} m dari titik lokasi.` };
	},

	pulang: async ({ request, locals }) => {
		const tenant = requireTenant(locals);
		const student = await getStudent(locals.db, tenant.id, locals.user!.id);
		if (!student) return fail(400, { error: 'Data siswa tidak ditemukan' });

		const coord = readCoord(await request.formData());
		if (!coord) return fail(400, { error: 'Koordinat lokasi tidak valid. Aktifkan GPS.' });

		const config = await getSettings(locals.db, tenant.id);
		if (config?.lat != null && config?.lng != null) {
			const distance = haversineMeters(coord.lat, coord.lng, config.lat, config.lng);
			if (distance > (config.radius ?? 100)) {
				return fail(400, { error: `Di luar radius (${Math.round(distance)} m). Tidak dapat presensi pulang.` });
			}
		}

		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date(start.getTime() + 86_400_000);
		const [existing] = await locals.db
			.select()
			.from(attendance)
			.where(
				and(
					eq(attendance.studentId, student.id),
					gte(attendance.date, start),
					lt(attendance.date, end)
				)
			)
			.limit(1);
		if (!existing?.checkInAt) return fail(400, { error: 'Belum melakukan presensi masuk' });
		if (existing.checkOutAt) return fail(400, { error: 'Sudah melakukan presensi pulang' });

		await locals.db
			.update(attendance)
			.set({ checkOutAt: new Date() })
			.where(eq(attendance.id, existing.id));
		return { success: true, message: 'Presensi pulang berhasil.' };
	}
};
