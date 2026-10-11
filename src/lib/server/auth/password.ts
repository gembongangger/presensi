const ITERATIONS = 100_000;
const KEYLEN = 32;
const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function derive(
	password: string,
	salt: Uint8Array<ArrayBuffer>,
	iterations: number
): Promise<Uint8Array<ArrayBuffer>> {
	const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits'
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
		key,
		KEYLEN * 8
	);
	return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await derive(password, salt, ITERATIONS);
	return `pbkdf2$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const parts = stored.split('$');
	if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
	const iterations = Number(parts[1]);
	if (!Number.isFinite(iterations) || iterations <= 0) return false;
	try {
		const salt = fromBase64(parts[2]);
		const expected = fromBase64(parts[3]);
		const actual = await derive(password, salt, iterations);
		if (actual.length !== expected.length) return false;
		let diff = 0;
		for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
		return diff === 0;
	} catch {
		return false;
	}
}
