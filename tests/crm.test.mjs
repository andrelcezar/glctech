import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadRecord, pushLead } from '../worker/lib/crm.js';

const env = { COMPOSIO_API_KEY: 'test-key', COMPOSIO_ZOHO_ACCOUNT_ID: 'test-account' };
const lead = buildLeadRecord({ name: 'Jane Smith', email: 'jane@example.test', message: 'Please help.' });

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

test('lead uses verified CRM source and preserves offer attribution', () => {
  const record = buildLeadRecord({
    name: 'Jane Smith', email: 'jane@example.test', message: 'Please help.',
    qualifiers: { Sector: 'Healthcare', Deadline: 'June' },
    attribution: { 'Source page': '/uk-prove', 'UTM campaign': 'spring' },
  });
  assert.equal(record.First_Name, 'Jane');
  assert.equal(record.Last_Name, 'Smith');
  assert.equal(record.Lead_Source, 'Web Download');
  assert.match(record.Description, /Source: Website/);
  assert.match(record.Description, /Sector: Healthcare/);
  assert.match(record.Description, /Deadline: June/);
  assert.match(record.Description, /Source page: \/uk-prove/);
  assert.match(record.Description, /UTM campaign: spring/);
});

test('nested Zoho note error is surfaced instead of reported as noted', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    if (calls === 1) return reply({ successful: true, data: { data: [{ id: '123', Email: lead.Email }] } });
    return reply({ successful: true, data: { data: [{ code: 'INVALID_DATA', message: 'invalid parent', status: 'error' }] } });
  };
  await assert.rejects(() => pushLead(env, lead, fetchImpl), /failed|no id/i);
  assert.equal(calls, 2);
});

test('new lead uses schema-compliant search and create requests with mandatory surname', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return reply(calls.length === 1
      ? { successful: true, data: { data: [] } }
      : { successful: true, data: { data: [{ status: 'success', details: { id: '456' } }] } });
  };
  assert.deepEqual(await pushLead(env, lead, fetchImpl), { action: 'created', id: '456' });
  assert.equal(calls[0].body.connected_account_id, env.COMPOSIO_ZOHO_ACCOUNT_ID);
  assert.deepEqual(calls[0].body.arguments, { module_api_name: 'Leads', email: lead.Email, fields: 'id,Email' });
  assert.match(calls[1].url, /ZOHO_CREATE_ZOHO_RECORD$/);
  assert.equal(calls[1].body.arguments.module_api_name, 'Leads');
  assert.equal(calls[1].body.arguments.data[0].Last_Name, 'Smith');
  assert.equal(calls[1].body.arguments.data[0].Email, lead.Email);
});

test('repeat lead attaches enquiry note to the existing Lead', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push(JSON.parse(options.body));
    return reply(calls.length === 1
      ? { successful: true, data: { data: [{ id: '123', Email: lead.Email }] } }
      : { successful: true, data: { data: [{ status: 'success', details: { id: '789' } }] } });
  };
  assert.deepEqual(await pushLead(env, lead, fetchImpl), { action: 'noted', id: '123' });
  assert.equal(calls[1].arguments.module_api_name, 'Notes');
  assert.deepEqual(calls[1].arguments.data[0].Parent_Id, { id: '123', module: 'Leads' });
  assert.equal(calls[1].arguments.data[0].Note_Content, lead.Description);
});

test('unrecognised search response does not assume no duplicate', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return reply({ successful: true, data: { unexpected: [] } });
  };
  await assert.rejects(() => pushLead(env, lead, fetchImpl), /search|unexpected/i);
  assert.equal(calls, 1);
});

test('search failure does not create a duplicate lead', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return reply({ successful: false, error: 'search unavailable' });
  };
  await assert.rejects(() => pushLead(env, lead, fetchImpl), /search|composio/i);
  assert.equal(calls.length, 1, 'do not create a lead when deduplication is unavailable');
  assert.match(calls[0].url, /ZOHO_SEARCH_ZOHO_RECORDS$/);
});
