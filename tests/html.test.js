'use strict';

/**
 * Structural HTML sanity checks + i18n-key integrity for every page.
 *
 * These are intentionally lightweight (no external parser) so they stay fast
 * and dependency-free while still catching the mistakes that actually happen
 * when hand-editing pages: a missing <title>, a dropped `lang` attribute, or
 * a `data-i18n` reference to a translation key that does not exist.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadTranslations, REPO_ROOT } = require('./helpers/loadI18n');

const en = loadTranslations().en;

const htmlFiles = fs
  .readdirSync(REPO_ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort();

test('there is at least one HTML page to validate', () => {
  assert.ok(htmlFiles.length > 0, 'no .html files found in repo root');
});

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');

  // Some files (e.g. stats-snippet.html) are embeddable HTML fragments, not
  // standalone documents. Full-page structural checks only apply to real
  // pages, which we detect by the presence of an <html> tag.
  const isFullPage = /<html[\s>]/i.test(html);

  test(`${file}: has a <!doctype html> declaration`, { skip: !isFullPage && 'HTML fragment' }, () => {
    assert.match(html.slice(0, 200), /<!doctype html>/i, 'missing <!doctype html>');
  });

  test(`${file}: has a <html lang="…"> attribute`, { skip: !isFullPage && 'HTML fragment' }, () => {
    assert.match(html, /<html[^>]*\slang=["'][^"']+["']/i, 'missing lang attribute on <html>');
  });

  test(`${file}: has a non-empty <title>`, { skip: !isFullPage && 'HTML fragment' }, () => {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    assert.ok(m, 'missing <title> element');
    assert.ok(m[1].trim().length > 0, '<title> is empty');
  });

  test(`${file}: has balanced <html> and <body> tags`, { skip: !isFullPage && 'HTML fragment' }, () => {
    assert.equal((html.match(/<html[\s>]/gi) || []).length, 1, 'expected exactly one <html>');
    assert.equal((html.match(/<\/html>/gi) || []).length, 1, 'expected exactly one </html>');
    assert.equal((html.match(/<body[\s>]/gi) || []).length, 1, 'expected exactly one <body>');
    assert.equal((html.match(/<\/body>/gi) || []).length, 1, 'expected exactly one </body>');
  });

  test(`${file}: every data-i18n / data-i18n-html key exists in the dictionary`, () => {
    // data-i18n and data-i18n-html hold translation KEYS.
    // data-i18n-attr holds an ATTRIBUTE NAME (e.g. "placeholder"), not a key.
    const keys = [...html.matchAll(/data-i18n(?:-html)?=["']([^"']+)["']/g)].map((m) => m[1]);
    const unknown = [...new Set(keys)].filter((k) => en[k] === undefined);
    assert.deepEqual(
      unknown,
      [],
      `${file} references ${unknown.length} unknown translation key(s): ${unknown.join(', ')}`
    );
  });
}

test('index.html fallback hero matches the UK compliance-led English copy', () => {
  const html = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');

  assert.match(html, /Cybersecurity assurance for UK professional firms/);
  assert.match(html, /Prove you protect<br><span>client data<\/span>/);
  assert.match(html, /See the Evidence Review/);
  assert.match(html, /href="#sectors"[^>]*>See Who We Help/);
});

test('UK homepage presents Prove as a paid primary offer', () => {
  const html = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');

  assert.match(html, /id="prove-offer"/);
  assert.match(html, /Security Evidence Review/);
  assert.match(html, /Cyber Essentials readiness/);
  assert.match(html, /Questionnaire evidence/);
  assert.match(html, /Paid fixed-scope engagement/);
  assert.match(html, /Your quote is agreed before work starts/);
  assert.doesNotMatch(html, /From £1,250/);
  assert.match(html, /Monitoring is optional and quoted separately/);
});

test('UK monitoring is scoped instead of converted from Brazilian prices', () => {
  const html = fs.readFileSync(path.join(REPO_ROOT, 'zabbix.html'), 'utf8');

  assert.doesNotMatch(html, /£\s*80(?:\D|$)/);
  assert.doesNotMatch(html, /£\s*210(?:\D|$)/);
  assert.doesNotMatch(html, /rate:\s*0\./);
  assert.doesNotMatch(html, /totalBRL|fmtMoney|valueInBRL/);
  assert.match(html, /const PROPOSAL_LABEL/);
  assert.match(html, /Scoped UK proposal/);
  assert.match(html, /24\/7 cover available only under a separately costed SLA/);
});

test('UK trust pages do not give away the Security Gap Assessment', () => {
  const pages = ['about-the-group.html', 'trust-compliance.html']
    .map((file) => fs.readFileSync(path.join(REPO_ROOT, file), 'utf8'))
    .join('\n');

  assert.doesNotMatch(pages, /free[^<.]{0,80}Security Gap Assessment/i);
  assert.doesNotMatch(pages, /Book a free assessment/i);
  assert.match(pages, /paid Security Evidence Review/);
});

// Unqualified cover promises crept back in twice: once through SEO/OG metadata
// and once through the static fallback text a page shows before i18n hydrates.
// Both are buyer-facing, so the sweep covers every UK page in full, not a
// hand-picked list. landing.html is the pt-BR Brazil funnel on a different cost
// base and is out of UK scope.
const BANNED_UK_CLAIMS = [
  /dedicated\s+NOC/i,
  /NOC\s*24\s*[x\u00d7/]\s*7/i,
  /round-the-clock/i,
  /24\s*[x\u00d7]\s*7/i,
  /99[.,]9\s*%?\s*SLA/i,
  /(?:guaranteed\s+SLA|SLA\s+guaranteed)/i,
  /24\/7(?!\s+cover available only under a separately costed SLA)/i,
];

for (const file of htmlFiles.filter((f) => f !== 'landing.html')) {
  test(`${file}: makes no unqualified 24/7 or dedicated-NOC promise`, () => {
    const html = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
    for (const rule of BANNED_UK_CLAIMS) {
      const hit = html.match(rule);
      assert.ok(!hit, `${file} still promises: ${hit && hit[0]}`);
    }
  });
}

test('UK service pages qualify cover and service levels explicitly', () => {
  const pages = ['zabbix.html', 'about-the-group.html', 'veeam.html']
    .map((file) => fs.readFileSync(path.join(REPO_ROOT, file), 'utf8'))
    .join('\n');

  assert.match(pages, /separately costed SLA/);
  assert.match(pages, /contract-defined service levels/);
});
