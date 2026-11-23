const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const read = (file) => readFileSync(join(__dirname, '..', file), 'utf8');

test('evidence review pricing uses approved staff tiers, and separates other paid services', () => {
  const html = read('uk-evidence-review.html');
  for (const [range, price] of [['Up to 25 staff', '£1,250'], ['26–75 staff', '£2,250'], ['76–150 staff', '£3,950']]) {
    assert.match(html, new RegExp(range + '[\\s\\S]{0,120}' + price));
  }
  assert.match(html, /retest[^<]*within 30 days/i);
  assert.match(html, /Cyber Essentials[^<]*£750[^<]*IASME fee at cost/i);
  assert.match(html, /Cyber Essentials Plus[^<]*£1,750[^<]*audit and assessor costs/i);
  assert.match(html, /£900[^<]*4 hours[^<]*£1,650[^<]*8 hours[^<]*£3,000[^<]*16 hours/i);
  assert.doesNotMatch(html, /\\1|Fixed quote, same day|Priced by evidence items/);
});

test('scoping links are working email fallbacks, not fake bookings or dead anchors', () => {
  const html = read('uk-evidence-review.html');
  const links = [...html.matchAll(/<a\b[^>]*data-booking-link[^>]*>/g)].map((m) => m[0]);
  assert.ok(links.length >= 3);
  for (const link of links) assert.match(link, /href="mailto:contact@glctechsec\.com\?subject=Scoping%20call"/);
  assert.doesNotMatch(html, /Book a 30-minute scoping call|Book a scoping call|Book a free 30-minute/);
});

test('evidence form keeps contact endpoint, validation, honeypot, and Turnstile', () => {
  const html = read('uk-evidence-review.html');
  assert.match(html, /DIAGNOSTIC_ENDPOINT = '\/api\/contact'/);
  assert.match(html, /validateDiagnostico\(\)/);
  assert.match(html, /name="website"/);
  assert.match(html, /name="team_size"/);
  assert.doesNotMatch(html, /name="evidence_items"/);
  assert.match(html, /cf-turnstile-response/);
});

test('monitoring base prices and separate extended coverage are visible', () => {
  const html = read('zabbix.html');
  assert.match(html, /£950 setup/);
  assert.match(html, /£450\/month/);
  assert.match(html, /up to 30 hosts/);
  assert.match(html, /£9 per additional host/);
  assert.match(html, /business.hours/i);
  assert.match(html, /24\/7[^<]*separately costed/i);
});

test('offer is linked from homepage and discoverable in sitemap', () => {
  assert.match(read('index.html'), /href="uk-evidence-review\.html"/);
  assert.match(read('sitemap.xml'), /https:\/\/glctechsec\.com\/uk-evidence-review\.html/);
});
