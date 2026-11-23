import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadRecord, crmConfigured, pushLead } from '../worker/lib/crm.js';

const env = { SYSTEME_API_KEY: 'test-key', SYSTEME_ENQUIRY_FIELD_SLUG: 'website_enquiry' };
const lead = buildLeadRecord({ name: 'Jane Smith', email: 'jane+offer@example.test', message: 'Please help.',
  qualifiers: { Sector: 'Healthcare' }, attribution: { 'UTM campaign': 'spring' } });
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('requires both API key and a safe custom field slug', () => {
  assert.equal(crmConfigured(env), true);
  assert.equal(crmConfigured({ SYSTEME_API_KEY: 'test-key' }), false);
  assert.equal(crmConfigured({ ...env, SYSTEME_ENQUIRY_FIELD_SLUG: 'bad/slug' }), false);
});

test('builds contact and keeps website context', () => {
  assert.equal(lead.firstName, 'Jane');
  assert.equal(lead.surname, 'Smith');
  assert.match(lead.enquiry, /Sector: Healthcare/);
  assert.match(lead.enquiry, /UTM campaign: spring/);
});

test('new contact uses exact-email lookup, X-API-Key and official create schema', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return reply(calls.length === 1 ? { items: [], hasMore: false } : { id: 456 }, calls.length === 1 ? 200 : 201);
  };
  assert.deepEqual(await pushLead(env, lead, fetchImpl), { action: 'created', id: 456 });
  assert.equal(calls[0].url, 'https://api.systeme.io/api/contacts?email=jane%2Boffer%40example.test');
  assert.equal(calls[0].options.headers['X-API-Key'], env.SYSTEME_API_KEY);
  assert.equal(calls[1].options.method, 'POST');
  const body = JSON.parse(calls[1].options.body);
  assert.equal(body.email, lead.email);
  assert.equal(body.fields.find((f) => f.slug === 'surname').value, 'Smith');
  assert.equal(body.fields.find((f) => f.slug === 'website_enquiry').value, lead.enquiry);
});

test('repeat contact updates only enquiry field, not unrelated profile fields', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return reply(calls.length === 1 ? { items: [{ id: 123, email: lead.email }], hasMore: false } : { id: 123 });
  };
  assert.deepEqual(await pushLead(env, lead, fetchImpl), { action: 'updated', id: 123 });
  assert.equal(calls[1].url, 'https://api.systeme.io/api/contacts/123');
  assert.equal(calls[1].options.headers['Content-Type'], 'application/merge-patch+json');
  assert.deepEqual(JSON.parse(calls[1].options.body), { fields: [{ slug: 'website_enquiry', value: lead.enquiry }] });
});

test('failed or ambiguous lookup never creates a duplicate', async () => {
  for (const result of [{ unexpected: [] }, { items: [], hasMore: true }, { items: [{ id: 1, email: 'someone@example.test' }], hasMore: false }]) {
    let calls = 0;
    await assert.rejects(() => pushLead(env, lead, async () => { calls++; return reply(result); }));
    assert.equal(calls, 1);
  }
  let calls = 0;
  await assert.rejects(() => pushLead(env, lead, async () => { calls++; return reply({}, 429); }), /429/);
  assert.equal(calls, 1);
});

test('create failure or missing id is not reported as captured', async () => {
  await assert.rejects(() => pushLead(env, lead, async (url, options) => options?.method === 'POST' ? reply({}, 201) : reply({ items: [], hasMore: false })), /no id/);
});
