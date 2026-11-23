/** Systeme.io contact capture. The API key belongs only in the deployed Worker. */
const API = 'https://api.systeme.io/api/contacts';

export function crmConfigured(env) {
  return Boolean(env?.SYSTEME_API_KEY && /^[a-zA-Z0-9_]+$/.test(env.SYSTEME_ENQUIRY_FIELD_SLUG || ''));
}

export function buildLeadRecord({ name, email, phone, company, subject, message, qualifiers, attribution }) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  const lines = [`Enquiry: ${subject || 'General enquiry'}`, 'Source: Website'];
  if (company) lines.push(`Company: ${company}`);
  for (const [key, value] of Object.entries(qualifiers || {})) if (value) lines.push(`${key}: ${value}`);
  for (const [key, value] of Object.entries(attribution || {})) if (value) lines.push(`${key}: ${value}`);
  if (message) lines.push('', message);
  return { email, firstName: parts.slice(0, -1).join(' '), surname: parts.at(-1) || 'Unknown', phone,
    enquiry: lines.join('\n').slice(0, 5000) };
}

async function request(env, url, options, fetchImpl) {
  const res = await fetchImpl(url, {
    ...options,
    headers: { 'X-API-Key': env.SYSTEME_API_KEY, ...(options?.body ? { 'Content-Type': options.method === 'PATCH' ? 'application/merge-patch+json' : 'application/json' } : {}) },
  });
  if (!res.ok) throw new Error(`systeme contact http ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

/** Exact-email lookup, then create or update the latest enquiry field. */
export async function pushLead(env, lead, fetchImpl = fetch) {
  if (!crmConfigured(env)) throw new Error('systeme contact not configured');
  const result = await request(env, `${API}?email=${encodeURIComponent(lead.email)}`, {}, fetchImpl);
  if (!result || !Array.isArray(result.items) || typeof result.hasMore !== 'boolean') {
    throw new Error('systeme search returned unexpected result');
  }
  const matches = result.items.filter((item) => item.email?.toLowerCase() === lead.email.toLowerCase());
  if (result.hasMore || matches.length > 1 || (result.items.length && !matches.length)) {
    throw new Error('systeme search ambiguous; refusing to create duplicate');
  }
  const fields = [
    { slug: 'first_name', value: lead.firstName },
    { slug: 'surname', value: lead.surname },
    ...(lead.phone ? [{ slug: 'phone_number', value: lead.phone }] : []),
    { slug: env.SYSTEME_ENQUIRY_FIELD_SLUG, value: lead.enquiry },
  ];
  const existing = matches[0];
  if (existing) {
    if (!Number.isSafeInteger(existing.id) || existing.id <= 0) throw new Error('systeme contact missing id');
    const updated = await request(env, `${API}/${existing.id}`, { method: 'PATCH', body: JSON.stringify({ fields: [fields.at(-1)] }) }, fetchImpl);
    if (updated?.id !== existing.id) throw new Error('systeme update returned unexpected id');
    return { action: 'updated', id: existing.id };
  }
  const created = await request(env, API, { method: 'POST', body: JSON.stringify({ email: lead.email, locale: 'en', fields }) }, fetchImpl);
  if (!Number.isSafeInteger(created?.id) || created.id <= 0) throw new Error('systeme create returned no id');
  return { action: 'created', id: created.id };
}
