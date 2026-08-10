/**
 * Shared HTTP helpers for the Worker: JSON responses, security headers,
 * same-origin checks and a small KV-backed rate limiter.
 *
 * Kept dependency-free (no imports beyond the platform) so it can be unit
 * tested under plain Node, same as the rest of worker/lib.
 */

/** Applied to every response the Worker sends, API or static asset. */
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com https://code.tidio.co https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://*.tidio.co wss://*.tidio.co",
      "frame-src https://challenges.cloudflare.com https://*.tidio.co",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  };
}

/** Adds the shared security headers to a Response without altering its body. */
export function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(securityHeaders())) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function json(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...securityHeaders(),
      ...extraHeaders,
    },
  });
}

/** Strips control characters and caps length before a value reaches SMTP or logs. */
export function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/**
 * The site and the API are same-origin (one Worker serves both), so an exact
 * match is the normal case. A missing Origin header is allowed because some
 * browsers omit it for same-origin requests; anything from a genuinely
 * different origin is refused.
 */
export function originAllowed(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

/**
 * Fixed-window rate limit backed by KV. Optional by design: without the
 * binding the Worker still serves requests, it just loses the flood guard
 * instead of failing closed (a misconfigured KV must never take the form
 * down). Returns true when the request should be blocked.
 */
export async function isRateLimited(env, ctx, bucket, key, limit, windowSeconds) {
  if (!env.RATE_LIMIT) return false;
  const storeKey = `rl:${bucket}:${key}`;
  const count = Number((await env.RATE_LIMIT.get(storeKey)) || 0);
  if (count >= limit) return true;
  ctx.waitUntil(env.RATE_LIMIT.put(storeKey, String(count + 1), { expirationTtl: windowSeconds }));
  return false;
}

/** Short id for correlating a request across log lines without logging its content. */
export function requestId() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0, 8);
}
