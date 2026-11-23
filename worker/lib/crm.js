/**
 * Zoho CRM lead capture, authenticated through Composio.
 *
 * The Worker never holds a Zoho OAuth token. It holds a Composio API key and
 * the id of the Zoho connection inside Composio; Composio owns the token
 * refresh. Both live in Worker secrets (COMPOSIO_API_KEY,
 * COMPOSIO_ZOHO_ACCOUNT_ID), never in the repository.
 *
 * Failure policy: CRM capture is best-effort. The notification e-mail is the
 * system of record of last resort, so a CRM outage must never turn a
 * successful enquiry into an error for the visitor.
 */

const EXECUTE_URL = 'https://backend.composio.dev/api/v3/tools/execute/';

export function crmConfigured(env) {
  return Boolean(env && env.COMPOSIO_API_KEY && env.COMPOSIO_ZOHO_ACCOUNT_ID);
}

async function execute(env, slug, args, fetchImpl) {
  const res = await fetchImpl(EXECUTE_URL + slug, {
    method: 'POST',
    headers: { 'x-api-key': env.COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ connected_account_id: env.COMPOSIO_ZOHO_ACCOUNT_ID, arguments: args }),
  });
  if (!res.ok) throw new Error(`composio ${slug} http ${res.status}`);
  const body = await res.json();
  if (body.successful === false || body.error) throw new Error(`composio ${slug} failed`);
  const data = body.data || body;
  if (data.success === false || data.error ||
      (Array.isArray(data.data) && data.data.some((row) => row.status === 'error'))) {
    throw new Error(`zoho ${slug} failed`);
  }
  return data;
}

/** Splits "Jane Q Smith" into Zoho's First_Name / Last_Name (Last_Name is mandatory). */
export function splitName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { First_Name: '', Last_Name: parts[0] || 'Unknown' };
  return { First_Name: parts.slice(0, -1).join(' '), Last_Name: parts[parts.length - 1] };
}

export function buildLeadRecord({ name, email, phone, company, subject, message, qualifiers, attribution }) {
  const lines = [`Enquiry: ${subject || 'General enquiry'}`, 'Source: Website'];
  for (const [k, v] of Object.entries(qualifiers || {})) if (v) lines.push(`${k}: ${v}`);
  for (const [k, v] of Object.entries(attribution || {})) if (v) lines.push(`${k}: ${v}`);
  if (message) lines.push('', message);
  return {
    ...splitName(name),
    Email: email,
    Phone: phone || undefined,
    Company: company || 'Not provided',
    Lead_Source: 'Web Download',
    Lead_Status: 'Not Contacted',
    Description: lines.join('\n').slice(0, 30000),
  };
}

/**
 * Creates the lead, or, if the e-mail already exists, attaches a Note to the
 * existing lead so repeat enquiries never create duplicates.
 * Returns { action: 'created'|'noted', id }.
 */
export async function pushLead(env, lead, fetchImpl = fetch) {
  const found = await execute(env, 'ZOHO_SEARCH_ZOHO_RECORDS',
    { module_api_name: 'Leads', email: lead.Email, fields: 'id,Email' }, fetchImpl);
  if (!Array.isArray(found?.data)) throw new Error('zoho search returned unexpected result');
  const existing = found.data[0];
  if (existing && existing.id) {
    await execute(env, 'ZOHO_CREATE_ZOHO_RECORD', {
      module_api_name: 'Notes',
      data: [{
        Parent_Id: { id: existing.id, module: 'Leads' },
        Note_Title: 'New website enquiry',
        Note_Content: lead.Description,
      }],
    }, fetchImpl);
    return { action: 'noted', id: existing.id };
  }
  const created = await execute(env, 'ZOHO_CREATE_ZOHO_RECORD',
    { module_api_name: 'Leads', data: [lead] }, fetchImpl);
  const row = created && Array.isArray(created.data) && created.data[0];
  const id = row && row.details && row.details.id;
  if (!id) throw new Error('zoho create returned no id');
  return { action: 'created', id };
}
