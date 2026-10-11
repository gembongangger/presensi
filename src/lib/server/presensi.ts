import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { attendance, attendanceStatus, classes, students, users } from '#lib/schema';
import type { Attendance, NewAttendance } from '#lib/schema';

export function parseDateInput(value: string | null): Date {
	if (value) {
		const d = new Date(`${value}T00:00:00`);
		if (!Number.isNaN(d.getTime())) return d;
	}
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now;
}

export function formatDateInput(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function dayRange(date: Date): { start: Date; end: Date } {
	const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	return { start, end: new Date(start.getTime() + 86_400_000) };
}

export function combineDateTime(date: Date, time: string): Date | null {
	const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
	if (!m) return null;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(m[1]), Number(m[2]));
}

export type RollCallRecord = {
	id: number;
	status: string;
	checkInAt: Date | null;
	checkOutAt: Date | null;
	notes: string | null;
};

export type RollCallStudent = {
	id: number;
	name: string;
	nis: string | null;
	className: string | null;
	divisi: string | null;
	record: RollCallRecord | null;
};

export async function getRollCall(
	db: App.Locals['db'],
	tenantId: number,
	date: Date,
	classId?: number
): Promise<RollCallStudent[]> {
	const { start, end } = dayRange(date);

	const studentRows = await db
		.select({
			id: students.id,
			name: users.fullName,
			nis: students.nis,
			className: classes.name,
			divisi: students.divisi
		})
		.from(students)
		.innerJoin(users, eq(students.userId, users.id))
		.leftJoin(classes, eq(students.classId, classes.id))
		.where(
			classId
				? and(eq(students.tenantId, tenantId), eq(students.classId, classId))
				: eq(students.tenantId, tenantId)
		)
		.orderBy(asc(users.fullName));

	const records = await db
		.select({
			id: attendance.id,
			studentId: attendance.studentId,
			status: attendance.status,
			checkInAt: attendance.checkInAt,
			checkOutAt: attendance.checkOutAt,
			notes: attendance.notes
		})
		.from(attendance)
		.where(
			and(eq(attendance.tenantId, tenantId), gte(attendance.date, start), lt(attendance.date, end))
		);

	const byStudent = new Map<number, RollCallRecord>();
	for (const r of records) byStudent.set(r.studentId, r);

	return studentRows.map((s) => ({
		id: s.id,
		name: s.name,
		nis: s.nis,
		className: s.className,
		divisi: s.divisi,
		record: byStudent.get(s.id) ?? null
	}));
}

export type RollCallEntry = {
	studentId: number;
	status: string;
	checkInAt: string;
	checkOutAt: string;
	notes: string;
};

export async function saveRollCall(
	db: App.Locals['db'],
	tenantId: number,
	date: Date,
	entries: RollCallEntry[]
): Promise<{ saved: number }> {
	const { start, end } = dayRange(date);

	const valid = await db.select({ id: students.id }).from(students).where(eq(students.tenantId, tenantId));
	const validIds = new Set(valid.map((v) => v.id));

	let saved = 0;
	for (const entry of entries) {
		if (!validIds.has(entry.studentId)) continue;
		if (!(attendanceStatus as readonly string[]).includes(entry.status)) continue;

		const checkInAt = combineDateTime(date, entry.checkInAt);
		const checkOutAt = combineDateTime(date, entry.checkOutAt);
		const notes = entry.notes.trim() || null;

		const [existing] = await db
			.select({ id: attendance.id })
			.from(attendance)
			.where(
				and(
					eq(attendance.studentId, entry.studentId),
					gte(attendance.date, start),
					lt(attendance.date, end)
				)
			)
			.limit(1);

		if (existing) {
			const set: Partial<Attendance> = { status: entry.status as Attendance['status'], notes };
			if (checkInAt) set.checkInAt = checkInAt;
			if (checkOutAt) set.checkOutAt = checkOutAt;
			await db.update(attendance).set(set).where(eq(attendance.id, existing.id));
		} else {
			const values: NewAttendance = {
				tenantId,
				studentId: entry.studentId,
				date: start,
				status: entry.status as Attendance['status'],
				notes,
				radiusOk: false
			};
			if (checkInAt) values.checkInAt = checkInAt;
			if (checkOutAt) values.checkOutAt = checkOutAt;
			await db.insert(attendance).values(values);
		}
		saved++;
	}
	return { saved };
}