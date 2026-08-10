/**
 * Field and file validation shared by /api/contact and /api/careers.
 * Never trusts a client-supplied MIME type or extension alone — the resume
 * upload is checked against its own magic bytes before it is treated as a PDF.
 */

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

/** PDF files start with "%PDF-" (0x25 0x50 0x44 0x46 0x2D). */
export function isPdfMagicBytes(bytes) {
  if (!bytes || bytes.length < 5) return false;
  const sig = [0x25, 0x50, 0x44, 0x46, 0x2d];
  for (let i = 0; i < sig.length; i++) if (bytes[i] !== sig[i]) return false;
  return true;
}

/**
 * Strips path separators, control characters and anything that isn't a safe
 * filename character, so a crafted name can't traverse paths or inject
 * headers into the outgoing MIME message. Always forces a .pdf extension.
 */
export function sanitizeFilename(name) {
  const base = String(name || 'resume')
    .replace(/[\\/]/g, '_')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\.\.+/g, '.')
    .replace(/[^a-zA-Z0-9 ._-]/g, '_')
    .trim()
    .slice(0, 100) || 'resume';
  return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
}

/**
 * Validates an uploaded File as a genuine PDF under the size cap. Checks
 * extension, declared MIME type AND magic bytes — a renamed .exe with a
 * ".pdf" name and a spoofed Content-Type still fails on the byte check.
 */
export async function validateResumeFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'A resume file is required.' };
  }
  if (file.size === 0) return { ok: false, error: 'The resume file is empty.' };
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, error: 'The resume file must be 5MB or smaller.' };
  }
  const name = String(file.name || '');
  if (!/\.pdf$/i.test(name)) {
    return { ok: false, error: 'The resume must be a .pdf file.' };
  }
  if (file.type && file.type !== 'application/pdf') {
    return { ok: false, error: 'The resume must be a PDF file.' };
  }

  const buf = new Uint8Array(await file.arrayBuffer());
  if (!isPdfMagicBytes(buf)) {
    return { ok: false, error: 'The file is not a valid PDF.' };
  }

  return { ok: true, bytes: buf, filename: sanitizeFilename(name) };
}
