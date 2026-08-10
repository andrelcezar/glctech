/**
 * Cloudflare Turnstile server-side verification.
 *
 * The widget token from the browser proves nothing by itself — it must be
 * checked against Cloudflare's siteverify endpoint using the SECRET key,
 * which never appears in client code. If TURNSTILE_SECRET_KEY is not
 * configured, verification is skipped (the site keeps working before the
 * widget is set up); once the secret is set, a missing or invalid token is
 * rejected. See AUDIT-REPORT.md for how to create the widget and get keys.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * @returns {Promise<{ configured: boolean, ok: boolean }>}
 *   configured=false means no secret is set (verification skipped, ok=true).
 *   configured=true, ok=false means the token was missing/invalid/expired.
 */
export async function verifyTurnstile({ token, secret, ip, fetchImpl = fetch }) {
  if (!secret) return { configured: false, ok: true };
  if (!token) return { configured: true, ok: false };

  try {
    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token);
    if (ip) form.set('remoteip', ip);

    const res = await fetchImpl(VERIFY_URL, { method: 'POST', body: form });
    if (!res.ok) return { configured: true, ok: false };
    const data = await res.json();
    return { configured: true, ok: data.success === true };
  } catch {
    // Cloudflare's own endpoint being unreachable must not be treated as a
    // pass — fail closed so a network blip can't be used to bypass the check.
    return { configured: true, ok: false };
  }
}
