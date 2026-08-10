import { test } from 'node:test';
import assert from 'node:assert';

const mod = await import(new URL('../worker/index.js', import.meta.url));
const w = mod.default;

const ASSETS = { fetch: async (req) => new Response('asset:' + new URL(req.url).pathname, { status: 200 }) };
const CTX = { waitUntil() {} };
const ENV = { ZOHO_USER: 'contac@glctech.com.br', ZOHO_PASS: 'pw', ASSETS };
const GOOD_CONTACT = { name: 'Jane', email: 'jane@acme.co.uk', message: 'hi' };

const post = (path, body, { origin, headers = {}, contentType = 'application/json' } = {}) =>
  new Request('https://glctechsec.com' + path, {
    method: 'POST',
    headers: { ...(origin !== undefined ? { Origin: origin } : {}), 'Content-Type': contentType, ...headers },
    body: JSON.stringify(body),
  });

/* ── static fall-through + security headers ───────────────────────────────── */

test('static paths fall through to assets and carry security headers', async () => {
  for (const p of ['/', '/index.html', '/assets/logo/glctech-logo.png', '/zabbix.html']) {
    const r = await w.fetch(new Request('https://glctechsec.com' + p), ENV, CTX);
    assert.strictEqual(await r.text(), 'asset:' + p);
    assert.strictEqual(r.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.ok(r.headers.get('Content-Security-Policy'), 'no CSP on a static asset');
  }
});

test('API responses also carry security headers', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com' }), ENV, CTX);
  assert.strictEqual(r.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.strictEqual(r.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
});

/* ── /api/contact ──────────────────────────────────────────────────────────── */

test('contact: same-origin post is accepted', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com' }), ENV, CTX);
  assert.notStrictEqual(r.status, 403);
});
test('contact: missing Origin is accepted (same-origin browsers may omit it)', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, {}), ENV, CTX);
  assert.notStrictEqual(r.status, 403);
});
test('contact: cross-origin post is refused', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://evil.example' }), ENV, CTX);
  assert.strictEqual(r.status, 403);
});
test('contact: GET is refused', async () => {
  const r = await w.fetch(new Request('https://glctechsec.com/api/contact'), ENV, CTX);
  assert.strictEqual(r.status, 405);
});
test('contact: wrong Content-Type is refused', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com', contentType: 'text/plain' }), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('contact: validation and honeypot behave', async () => {
  assert.strictEqual((await w.fetch(post('/api/contact', { ...GOOD_CONTACT, email: 'x' }, { origin: 'https://glctechsec.com' }), ENV, CTX)).status, 400);
  assert.strictEqual((await w.fetch(post('/api/contact', { ...GOOD_CONTACT, name: '' }, { origin: 'https://glctechsec.com' }), ENV, CTX)).status, 400);
  const hp = await w.fetch(post('/api/contact', { ...GOOD_CONTACT, website: 'bot' }, { origin: 'https://glctechsec.com' }), ENV, CTX);
  assert.strictEqual(hp.status, 200);
  assert.deepStrictEqual(await hp.json(), { success: true, message: 'Mensagem enviada com sucesso.' });
});
test('contact: fails closed without secrets', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com' }), { ASSETS }, CTX);
  assert.strictEqual(r.status, 500);
});
test('contact: SMTP failure returns 502, not a stack, message uses the {success,message} contract', async () => {
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com' }), ENV, CTX);
  assert.strictEqual(r.status, 502);
  const data = await r.json();
  assert.strictEqual(data.success, false);
  assert.ok(data.message && !/smtp|zoho|password/i.test(data.message), 'error leaks internal detail');
});
test('contact: rate limits per IP', async () => {
  const store = new Map();
  const env = { ...ENV, RATE_LIMIT: { get: async (k) => store.get(k), put: async (k, v) => store.set(k, v) } };
  let last;
  for (let i = 0; i < 7; i++) {
    last = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com', headers: { 'CF-Connecting-IP': '9.9.9.9' } }), env, CTX);
  }
  assert.strictEqual(last.status, 429);
});
test('contact: rejects a Turnstile token when a secret is configured', async () => {
  const env = { ...ENV, TURNSTILE_SECRET_KEY: 'secret' };
  const r = await w.fetch(post('/api/contact', GOOD_CONTACT, { origin: 'https://glctechsec.com' }), env, CTX);
  assert.strictEqual(r.status, 400);
  const data = await r.json();
  assert.strictEqual(data.success, false);
});

/* ── /api/careers ──────────────────────────────────────────────────────────── */

function careersForm({ omit = [], overrides = {}, file } = {}) {
  const fields = {
    nome: 'Jane', email: 'jane@acme.co.uk', telefone: '+44 7778 173575',
    cidade_estado: 'London, UK', vaga: 'Sales', mensagem: 'I would like to apply.',
    ...overrides,
  };
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) if (!omit.includes(k)) form.set(k, v);
  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
  if (file !== null) {
    form.set('curriculo', file || new File([pdfBytes], 'resume.pdf', { type: 'application/pdf' }));
  }
  return form;
}

const careersPost = (form, { origin = 'https://glctechsec.com', headers = {} } = {}) =>
  new Request('https://glctechsec.com/api/careers', {
    method: 'POST',
    headers: { ...(origin !== undefined ? { Origin: origin } : {}), ...headers },
    body: form,
  });

test('careers: cross-origin post is refused', async () => {
  const r = await w.fetch(careersPost(careersForm(), { origin: 'https://evil.example' }), ENV, CTX);
  assert.strictEqual(r.status, 403);
});
test('careers: GET is refused', async () => {
  const r = await w.fetch(new Request('https://glctechsec.com/api/careers'), ENV, CTX);
  assert.strictEqual(r.status, 405);
});
test('careers: missing required fields are rejected', async () => {
  const r = await w.fetch(careersPost(careersForm({ omit: ['nome'] })), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: invalid email is rejected', async () => {
  const r = await w.fetch(careersPost(careersForm({ overrides: { email: 'nope' } })), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: honeypot is silently accepted', async () => {
  const r = await w.fetch(careersPost(careersForm({ overrides: { website: 'bot' } })), ENV, CTX);
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(await r.json(), { success: true, message: 'Candidatura enviada com sucesso.' });
});
test('careers: missing resume is rejected', async () => {
  const r = await w.fetch(careersPost(careersForm({ file: null })), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: a non-PDF file is rejected even with a .pdf name and spoofed type', async () => {
  const fakeFile = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], 'resume.pdf', { type: 'application/pdf' }); // MZ = Windows EXE header
  const r = await w.fetch(careersPost(careersForm({ file: fakeFile })), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: a non-.pdf extension is rejected', async () => {
  const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'resume.exe', { type: 'application/pdf' });
  const r = await w.fetch(careersPost(careersForm({ file })), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: an oversized resume is rejected', async () => {
  const big = new Uint8Array(6 * 1024 * 1024);
  big.set([0x25, 0x50, 0x44, 0x46, 0x2d]);
  const file = new File([big], 'resume.pdf', { type: 'application/pdf' });
  const r = await w.fetch(careersPost(careersForm({ file })), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: wrong Content-Type (not multipart) is refused', async () => {
  const r = await w.fetch(new Request('https://glctechsec.com/api/careers', {
    method: 'POST', headers: { Origin: 'https://glctechsec.com', 'Content-Type': 'application/json' }, body: '{}',
  }), ENV, CTX);
  assert.strictEqual(r.status, 400);
});
test('careers: fails closed without secrets', async () => {
  const r = await w.fetch(careersPost(careersForm()), { ASSETS }, CTX);
  assert.strictEqual(r.status, 500);
});
test('careers: a valid submission reaches the send step (and fails there, with no secret leak)', async () => {
  const r = await w.fetch(careersPost(careersForm()), ENV, CTX);
  assert.strictEqual(r.status, 502);
  const data = await r.json();
  assert.strictEqual(data.success, false);
  assert.ok(!/smtp|zoho|password/i.test(data.message), 'error leaks internal detail');
});
test('careers: rate limits per IP', async () => {
  const store = new Map();
  const env = { ...ENV, RATE_LIMIT: { get: async (k) => store.get(k), put: async (k, v) => store.set(k, v) } };
  let last;
  for (let i = 0; i < 7; i++) {
    last = await w.fetch(careersPost(careersForm(), { headers: { 'CF-Connecting-IP': '8.8.8.8' } }), env, CTX);
  }
  assert.strictEqual(last.status, 429);
});
