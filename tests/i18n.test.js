'use strict';

/**
 * Translation-dictionary tests.
 *
 * The site is fully multilingual and updated frequently. The single biggest
 * risk when editing copy is adding/removing a key in one language but not the
 * others, which silently falls back to English at runtime. These tests make
 * that a hard failure so it is caught before merge.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTranslations } = require('./helpers/loadI18n');

const translations = loadTranslations();
const EXPECTED_LANGS = ['pt', 'en', 'de', 'es', 'fr', 'it'];
const REFERENCE = 'en';

test('exposes all expected languages', () => {
  for (const lang of EXPECTED_LANGS) {
    assert.ok(
      translations[lang] && typeof translations[lang] === 'object',
      `missing language block: "${lang}"`
    );
  }
});

test('every language has the exact same set of keys as the reference (en)', () => {
  const refKeys = Object.keys(translations[REFERENCE]).sort();

  for (const lang of Object.keys(translations)) {
    const langKeys = new Set(Object.keys(translations[lang]));
    const missing = refKeys.filter((k) => !langKeys.has(k));
    const extra = [...langKeys].filter((k) => !refKeys.includes(k)).sort();

    assert.deepEqual(
      missing,
      [],
      `language "${lang}" is missing ${missing.length} key(s) present in "${REFERENCE}": ${missing.join(', ')}`
    );
    assert.deepEqual(
      extra,
      [],
      `language "${lang}" has ${extra.length} key(s) not present in "${REFERENCE}": ${extra.join(', ')}`
    );
  }
});

test('no translation value is empty or non-string', () => {
  for (const lang of Object.keys(translations)) {
    for (const [key, value] of Object.entries(translations[lang])) {
      assert.equal(
        typeof value,
        'string',
        `[${lang}] value for "${key}" is not a string`
      );
      assert.ok(
        value.trim().length > 0,
        `[${lang}] value for "${key}" is empty`
      );
    }
  }
});

test('English homepage hero leads with UK compliance confidence', () => {
  const en = translations.en;

  assert.equal(en['hero.badge'], 'Cybersecurity assurance for UK professional firms');
  assert.equal(en['hero.h1'], 'Prove you protect<br><span>client data</span>');
  assert.equal(
    en['hero.p'],
    'We help accountancy, legal, financial and regulated firms answer security questions from clients, insurers and regulators with clear evidence — then close the gaps.'
  );
  assert.equal(en['hero.cta1'], 'See the Evidence Review');
  assert.equal(en['hero.cta2'], 'See Who We Help');
});

test('monitoring copy avoids unsupported support promises in every language', () => {
  const en = translations.en;
  const retiredClaims = [
    'Suporte 24/7', 'NOC dedicado', 'NOC dedicado 24/7', 'Suporte 24/7 com NOC dedicado',
    '24/7 Support', 'Dedicated NOC', 'Dedicated NOC 24/7', '24/7 Support with dedicated NOC',
    '24/7-Support', 'Dediziertes NOC', 'Dediziertes NOC 24/7', '24/7-Support mit dediziertem NOC',
    'Soporte 24/7', 'NOC dedicado', 'NOC dedicado 24/7', 'Soporte 24/7 con NOC dedicado',
    'Support 24/7', 'NOC dédié', 'NOC dédié 24/7', 'Support 24/7 avec NOC dédié',
    'Supporto 24/7', 'NOC dedicato', 'NOC dedicato 24/7', 'Supporto 24/7 con NOC dedicato',
  ];

  assert.equal(en['zabbix.p1.f4'], 'Business-hours support');
  assert.equal(en['zabbix.p1.f5'], 'Shared operations team');
  assert.equal(en['zabbix.p2.f5'], 'Response targets agreed in the SLA');
  assert.equal(en['zabbix.p3.f4'], '24/7 cover available only under a separately costed SLA');

  for (const lang of EXPECTED_LANGS) {
    const values = Object.values(translations[lang]);
    for (const claim of retiredClaims) {
      assert.ok(!values.includes(claim), `[${lang}] still exposes retired claim: ${claim}`);
    }
    assert.ok(
      !/Estimated|Estimada|Estimée|Geschätzte|Stimata|Recorrência/.test(translations[lang]['zabbix.result.label']),
      `[${lang}] still presents the simulator as a converted estimate`
    );
  }
});

test('no locale guarantees SLAs, implies continuous cover, or gives away the review', () => {
  // The English copy was rewritten first; stale sibling locales would silently
  // restore guaranteed SLAs and free-diagnosis CTAs on every language switch.
  const banned = [
    /SLA\s+garant/i,                       // pt/es/fr/it guaranteed SLA
    /garantierter\s+SLA/i,                 // de guaranteed SLA
    /suporte\s+t[eé]cnico\s+cont[ií]nuo/i, // pt implied continuous cover
    /soporte\s+t[eé]cnico\s+continuo/i,    // es
    /support\s+technique\s+continu/i,      // fr
    /supporto\s+tecnico\s+continuo/i,      // it
    /kontinuierlicher\s+technischer/i,     // de
    /continuous\s+technical\s+support/i,   // en
    /diagn[oó]stic[oa]\s+grat/i,           // pt/es/it free diagnosis
    /diagnostic\s+gratuit/i,               // fr
    /kostenlose\s+diagnose/i,              // de
  ];

  for (const lang of EXPECTED_LANGS) {
    for (const [key, value] of Object.entries(translations[lang])) {
      if (typeof value !== 'string') continue;
      for (const rule of banned) {
        assert.ok(!rule.test(value), `[${lang}] ${key} still says: ${value}`);
      }
    }
  }
});
