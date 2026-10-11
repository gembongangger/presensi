import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'presensi_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
	uid: number;
	tid: number | null;
	role: string;
}

function getSecret(secret?: string): Uint8Array {
	const value = secret ?? process.env.SESSION_SECRET ?? 'dev-secret-change-me';
	return new TextEncoder().encode(value);
}

export async function createSession(
	payload: SessionPayload,
	secret?: string
): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${MAX_AGE_SECONDS}s`)
		.sign(getSecret(secret));
}

export async function verifySession(
	token: string,
	secret?: string
): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret(secret));
		const uid = Number(payload.uid);
		if (!Number.isFinite(uid)) return null;
		return {
			uid,
			tid: payload.tid == null ? null : Number(payload.tid),
			role: String(payload.role ?? '')
		};
	} catch {
		return null;
	}
}

export function sessionCookieOptions(secure: boolean) {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure,
		maxAge: MAX_AGE_SECONDS
	};
}
