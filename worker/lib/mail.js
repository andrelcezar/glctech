/**
 * E-mail subject/body templates for the two forms. Content is Portuguese —
 * these are internal notifications read by GLCTech staff, independent of the
 * language a visitor viewed the site in.
 */

function fmtDateTime() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' (America/Sao_Paulo)';
}

export function buildContactEmail({ name, email, phone, company, subject, message }) {
  const finalSubject = `[Novo contato pelo site] - ${subject || 'Contato geral'}`;
  const text = [
    'Novo contato recebido através do site GLCTech.',
    '',
    `Nome: ${name}`,
    `E-mail: ${email}`,
    `Telefone: ${phone || 'Não informado'}`,
    `Empresa: ${company || 'Não informado'}`,
    `Assunto: ${subject || 'Não informado'}`,
    '',
    'Mensagem:',
    message,
    '',
    `Data/hora: ${fmtDateTime()}`,
  ].join('\n');
  return { subject: finalSubject, text };
}

export function buildCareersEmail({
  name, email, phone, position, location, linkedin, message,
  course, institution, semester, github, portfolio,
}) {
  const finalSubject = `[Nova candidatura] - ${position || 'Vaga não informada'}`;
  const extra = [
    course ? `Curso: ${course}` : null,
    institution ? `Instituição: ${institution}` : null,
    semester ? `Ano/Semestre: ${semester}` : null,
    github ? `GitHub: ${github}` : null,
    portfolio ? `Portfólio: ${portfolio}` : null,
  ].filter(Boolean);

  const text = [
    'Nova candidatura recebida através do site GLCTech.',
    '',
    `Nome: ${name}`,
    `E-mail: ${email}`,
    `Telefone: ${phone || 'Não informado'}`,
    `Vaga de interesse: ${position || 'Não informado'}`,
    `Cidade/Estado: ${location || 'Não informado'}`,
    `LinkedIn: ${linkedin || 'Não informado'}`,
    ...(extra.length ? ['', 'Informações complementares:', ...extra] : []),
    '',
    'Apresentação:',
    message,
    '',
    `Data/hora: ${fmtDateTime()}`,
    '',
    'Currículo em anexo (PDF).',
  ].join('\n');
  return { subject: finalSubject, text };
}
