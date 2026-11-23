import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'cloudflare:sockets') return {
    url: 'data:text/javascript,export const connect = (...args) => globalThis.__testConnect(...args)',
    shortCircuit: true,
  };
  return nextResolve(specifier, context);
} });
const worker = (await import('../worker/index.js')).default;

function socket() {
  const replies = [
    '220 greeting\r\n',
    '250-hello\r\n250 AUTH LOGIN\r\n', '334 username\r\n', '334 password\r\n',
    '235 authenticated\r\n', '250 sender\r\n', '250 recipient\r\n',
    '354 data\r\n', '250 accepted\r\n', '221 bye\r\n',
  ];
  const writes = [];
  return {
    writes,
    readable: { getReader() { return { async read() { return { value: new TextEncoder().encode(replies.shift()), done: false }; }, releaseLock() {} }; } },
    writable: { getWriter() { return { async write(bytes) { writes.push(new TextDecoder().decode(bytes)); }, async close() {} }; } },
  };
}

test('CRM scheduling exception cannot reclassify delivered email as failed', async () => {
  const smtp = socket();
  globalThis.__testConnect = () => smtp;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ items: [], hasMore: false }));
  try {
    const response = await worker.fetch(new Request('https://glctechsec.com/api/contact', {
      method: 'POST', headers: { Origin: 'https://glctechsec.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Jane Smith', email: 'jane@example.test', message: 'Hello' }),
    }), {
      ZOHO_USER: 'contact@example.test', ZOHO_PASS: 'test-password',
      SYSTEME_API_KEY: 'test-key', SYSTEME_ENQUIRY_FIELD_SLUG: 'website_enquiry',
    }, { waitUntil() { throw new Error('scheduler unavailable'); } });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.__testConnect;
  }
});

test('contact forwards cleaned UK qualifiers and attribution into a new Systeme contact', async () => {
  const smtp = socket();
  globalThis.__testConnect = () => smtp;
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, body: options?.body ? JSON.parse(options.body) : null });
    return new Response(JSON.stringify(calls.length === 1
      ? { items: [], hasMore: false } : { id: 456 }), { status: calls.length === 1 ? 200 : 201 });
  };
  const pending = [];
  try {
    const response = await worker.fetch(new Request('https://glctechsec.com/api/contact', {
      method: 'POST', headers: { Origin: 'https://glctechsec.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Smith', email: 'jane@example.test', message: 'Please call me',
        sector: 'Healthcare', team_size: '20', trigger: 'Bid deadline', deadline: 'June',
        certification: 'ISO 27001', source_page: '/uk-prove', utm_source: 'search',
        utm_medium: 'paid', utm_campaign: 'spring', referrer: 'https://search.example/',
      }),
    }), {
      ZOHO_USER: 'contact@example.test', ZOHO_PASS: 'test-password',
      SYSTEME_API_KEY: 'test-key', SYSTEME_ENQUIRY_FIELD_SLUG: 'website_enquiry',
    }, { waitUntil: (p) => pending.push(p) });
    assert.equal(response.status, 200);
    await Promise.all(pending);
    assert.equal(calls.length, 2);
    const lead = calls[1].body;
    assert.equal(lead.fields.find((f) => f.slug === 'surname').value, 'Smith');
    const enquiry = lead.fields.find((f) => f.slug === 'website_enquiry').value;
    for (const detail of ['Source: Website', 'Sector: Healthcare', 'Team size: 20',
      'Trigger: Bid deadline', 'Deadline: June', 'Current certification: ISO 27001',
      'Source page: /uk-prove', 'UTM source: search', 'UTM medium: paid',
      'UTM campaign: spring', 'Referrer: https://search.example/']) {
      assert.ok(enquiry.includes(detail), `missing ${detail}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.__testConnect;
  }
});

test('contact returns email success even when best-effort CRM fails', async () => {
  const smtp = socket();
  globalThis.__testConnect = () => smtp;
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, body: options?.body ? JSON.parse(options.body) : null });
    return new Response(JSON.stringify({ error: 'CRM unavailable' }), { status: 503 });
  };
  const pending = [];
  try {
    const body = {
      name: 'Jane Smith', email: 'jane@example.test', message: 'Please call me',
      sector: 'Healthcare', team_size: '20', source_page: '/uk-prove', utm_source: 'search',
    };
    const response = await worker.fetch(new Request('https://glctechsec.com/api/contact', {
      method: 'POST', headers: { Origin: 'https://glctechsec.com', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }), {
      ZOHO_USER: 'contact@example.test', ZOHO_PASS: 'test-password',
      SYSTEME_API_KEY: 'test-key', SYSTEME_ENQUIRY_FIELD_SLUG: 'website_enquiry',
    }, { waitUntil: (p) => pending.push(p) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    await Promise.all(pending);
    assert.equal(pending.length, 1);
    assert.equal(calls.length, 1, 'search fails, no duplicate create');
    assert.match(calls[0].url, /api\.systeme\.io\/api\/contacts\?email=/);
    assert.match(smtp.writes.join(''), /Please call me/);
    assert.match(smtp.writes.join(''), /Source page: \/uk-prove/);
    assert.match(smtp.writes.join(''), /UTM source: search/);
    assert.match(smtp.writes.join(''), /Sector: Healthcare/);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.__testConnect;
  }
});
