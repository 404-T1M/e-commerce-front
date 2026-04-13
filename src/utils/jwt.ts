export interface JwtPayload {
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

function decodeBase64Url(input: string): string {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
    return atob(padded);
}

export function decodeJwt(token: string): JwtPayload | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const json = decodeBase64Url(payload);
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

export function getJwtExpiry(token: string): number | null {
    const payload = decodeJwt(token);
    if (!payload?.exp) return null;
    return payload.exp;
}

export function isJwtExpired(token: string, offsetSeconds = 0): boolean {
    const payload = decodeJwt(token);
    if (!payload) return true;
    const exp = payload.exp;
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return exp <= now + offsetSeconds;
}
