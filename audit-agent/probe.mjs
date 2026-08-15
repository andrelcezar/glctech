#!/usr/bin/env node
/**
 * Real-browser probe for the GLCTechSec continuous-audit agent.
 *
 * Everything else the audit does (headers, meta tags, HTML structure, broken
 * links, secrets) is checked with plain HTTP (curl/WebFetch) from the Skill
 * directly. This script exists only for the handful of checks that genuinely
 * require a rendered page: JS console errors, failed sub-resource requests,
 * and basic load timing. Read-only — it never submits a form, clicks a
 * button, or writes anything back to the page or the site.
 *
 * Usage: node audit-agent/probe.mjs <url> [url2 ...]
 * Output: a JSON array on stdout, one object per URL. Never throws past a
 * single URL's failure — a broken page is a finding, not a crash.
 *
 * KNOWN LIMITATION: in a Claude Code Remote session behind the agent egress
 * proxy, real-browser navigation to an external HTTPS host can fail with
 * net::ERR_CONNECTION_RESET even with the proxy configured correctly below
 * (observed against https://glctechsec.com during development — plain
 * curl/WebFetch to the same URL worked fine in the same session, so this is
 * specific to Chromium's own network stack in this sandbox, not the site).
 * When that happens here, every result has `ok: false` — the Skill must
 * report the console-error/timing checks as "não avaliado", never invent a
 * result. This may work outside that specific proxy configuration.
 */
import { chromium } from 'playwright';

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error('Usage: node audit-agent/probe.mjs <url> [url2 ...]');
  process.exit(1);
}

async function probeOne(browser, url) {
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 500));
  });
  page.on('requestfailed', (req) => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || 'unknown' });
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  const result = { url, ok: false };
  try {
    const response = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
    result.httpStatus = response ? response.status() : null;

    // Let any late console errors / async requests settle briefly.
    await page.waitForTimeout(1500);

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return null;
      return {
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadEventMs: Math.round(nav.loadEventEnd),
        transferSizeBytes: nav.transferSize || null,
      };
    });

    result.ok = true;
    result.timing = timing;
    result.consoleErrors = consoleErrors;
    result.failedRequests = failedRequests;
  } catch (err) {
    result.error = String(err && err.message ? err.message : err).slice(0, 500);
    result.consoleErrors = consoleErrors;
    result.failedRequests = failedRequests;
  } finally {
    await context.close();
  }
  return result;
}

async function main() {
  // This environment pre-installs Chromium at a fixed path (see repo/session
  // docs) that may not match the exact revision this Playwright version
  // expects — point at it directly instead of trying to download a new one.
  const launchOptions = {};
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    const pinned = `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium`;
    const { existsSync } = await import('node:fs');
    if (existsSync(pinned)) launchOptions.executablePath = pinned;
  }
  // This session's outbound HTTPS goes through a local policy-enforcing proxy
  // (see /root/.ccr/README.md); Chromium does not pick that up from the
  // HTTPS_PROXY env var automatically, so it is passed explicitly. The
  // proxy's CA is already installed in the system trust store, so no
  // certificate-verification override is needed or used here.
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxyUrl) launchOptions.proxy = { server: proxyUrl };
  const browser = await chromium.launch(launchOptions);
  const results = [];
  try {
    for (const url of urls) {
      results.push(await probeOne(browser, url));
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('probe.mjs failed:', err && err.message);
  process.exit(1);
});
