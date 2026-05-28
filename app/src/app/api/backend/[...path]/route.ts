import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const TOKEN_ISSUING_PATHS = new Set(['auth/login', 'auth/register']);
const TOKEN_REFRESH_PATHS = new Set(['auth/refresh']);
const LOGOUT_PATHS = new Set(['auth/logout']);

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const TOKEN_COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const cookieStore = await cookies();

  const targetUrl = `${API_URL}/api/v1/${pathStr}${req.nextUrl.search}`;
  const headers = new Headers();

  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  if (TOKEN_REFRESH_PATHS.has(pathStr) || LOGOUT_PATHS.has(pathStr)) {
    const rt = cookieStore.get(REFRESH_COOKIE)?.value;
    if (rt) headers.set('cookie', `${REFRESH_COOKIE}=${rt}`);
  } else if (!TOKEN_ISSUING_PATHS.has(pathStr)) {
    const at = cookieStore.get(ACCESS_COOKIE)?.value;
    if (at) headers.set('authorization', `Bearer ${at}`);
  }

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? (req.body as BodyInit) : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-expect-error — duplex required for streaming body in Node.js fetch
      duplex: 'half',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'API_UNREACHABLE', message: 'El servidor no está disponible.' } },
      { status: 503 },
    );
  }

  const responseData = await upstream.json().catch(() => ({}));
  const res = NextResponse.json(responseData, { status: upstream.status });

  // Forward refresh_token cookie set by NestJS
  const setCookieRaw = upstream.headers.get('set-cookie');
  if (setCookieRaw) res.headers.append('set-cookie', setCookieRaw);

  if (TOKEN_ISSUING_PATHS.has(pathStr) && upstream.ok) {
    const accessToken: string | undefined = responseData?.data?.accessToken;
    if (accessToken) {
      res.cookies.set(ACCESS_COOKIE, accessToken, { ...TOKEN_COOKIE_BASE, maxAge: 15 * 60 });
      // Remove token from body before returning to browser
      const sanitized = { ...responseData, data: { ...responseData.data, accessToken: undefined } };
      return NextResponse.json(sanitized, {
        status: upstream.status,
        headers: res.headers,
      });
    }
  }

  if (TOKEN_REFRESH_PATHS.has(pathStr) && upstream.ok) {
    const accessToken: string | undefined = responseData?.data?.accessToken;
    if (accessToken) {
      res.cookies.set(ACCESS_COOKIE, accessToken, { ...TOKEN_COOKIE_BASE, maxAge: 15 * 60 });
    }
  }

  if (LOGOUT_PATHS.has(pathStr)) {
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
  }

  return res;
}

export const GET    = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx);
export const POST   = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx);
export const PUT    = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx);
export const PATCH  = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => proxyRequest(req, ctx);
