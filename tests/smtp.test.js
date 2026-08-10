/**
 * Drives the SMTP client against a mock that behaves like Zoho, so the protocol
 * exchange is verified without a network or real credentials.
 */
const { test } = require('node:test');
const assert = require('node:assert');

const CRLF = '\r\n';

/**
 * A stand-in for a `cloudflare:sockets` socket. It plays scripted replies and
 * records everything the client wrote, so we can assert on the exact dialogue.
 */
function mockSocket(script) {
  const written = [];
  let step = 0;
  let pushChunk;
  const queue = [];

  const readable = {
    getReader() {
      return {
        read: () =>
          new Promise((resolve) => {
            if (queue.length) return resolve({ value: queue.shift(), done: false });
            pushChunk = (v) => resolve({ value: v, done: false });
          }),
        releaseLock() {},
      };
    },
  };

  const emit = (text) => {
    if (pushChunk) { const p = pushChunk; pushChunk = null; p(text); }
    else queue.push(text);
  };

  const writable = {
    getWriter() {
      return {
        async write(bytes) {
          const line = Buffer.from(bytes).toString('utf8');
          written.push(line);
          const reply = script[step++];
          if (reply === undefined || reply === null) return;
          for (const chunk of Array.isArray(reply) ? reply : [reply]) emit(chunk);
        },
        async close() {},
      };
    },
  };

  // Greeting arrives before the client writes anything.
  emit(script.greeting !== undefined ? script.greeting : '220 mx.zoho.com ESMTP' + CRLF);

  return { socket: { readable, writable }, written };
}

function loadSmtp() {
  // The module is ESM; load it through a dynamic import.
  return import('../worker/lib/smtp.js');
}

const OK_SCRIPT = [
  '250-mx.zoho.com' + CRLF + '250-AUTH LOGIN PLAIN' + CRLF + '250 SIZE 53477376' + CRLF, // EHLO
  '334 VXNlcm5hbWU6' + CRLF,          // AUTH LOGIN
  '334 UGFzc3dvcmQ6' + CRLF,          // username accepted
  '235 Authentication Successful' + CRLF,
  '250 Sender OK' + CRLF,             // MAIL FROM
  '250 Recipient OK' + CRLF,          // RCPT TO
  '354 Start mail input' + CRLF,      // DATA
  '250 Message received' + CRLF,      // body
  '221 Bye' + CRLF,                   // QUIT
];

const BASE = {
  user: 'contact@glctechsec.com',
  pass: 'app-specific-password',
  from: '"GLCTech website" <contact@glctechsec.com>',
  to: 'contact@glctechsec.com',
  replyTo: '"Jane Smith" <jane@acme.co.uk>',
  subject: 'New website enquiry — Jane Smith',
  text: 'Name:    Jane Smith\nMessage:\nWe need monitoring.',
};

test('completes the full Zoho dialogue in the right order', async () => {
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  const res = await sendMail({ ...BASE, connect: () => socket });

  assert.deepStrictEqual(res, { ok: true });
  const commands = written.map((w) => w.split(CRLF)[0]);
  assert.match(commands[0], /^EHLO /);
  assert.strictEqual(commands[1], 'AUTH LOGIN');
  assert.strictEqual(commands[2], Buffer.from(BASE.user).toString('base64'));
  assert.strictEqual(commands[3], Buffer.from(BASE.pass).toString('base64'));
  assert.strictEqual(commands[4], `MAIL FROM:<${BASE.user}>`);
  assert.strictEqual(commands[5], `RCPT TO:<${BASE.to}>`);
  assert.strictEqual(commands[6], 'DATA');
  assert.strictEqual(commands[8], 'QUIT');
});

test('uses implicit TLS on port 465', async () => {
  const { sendMail } = await loadSmtp();
  const { socket } = mockSocket(OK_SCRIPT);
  let addr, opts;
  await sendMail({ ...BASE, connect: (a, o) => { addr = a; opts = o; return socket; } });
  assert.strictEqual(addr.hostname, 'smtppro.zoho.com');
  assert.strictEqual(addr.port, 465);
  assert.strictEqual(opts.secureTransport, 'on');
});

test('parses a multi-line 250 reply as one response', async () => {
  // "250-" continuation lines must not be mistaken for the end of the reply.
  const { sendMail } = await loadSmtp();
  const { socket } = mockSocket(OK_SCRIPT);
  await sendMail({ ...BASE, connect: () => socket });
});

test('handles a reply split across TCP chunks', async () => {
  // TCP gives no guarantee that one reply arrives in one chunk.
  const script = [...OK_SCRIPT];
  script[0] = ['250-mx.zoho.com' + CRLF + '250-AUTH LOGIN', ' PLAIN' + CRLF + '250 SIZE 53477376' + CRLF];
  const { sendMail } = await loadSmtp();
  const { socket } = mockSocket(script);
  const res = await sendMail({ ...BASE, connect: () => socket });
  assert.deepStrictEqual(res, { ok: true });
});

test('sends the body terminated by a lone dot', async () => {
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  await sendMail({ ...BASE, connect: () => socket });
  const body = written[7];
  assert.ok(body.endsWith(CRLF + '.' + CRLF), 'DATA was not terminated correctly');
  assert.match(body, /^From: /m);
  assert.match(body, /^Reply-To: "Jane Smith" <jane@acme\.co\.uk>$/m);
  assert.match(body, /^Content-Type: text\/plain; charset=utf-8$/m);
});

test('dot-stuffs body lines that begin with a dot', async () => {
  // A bare "." line would end the message early and truncate it.
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  await sendMail({ ...BASE, connect: () => socket, text: 'line one\n. sneaky\nline three' });
  assert.match(written[7], /\r\n\.\. sneaky\r\n/);
});

test('strips CRLF from headers so nothing can be injected', async () => {
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  await sendMail({
    ...BASE,
    connect: () => socket,
    subject: 'Hello\r\nBcc: attacker@evil.example',
    replyTo: '"X"\r\nX-Injected: yes <x@y.co>',
  });
  const body = written[7];
  assert.ok(!/^Bcc:/m.test(body), 'header injection via subject succeeded');
  assert.ok(!/^X-Injected:/m.test(body), 'header injection via reply-to succeeded');
});

test('surfaces an authentication failure without leaking the password', async () => {
  const { sendMail } = await loadSmtp();
  const script = [...OK_SCRIPT];
  script[3] = '535 Authentication Failed' + CRLF;
  const { socket } = mockSocket(script);
  await assert.rejects(
    () => sendMail({ ...BASE, connect: () => socket }),
    (err) => {
      assert.match(err.message, /password failed/);
      assert.ok(!err.message.includes(BASE.pass), 'the error echoed the password');
      return true;
    });
});

test('rejects a refused recipient', async () => {
  const { sendMail } = await loadSmtp();
  const script = [...OK_SCRIPT];
  script[5] = '550 Relaying disallowed' + CRLF;
  const { socket } = mockSocket(script);
  await assert.rejects(() => sendMail({ ...BASE, connect: () => socket }), /RCPT TO failed/);
});

test('rejects a bad greeting instead of pushing on', async () => {
  const { sendMail } = await loadSmtp();
  const script = [...OK_SCRIPT];
  script.greeting = '421 Service not available' + CRLF;
  const { socket } = mockSocket(script);
  await assert.rejects(() => sendMail({ ...BASE, connect: () => socket }), /greeting failed/);
});

/* ── attachments (careers form resume) ────────────────────────────────────── */

test('builds a multipart/mixed message when an attachment is supplied', async () => {
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
  const res = await sendMail({
    ...BASE,
    connect: () => socket,
    attachment: { filename: 'resume.pdf', contentType: 'application/pdf', data: pdfBytes },
  });
  assert.deepStrictEqual(res, { ok: true });
  const body = written[7];
  assert.match(body, /^Content-Type: multipart\/mixed; boundary="/m);
  assert.match(body, /^Content-Type: application\/pdf; name="resume\.pdf"$/m);
  assert.match(body, /^Content-Disposition: attachment; filename="resume\.pdf"$/m);
  assert.match(body, /^Content-Transfer-Encoding: base64$/m);
  // The base64 payload decodes back to the original bytes.
  const b64Line = body.split(CRLF).find((l) => /^[A-Za-z0-9+/]+=*$/.test(l) && l.length > 4);
  assert.strictEqual(Buffer.from(b64Line, 'base64').toString('utf8'), '%PDF-1.4');
});

test('sanitizes a crafted attachment filename so it cannot break the MIME header', async () => {
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  await sendMail({
    ...BASE,
    connect: () => socket,
    attachment: {
      filename: 'evil".pdf\r\nContent-Type: text/html',
      contentType: 'application/pdf',
      data: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    },
  });
  const body = written[7];
  assert.ok(!/^Content-Type: text\/html$/m.test(body), 'header injection via filename succeeded');
});

test('a plain-text message (no attachment) is unaffected', async () => {
  const { sendMail } = await loadSmtp();
  const { socket, written } = mockSocket(OK_SCRIPT);
  await sendMail({ ...BASE, connect: () => socket });
  const body = written[7];
  assert.ok(!/multipart\/mixed/.test(body), 'plain message unexpectedly became multipart');
});
