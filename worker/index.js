/**
 * Cloudflare Worker for glctechsec.com — static site plus both form endpoints.
 *
 * One deploy serves everything, so the forms post to /api/contact and
 * /api/careers on their own origin: no CORS preflight, no second URL to keep
 * in sync, and no third-party form service in the path.
 *
 * Everything that is not one of those two paths falls through to the static
 * assets in dist/, assembled by scripts/build.mjs.
 *
 * The Zoho credential and the Turnstile secret live in Worker secrets. They
 * are never in this file, and never in the repository. See AUDIT-REPORT.md
 * for the full list of required secrets and how to set them.
 */
import { sendMail } from './lib/smtp.js';
import { buildContactEmail, buildCareersEmail } from './lib/mail.js';
import { validateResumeFile } from './lib/validate.js';
import { verifyTurnstile } from './lib/turnstile.js';
import {
  json, clean, isValidEmail, originAllowed, isRateLimited, requestId, withSecurityHeaders,
} from './lib/http.js';

const MAX_CONTACT_BODY_BYTES = 20 * 1024; // JSON payload, generous over the field caps below
const MAX_CAREERS_BODY_BYTES = 8 * 1024 * 1024; // 5MB resume cap + fields + multipart overhead

function tooLarge(request, max) {
  const len = Number(request.headers.get('Content-Length') || 0);
  return len > 0 && len > max;
}

function preflight() {
  return new Response(null, {
    status: 204,
    headers: { Allow: 'POST, OPTIONS', 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
  });
}

async function handleContact(request, env, ctx) {
  const rid = requestId();
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed.' }, 405);
  if (!originAllowed(request)) return json({ success: false, message: 'Origin not allowed.' }, 403);
  if (tooLarge(request, MAX_CONTACT_BODY_BYTES)) return json({ success: false, message: 'Request too large.' }, 413);

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return json({ success: false, message: 'Invalid request.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (await isRateLimited(env, ctx, 'contact', ip, 5, 600)) {
    console.log(`[contact] ${rid} 429 rate-limited`);
    return json({ success: false, message: 'Muitas tentativas. Tente novamente em alguns minutos.' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: 'Invalid request.' }, 400);
  }

  // Honeypot: a hidden field no human fills in.
  if (clean(body.website, 200)) return json({ success: true, message: 'Mensagem enviada com sucesso.' }, 200);

  const turnstile = await verifyTurnstile({
    token: body['cf-turnstile-response'], secret: env.TURNSTILE_SECRET_KEY, ip, fetchImpl: fetch,
  });
  if (turnstile.configured && !turnstile.ok) {
    console.log(`[contact] ${rid} 400 turnstile-failed`);
    return json({ success: false, message: 'Verificação de segurança falhou. Recarregue a página e tente novamente.' }, 400);
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  const company = clean(body.company, 160);
  const phone = clean(body.phone, 60);
  const subject = clean(body.subject, 160);

  if (!name || !message) {
    return json({ success: false, message: 'Nome e mensagem são obrigatórios.' }, 400);
  }
  if (!isValidEmail(email)) {
    return json({ success: false, message: 'Informe um e-mail válido.' }, 400);
  }

  if (!env.ZOHO_USER || !env.ZOHO_PASS) {
    console.error(`[contact] ${rid} 500 mail-not-configured`);
    return json({ success: false, message: 'Não foi possível enviar a mensagem. Tente novamente mais tarde.' }, 500);
  }

  const { subject: mailSubject, text } = buildContactEmail({ name, email, phone, company, subject, message });

  try {
    const { connect } = await import('cloudflare:sockets');
    await sendMail({
      connect,
      user: env.ZOHO_USER,
      pass: env.ZOHO_PASS,
      // Zoho only accepts the authenticated mailbox as sender, which is also
      // what keeps SPF and DKIM aligned for the domain.
      from: `"GLCTech - Site" <${env.ZOHO_USER}>`,
      to: env.CONTACT_TO_EMAIL || env.ZOHO_USER,
      replyTo: `"${name}" <${email}>`,
      subject: mailSubject,
      text,
    });
    console.log(`[contact] ${rid} 200 sent`);
    return json({ success: true, message: 'Mensagem enviada com sucesso. Entraremos em contato em breve.' }, 200);
  } catch (err) {
    // The SMTP error names the host and the account — log it, never return it.
    console.error(`[contact] ${rid} 502 send-failed:`, err && err.message);
    return json({ success: false, message: 'Não foi possível enviar sua mensagem. Tente novamente.' }, 502);
  }
}

async function handleCareers(request, env, ctx) {
  const rid = requestId();
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed.' }, 405);
  if (!originAllowed(request)) return json({ success: false, message: 'Origin not allowed.' }, 403);
  if (tooLarge(request, MAX_CAREERS_BODY_BYTES)) return json({ success: false, message: 'Arquivo muito grande.' }, 413);

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return json({ success: false, message: 'Invalid request.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (await isRateLimited(env, ctx, 'careers', ip, 5, 600)) {
    console.log(`[careers] ${rid} 429 rate-limited`);
    return json({ success: false, message: 'Muitas tentativas. Tente novamente em alguns minutos.' }, 429);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ success: false, message: 'Invalid request.' }, 400);
  }

  const get = (k, max) => clean(form.get(k), max);

  // Honeypot: a hidden field no human fills in.
  if (get('website', 200)) return json({ success: true, message: 'Candidatura enviada com sucesso.' }, 200);

  const turnstile = await verifyTurnstile({
    token: form.get('cf-turnstile-response'), secret: env.TURNSTILE_SECRET_KEY, ip, fetchImpl: fetch,
  });
  if (turnstile.configured && !turnstile.ok) {
    console.log(`[careers] ${rid} 400 turnstile-failed`);
    return json({ success: false, message: 'Verificação de segurança falhou. Recarregue a página e tente novamente.' }, 400);
  }

  const name = get('nome', 120);
  const email = get('email', 200);
  const phone = get('telefone', 60);
  const location = get('cidade_estado', 160);
  const position = get('vaga', 160);
  const message = get('mensagem', 5000);
  const linkedin = get('linkedin', 300);
  const course = get('curso', 160);
  const institution = get('instituicao', 160);
  const semester = get('semestre', 60);
  const github = get('github', 300);
  const portfolio = get('portfolio', 300);

  if (!name || !phone || !location || !position || !message) {
    return json({ success: false, message: 'Preencha todos os campos obrigatórios.' }, 400);
  }
  if (!isValidEmail(email)) {
    return json({ success: false, message: 'Informe um e-mail válido.' }, 400);
  }

  const resume = await validateResumeFile(form.get('curriculo'));
  if (!resume.ok) {
    return json({ success: false, message: resume.error }, 400);
  }

  if (!env.ZOHO_USER || !env.ZOHO_PASS) {
    console.error(`[careers] ${rid} 500 mail-not-configured`);
    return json({ success: false, message: 'Não foi possível enviar sua candidatura. Tente novamente mais tarde.' }, 500);
  }

  const { subject: mailSubject, text } = buildCareersEmail({
    name, email, phone, position, location, linkedin, message,
    course, institution, semester, github, portfolio,
  });

  try {
    const { connect } = await import('cloudflare:sockets');
    await sendMail({
      connect,
      user: env.ZOHO_USER,
      pass: env.ZOHO_PASS,
      from: `"GLCTech - Site" <${env.ZOHO_USER}>`,
      to: env.CAREERS_TO_EMAIL || env.ZOHO_USER,
      replyTo: `"${name}" <${email}>`,
      subject: mailSubject,
      text,
      attachment: { filename: resume.filename, contentType: 'application/pdf', data: resume.bytes },
    });
    console.log(`[careers] ${rid} 200 sent`);
    return json({ success: true, message: 'Candidatura enviada com sucesso. Nossa equipe de RH entrará em contato.' }, 200);
  } catch (err) {
    console.error(`[careers] ${rid} 502 send-failed:`, err && err.message);
    return json({ success: false, message: 'Não foi possível enviar sua candidatura. Tente novamente.' }, 502);
  }
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return handleContact(request, env, ctx);
    if (pathname === '/api/careers') return handleCareers(request, env, ctx);
    const asset = await env.ASSETS.fetch(request);
    return withSecurityHeaders(asset);
  },
};
