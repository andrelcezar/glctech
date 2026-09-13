/**
 * E-mail subject/body templates for the two forms. Content is English —
 * glctechsec.com is an English-language site, and these internal
 * notifications should match the language visitors used to reach us.
 */

function fmtDateTime() {
  return new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' (Europe/London)';
}

export function buildContactEmail({ name, email, phone, company, subject, message }) {
  const finalSubject = `[New website contact] - ${subject || 'General enquiry'}`;
  const text = [
    'New contact received through the GLCTech Sec website.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Company: ${company || 'Not provided'}`,
    `Subject: ${subject || 'Not provided'}`,
    '',
    'Message:',
    message,
    '',
    `Date/time: ${fmtDateTime()}`,
  ].join('\n');
  return { subject: finalSubject, text };
}

export function buildCareersEmail({
  name, email, phone, position, location, linkedin, message,
  course, institution, semester, github, portfolio,
}) {
  const finalSubject = `[New application] - ${position || 'Role not provided'}`;
  const extra = [
    course ? `Course: ${course}` : null,
    institution ? `Institution: ${institution}` : null,
    semester ? `Year/Semester: ${semester}` : null,
    github ? `GitHub: ${github}` : null,
    portfolio ? `Portfolio: ${portfolio}` : null,
  ].filter(Boolean);

  const text = [
    'New application received through the GLCTech Sec website.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Position of interest: ${position || 'Not provided'}`,
    `City/Region: ${location || 'Not provided'}`,
    `LinkedIn: ${linkedin || 'Not provided'}`,
    ...(extra.length ? ['', 'Additional information:', ...extra] : []),
    '',
    'Cover message:',
    message,
    '',
    `Date/time: ${fmtDateTime()}`,
    '',
    'Resume attached (PDF).',
  ].join('\n');
  return { subject: finalSubject, text };
}
