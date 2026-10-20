/**
 * Fake JWT: a real header.payload.signature shape so the app can decode the
 * payload and read `exp`, but signed with a constant. Never use outside mocks.
 */
import type { User } from '@/api/types';

function base64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: User['role'];
  exp: number;
}

export function signFakeJwt(user: User, ttlSeconds = 60 * 60 * 8, now = Date.now()): string {
  const header = base64url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(now / 1000) + ttlSeconds,
  };
  return `${header}.${base64url(JSON.stringify(payload))}.mock-signature`;
}

export function decodeFakeJwt(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const payload = JSON.parse(fromBase64url(parts[1])) as Partial<TokenPayload>;
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null, now = Date.now()): boolean {
  if (!token) return false;
  const payload = decodeFakeJwt(token);
  return payload !== null && payload.exp * 1000 > now;
}
