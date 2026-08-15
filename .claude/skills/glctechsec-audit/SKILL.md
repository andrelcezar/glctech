---
name: glctechsec-audit
description: Auditoria contínua (não destrutiva) do site https://glctechsec.com — conversão, SEO internacional, GDPR/privacidade, UX, performance, acessibilidade, segurança, conteúdo e posicionamento comercial. Gera relatório semanal ou mensal e envia por e-mail via Zoho. Nunca altera o site em produção. Invocar manualmente ("rode a auditoria do glctechsec", "/glctechsec-audit") ou por uma Routine agendada.
---

# Agente de Auditoria Contínua — GLCTechSec Europe

Especificação de origem: `AGENTE_AUDITORIA_CONTINUA_GLCTECHSEC_EUROPE.md` (fornecida pelo
usuário). Este arquivo é a implementação dessa spec. Se os dois divergirem em algum ponto,
a spec original prevalece — pare e pergunte ao usuário em vez de decidir sozinho.

## Regra absoluta (leia antes de qualquer outra coisa)

```
ANALISAR → VALIDAR → COLETAR EVIDÊNCIAS → COMPARAR COM HISTÓRICO →
CLASSIFICAR → PRIORIZAR → RECOMENDAR → GERAR RELATÓRIO → ENVIAR RELATÓRIO
```

Nunca `ANALISAR → ALTERAR PRODUÇÃO`. Esta skill:

- **NÃO** edita, cria ou apaga nenhum arquivo do site (`*.html`, `worker/`, `scripts/`,
  `wrangler.toml`, `css/`, `assets/`).
- **NÃO** roda `git commit`/`git push` em nada fora de `audit-agent/history/` — e só quando
  `dryRun` (ver abaixo) for `false`.
- **NÃO** altera DNS, hospedagem, credenciais, CI/CD, analytics, cookies, ou qualquer
  configuração do site ou do Cloudflare/Zoho.
- **NÃO** faz deploy (`wrangler deploy`) nem sugere rodá-lo como parte da auditoria.
- **NÃO** executa exploração ofensiva, brute force, bypass de autenticação ou qualquer teste
  destrutivo — toda checagem de segurança é observação passiva (GET/HEAD, leitura de
  headers, leitura do repositório).
- **NÃO** inventa dados: clientes, números, resultados, cases, certificações, parceiros,
  estatísticas, vulnerabilidades, evidências, conformidade GDPR, ou nomes/capacidades de
  ferramentas do Zoho MCP que não foram realmente inspecionadas.

Se alguma etapa abaixo exigir alterar algo fora de `audit-agent/history/`, **pare e
pergunte** — não assuma.

## Modo de execução

Lida do `mode` passado na invocação (`weekly`, `monthly`, ou manual sem argumento = trata
como `weekly` mas sem enviar e-mail, apenas mostrando o relatório). Lê
`audit-agent/config.json` no início de toda execução — é a única fonte de configuração
(URL do site, destinatário do e-mail, `dryRun`). Nunca hard-code esses valores aqui.

### DRY_RUN

`config.json.dryRun` (default `true`):

- `true`: roda a auditoria inteira, monta o relatório completo, **mostra o relatório e o
  log de execução na resposta** — mas não chama `ZohoMail_sendEmail`, não escreve em
  `audit-agent/history/runs/`, não atualiza `known-issues.json`, não faz commit/push.
- `false`: faz tudo isso e também envia o e-mail e persiste o histórico (passos 8–9 abaixo).

## Passo a passo

### 1. Reconhecimento do estado atual (toda execução, não confiar em memória de sessões anteriores)

- `Read audit-agent/config.json`.
- `Read audit-agent/history/known-issues.json` (achados conhecidos, por fingerprint).
- Se estiver no modo `monthly`, também listar `audit-agent/history/runs/*.json` do mês
  corrente para agregação.

### 2. Checks objetivos (evidência de arquivo/linha ou de resposta HTTP real — nunca aproximar)

Rode contra `config.json.site.baseUrl` (produção real, não o checkout local) usando
`Bash`/`curl` ou `WebFetch`, e cruze com o repositório local (`Read`/`Grep`) para o campo
"Arquivo"/"Linha" do achado quando a causa estiver no código:

- **Headers de segurança** (§16): `curl -sI <url>` em algumas páginas-chave e checar
  `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Strict-Transport-Security`. Cruzar com `_headers` e
  `worker/lib/http.js` no repo para o "Arquivo"/"Linha".
- **SEO / SEO internacional** (§10): para cada página publicada (ver
  `scripts/build.mjs` FILES para a lista oficial), `curl` e checar `<title>`,
  `<meta name="description">`, `<link rel="canonical">`, Open Graph, `<h1>` único,
  `robots.txt`, `sitemap.xml`, presença/ausência de `hreflang` (a spec pede para não
  presumir que deveria existir — só relatar o que existe hoje).
- **Links quebrados / páginas órfãs**: `Grep` por `href="` em todas as páginas, resolver
  internos, testar status HTTP dos externos com `curl -o /dev/null -w '%{http_code}'`.
  Páginas em `dist/`/dispon​íveis mas não linkadas por nenhuma outra = órfãs (ver
  `docs/ARCHITECTURE.md` para o que já é conhecido, ex. `landing.html`).
- **Segredos expostos** (§16): mesmo padrão de `tests/quality.test.js` — `Grep` por
  padrões de credencial em todo o repo publicável. Nunca inventar um "vazamento" sem o
  trecho exato encontrado.
- **Console/erros de runtime, tempo de carregamento** (§13/§15): `Bash: node
  audit-agent/probe.mjs <url1> <url2> ...` para as páginas mais importantes (home,
  1-2 páginas de serviço, contato). Ler o JSON de saída. **Se `ok: false` em algum
  resultado (ex. proxy do ambiente bloqueando Chromium — limitação conhecida, documentada
  no cabeçalho do próprio script), registrar esse eixo como "não avaliado nesta execução",
  nunca inventar um número de performance ou uma lista de erros de console.**
- **Cookies/consentimento** (§9): checar via `curl` se algum banner/mecanismo de consent é
  carregado antes de scripts de terceiros (GA4, Tidio); `Grep` por
  `gtag('consent'` nas páginas. Classificar conforme achado — hoje, pelo reconhecimento
  desta sessão, não existe Consent Mode nem banner técnico (mas **re-verificar a cada
  execução**, não reciclar essa conclusão sem checar de novo).
- **Formulários** (§8): `curl -X OPTIONS` em `/api/contact` e `/api/careers` para confirmar
  que respondem (não checar credenciais nem tentar enviar e-mail de verdade — isso seria
  alterar produção). Ler `worker/lib/validate.js` para os limites de campo/arquivo
  documentados, comparar com o que o HTML expõe.

### 3. Checks de julgamento (evidência ainda obrigatória, mas a conclusão é analítica)

Usar `WebFetch` para ler o conteúdo renderizado das páginas principais e responder, com
evidência concreta (trecho de texto, seção, CTA específico), as perguntas das seções
5–7, 11, 12, 17, 18, 19 da spec original — proposta de valor, tom comercial, clareza para
comprador B2B europeu, hierarquia de CTAs, localização/idioma real (não só "está em
inglês"), qualidade de UX/UI, autoridade/confiança, e conteúdo comercial por serviço.
**Sempre responder à pergunta-guia da seção 12**: "Isso facilita ou dificulta que um
potencial cliente europeu compreenda a GLCTechSec e entre em contato?"

### 4. Classificar cada achado

Para cada achado, montar o bloco exato da seção 21 da spec:

```
ID: AUDIT-XXXX
Status: CONFIRMADO | PROVÁVEL | OPORTUNIDADE | REQUER ANÁLISE JURÍDICA
Categoria: (uma das 15 da seção 20)
Problema:
Evidência:
Página:
URL:
Arquivo:
Componente:
Linha:
Impacto técnico:
Impacto comercial:
Severidade: CRÍTICO | ALTO | MÉDIO | BAIXO
Prioridade:
Esforço: BAIXO | MÉDIO | ALTO
Recomendação:
Implementação sugerida:
Risco da alteração:
Necessita aprovação: SIM
```

Regras de evidência (§22), sem exceção:
- **CONFIRMADO**: visto diretamente no código ou na resposta HTTP real.
- **PROVÁVEL**: inferido com evidência parcial — dizer qual é a lacuna.
- **OPORTUNIDADE**: sugestão estratégica, não um defeito — nunca tratar como bug.
- **REQUER ANÁLISE JURÍDICA**: qualquer coisa que toque GDPR/LGPD/conformidade — nunca
  escrever "o site viola X"; escrever o padrão que a spec dá como exemplo (§22): descrever o
  mecanismo observado e apontar que precisa de análise jurídica, não afirmar violação.
- ID gerado nunca deve duplicar um ID já usado em `known-issues.json`. Nunca inventar
  arquivo, linha, URL ou evidência — se não tiver, deixar em branco e marcar PROVÁVEL/
  OPORTUNIDADE, não CONFIRMADO.
- Ausência de informação (prova social, certificação, case) é **OPORTUNIDADE**, nunca "erro"
  (§19).

### 5. Comparar com o histórico

Fingerprint de um achado = `categoria + "|" + página + "|" + problema` (string simples,
sem hash necessário). Para cada achado desta execução, buscar o fingerprint em
`known-issues.json`:
- Não existe → `NOVO`, adicionar ao índice com `firstSeen`/`lastSeen` = data de hoje.
- Existe e ainda ocorre → `PENDENTE — REINCIDENTE`, atualizar `lastSeen`, incrementar
  contador de ocorrências. **Não gerar um novo ID/achado duplicado** — referenciar o ID
  original.
- Existia e não ocorre mais nesta execução → `RESOLVIDO`, marcar `resolvedAt` = hoje no
  índice (mantém o registro, não apaga — é histórico).

### 6. Montar o relatório

**Semanal** (modo `weekly`), template exato da seção 24:

```
# RELATÓRIO SEMANAL — AUDITORIA GLCTECHSEC EUROPE
### Período
### Resumo executivo
### Status geral
### Principais descobertas
### Top 5 oportunidades comerciais
### Problemas críticos          (só se existirem)
### Recomendações               (tabela | ID | Categoria | Problema | Impacto | Prioridade | Esforço |)
### Oportunidades estratégicas
### Pendências
### Reincidências
### Evolução
```

**Mensal** (modo `monthly`), template exato da seção 25 — agrega os runs semanais salvos em
`audit-agent/history/runs/` daquele mês (1–20 da seção 25).

Formato de envio: **HTML** (a `ZohoMail_sendEmail` não tem ferramenta de upload de anexo
disponível nesta MCP — nunca tentar referenciar um `attachmentPath` sem tê-lo carregado por
uma ferramenta real). Gerar o relatório em Markdown primeiro (fica legível no
`audit-agent/history/runs/<data>.json` e no log da conversa), depois convertê-lo para HTML
simples e semântico (títulos, tabela, listas) para o corpo do e-mail.

### 7. Se `dryRun: true` — parar aqui

Mostrar o relatório completo e o bloco de log (seção 29) na resposta. Não seguir para os
passos 8/9.

### 8. Enviar o e-mail (só se `dryRun: false`)

**Este repositório usa especificamente o conector `zoho_MCP`** (`config.report.zohoMcpServer`)
— ferramentas com prefixo `mcp__zoho_MCP__ZohoMail_*`, autenticado como
`contact@glctechsec.com`, a caixa própria do site europeu. Pode existir também um conector
`zoho` genérico no ambiente (autenticado como `andre.cezar@glctech.com.br`, conta da
entidade brasileira) — **não usar esse para os relatórios deste repositório**. Se `zoho_MCP`
não estiver disponível na sessão, parar e avisar — não cair silenciosamente para o outro
conector.

Usar `mcp__zoho_MCP__ZohoMail_sendEmail`. Antes de chamar, ler
`mcp__zoho_MCP__ZohoMail_getMailAccounts` (só leitura) para confirmar o `accountId` atual —
não fixar um valor antigo se a conta mudar.

```
body.fromAddress = config.report.senderAlias
body.toAddress   = config.report.recipient
body.subject     = template §26 preenchido (assunto semanal ou mensal, conforme o modo)
body.content     = relatório em HTML
body.mailFormat  = "html"
path_variables.accountId = <accountId da conta autenticada>
```

Se a chamada falhar (ex. alias `diretoria@glctech.com.br` não validado no Zoho — já
observado como `"validated": false` no `getMailAccounts`), **registrar a falha, tentar uma
vez com `config.report.recipientFallback` como `toAddress`, e registrar no log qual dos
dois foi efetivamente usado.** Nunca falhar silenciosamente (§30).

### 9. Persistir o histórico (só se `dryRun: false`, e só depois do passo 8 ter sido tentado)

- Gravar `audit-agent/history/runs/<YYYY-MM-DD>.json` com todos os achados estruturados
  desta execução + o relatório em Markdown.
- Atualizar `audit-agent/history/known-issues.json` com as transições de status do passo 5.
- Adicionar uma linha a `audit-agent/history/logs.ndjson`, formato exato da seção 29:

```json
{"phase":"AUDIT START","date":"...","version":"...","environment":"...","website":"https://glctechsec.com","repository":"andrelcezar/glctech","pagesAnalyzed":N,"filesAnalyzed":N,"issuesFound":N,"recommendations":N,"criticalIssues":N,"privacyIssues":N,"securityIssues":N,"seoIssues":N,"conversionOpportunities":N,"emailStatus":"sent|failed|skipped(dry-run)","phase":"AUDIT END"}
```
- `git add audit-agent/history/ && git commit -m "chore: audit run <data>" && git push` —
  **apenas esses arquivos**. Rodar `git status` logo antes do commit e confirmar que nada
  fora de `audit-agent/history/` está staged; se algo mais aparecer sujo, **parar e
  reportar**, nunca commitar por cima.

## Controle de falhas (§30)

Se uma etapa falhar (ex. `probe.mjs` não conseguir navegar, uma página retornar 5xx,
`ZohoMail_sendEmail` falhar): registrar o erro, marcar aquele eixo como parcialmente
concluído no relatório, continuar as etapas independentes, e nunca afirmar "auditoria
completa" se algo falhou. O relatório deve dizer explicitamente o que não pôde ser avaliado
e por quê.

## Como invocar manualmente

Peça: "rode a auditoria semanal do glctechsec em dry-run" ou "rode o relatório mensal do
glctechsec" — a skill lê `config.json` para o resto. Para forçar um envio real de teste, o
usuário precisa primeiro editar `audit-agent/config.json` (`"dryRun": false`) explicitamente
— esta skill nunca muda esse valor sozinha.
