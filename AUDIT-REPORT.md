# Auditoria e implementação dos formulários — glctechsec.com

Relatório de entrega da auditoria completa do site e da implementação
funcional dos formulários de contato e de vagas via Cloudflare Worker → Zoho
Mail. Datado em 2026-08-10.

> **Leia isto antes de publicar qualquer coisa.** A seção 6 ("Configurações
> Cloudflare/Zoho necessárias") lista o que só um humano com acesso às contas
> Cloudflare e Zoho da GLCTech pode fazer — nada disso foi ou pôde ser feito
> por esta sessão, que não tem credenciais de nenhuma das duas contas.

---

## 1. Problemas encontrados

### Críticos

1. **O formulário de contato está 100% quebrado em produção, agora.** O site
   publicado em `https://glctechsec.com` é servido pelo **GitHub Pages**
   atrás do proxy Cloudflare — o Worker deste repositório (`worker/index.js`,
   `wrangler.toml`) nunca foi implantado. Confirmado ao vivo:
   ```
   $ curl -s -X POST https://glctechsec.com/api/contact -H "Content-Type: application/json" -d '{...}'
   HTTP/2 405
   <html><head><title>405 Not Allowed</title></head>...
   ```
   Essa é a página de erro padrão do GitHub Pages para métodos não-GET — toda
   submissão do formulário de contato falha silenciosamente para todo
   visitante. O formulário de vagas, que postava direto para FormSubmit.co
   (fora do Worker), pode estar funcionando parcialmente, mas depende de uma
   ativação manual de conta que não pôde ser confirmada (ver item 8).
2. **Nenhum registro DMARC para `glctechsec.com`** (ver seção 9) — SPF e DKIM
   existem, mas sem DMARC o domínio fica mais exposto a spoofing e a entrega
   de e-mails legítimos fica mais frágil.
3. **Sem cabeçalhos de segurança em nenhuma resposta** — sem
   `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`,
   `Permissions-Policy`, `X-Frame-Options`.
4. **Sem proteção anti-bot além de um honeypot** no formulário de contato — o
   formulário de vagas nem honeypot tinha. Sem Cloudflare Turnstile, sem
   rate limiting obrigatório (KV era opcional e não configurado).
5. **Upload de currículo validado apenas por extensão** no front-end
   (`file.type === 'application/pdf' || /\.pdf$/i`) — um executável renomeado
   para `.pdf` com `Content-Type` forjado passava. Nenhuma validação
   server-side existia (o arquivo ia direto para FormSubmit.co).
6. **Destinatários dos formulários hard-coded no HTML**, não configuráveis:
   `contact@glctechsec.com` (contato) e `hr@glctechsec.com` (vagas) —
   nenhum dos dois é o endereço pedido (`contac@glctech.com.br` /
   `rh@glctech.com.br`), e trocar o destino exigia editar e reimplantar HTML.

### Duplicação de código / arquitetura

7. **Três implementações da mesma função de envio de e-mail coexistiam**:
   `worker/index.js` (a implantada, segundo `wrangler.toml`),
   `serverless/cloudflare/src/worker.js` (cópia quase idêntica, com lógica de
   CORS diferente) e `serverless/api/contact.js` (variante Vercel/Netlify com
   `nodemailer`). Pior: a suíte de testes (`tests/worker.test.mjs`) testava a
   cópia **não implantada**, então os testes passavam sem cobrir o código que
   de fato rodava em produção.

### Documentação desatualizada (achados de auditoria, não da tarefa original)

8. `docs/ARCHITECTURE.md` e `docs/INTEGRATIONS.md` ainda descreviam o
   formulário de contato como **Web3Forms** e o de vagas como um link
   **HubSpot** hospedado — nenhum dos dois reflete o HTML real (que já usava
   FormSubmit.co direto). `README.md`/`DEPLOYMENT_GUIDE.md` também
   descreviam um fluxo de ativação FormSubmit que não corresponde ao código.

### SEO / Acessibilidade / Performance

9. Meta description, canonical e Open Graph **presentes em todas as 9
    páginas principais** (correção já feita em revisões anteriores — nada a
    corrigir aqui).
10. `robots.txt` e `sitemap.xml` presentes e coerentes.
11. Bundle de assets já otimizado (SVGs próprios, WebP) em revisão anterior.
12. `landing.html`, `ebook.html`, `mailmkt.html`, `andre.html`, `kawan.html`,
    `tchize.html` continuam **órfãs** (nenhuma página aponta para elas) mas
    seguem sendo publicadas pelo `scripts/build.mjs`. Fora do escopo desta
    tarefa (formulários), documentado como pendência.
13. `landing.html` mantém um formulário próprio postando direto para
    FormSubmit.co, sem passar pelo Worker — não migrado (não fazia parte do
    pedido original: contato e vagas).

### Não encontrado (o que NÃO foi um problema)

- Nenhuma credencial, senha, token ou API key exposta no código-fonte (HTML,
  JS, ou histórico observável neste checkout).
- HTTPS funcionando corretamente via Cloudflare (TLS termina no edge).
- Nenhum problema de CORS pré-existente identificado no fluxo antigo (o
  formulário de contato era same-origin por design, quando o Worker estava
  no ar).

---

## 2. Problemas corrigidos

| # | Problema | Correção |
|---|---|---|
| 1 | Contact form quebrado (Worker nunca implantado) | Código do Worker corrigido, consolidado e testado — **mas a correção só terá efeito em produção depois que vocês executarem o deploy** (seção 10). Não é algo que este código sozinho resolve. |
| 3 | Sem headers de segurança | `_headers` (assets estáticos) + `worker/lib/http.js` (`/api/contact`, `/api/careers`) |
| 4 | Sem Turnstile / rate limit robusto | Turnstile server-side (`worker/lib/turnstile.js`) nos dois formulários; rate limit por IP (5/10min) já existia para contato, estendido para vagas |
| 5 | CV validado só por extensão | `worker/lib/validate.js`: extensão **+** MIME declarado **+** magic bytes (`%PDF-`) **+** limite de 5MB **+** sanitização de nome de arquivo |
| 6 | Destinos hard-coded | `CONTACT_TO_EMAIL` / `CAREERS_TO_EMAIL` — Cloudflare Secrets, com fallback para `ZOHO_USER` se não configurados |
| 7 | 3 implementações duplicadas | `serverless/` removido inteiramente; `worker/lib/` é agora a única implementação, com `worker/index.js` roteando `/api/contact` e `/api/careers` |
| 8 | Documentação desatualizada | `docs/ARCHITECTURE.md`, `docs/INTEGRATIONS.md`, `docs/CONTENT-EDITING.md`, `README.md`, `DEPLOYMENT_GUIDE.md` atualizados |
| — | Formulário de vagas fora do Worker | Migrado de FormSubmit.co para `/api/careers` (mesmo Worker), com anexo de currículo via SMTP MIME |
| — | Sem campo "Assunto" no contato | Adicionado (`select`, opcional), usado no assunto do e-mail interno |

Itens 2, 9, 12 e 13 **não foram corrigidos** neste PR — exigem uma decisão ou
ação fora do repositório (registro DNS, decisão sobre páginas órfãs). Ver
seção "Pendências" no final.

---

## 3. Arquivos alterados

- `worker/index.js` — reescrito: roteia `/api/contact` e `/api/careers`,
  aplica headers de segurança aos assets estáticos também.
- `index.html` — formulário de contato: campo "Assunto", honeypot mantido,
  widget Turnstile, JS de envio simplificado (sem fallback FormSubmit).
- `trabalhe-conosco.html` — formulário de vagas: honeypot novo, widget
  Turnstile, JS de envio trocado de FormSubmit.co para `/api/careers`
  (multipart, same-origin).
- `scripts/i18n.js` — chaves `form.subject*` adicionadas em pt/en/de/es/fr/it.
- `scripts/build.mjs` — `_headers` adicionado à allowlist de publicação.
- `wrangler.toml` — comentários de secrets atualizados (nomes novos).
- `.gitignore` — `.wrangler/` (cache local) ignorado.
- `tests/quality.test.js` — testes de destino de formulário, honeypot e
  Turnstile reescritos para a nova arquitetura.
- `tests/site-worker.test.mjs` — reescrito: cobre `/api/contact` e
  `/api/careers`, contrato `{success, message}`, Turnstile, validação de
  arquivo.
- `tests/smtp.test.js` — aponta para `worker/lib/smtp.js`; testes de anexo
  MIME adicionados.
- `README.md`, `DEPLOYMENT_GUIDE.md`, `docs/ARCHITECTURE.md`,
  `docs/INTEGRATIONS.md`, `docs/CONTENT-EDITING.md` — documentação corrigida.

## 4. Arquivos criados

- `worker/lib/http.js` — respostas JSON padronizadas, headers de segurança,
  checagem de mesma origem, rate limiter (KV), `clean()`, `isValidEmail()`.
- `worker/lib/smtp.js` — cliente SMTP (movido de `serverless/cloudflare/`,
  **estendido** para suportar anexo MIME `multipart/mixed`).
- `worker/lib/mail.js` — templates de assunto/corpo dos dois e-mails
  internos (em português, conforme especificado).
- `worker/lib/validate.js` — validação de currículo PDF (extensão + MIME +
  magic bytes + tamanho) e sanitização de nome de arquivo.
- `worker/lib/turnstile.js` — verificação server-side do Cloudflare
  Turnstile contra `siteverify`.
- `_headers` — cabeçalhos de segurança para os assets estáticos.
- `.dev.vars.example` — modelo de variáveis locais para `wrangler dev`
  (nenhum valor real).
- `AUDIT-REPORT.md` — este arquivo.

## 5. Arquivos removidos

- `serverless/` (inteiro: `cloudflare/`, `api/`, `README.md`,
  `package*.json`, `vercel.json`) — duplicava `worker/`; a implementação real
  agora vive só em `worker/`.
- `tests/worker.test.mjs` — testava a cópia duplicada removida; substituído
  por `tests/site-worker.test.mjs`, que testa `worker/index.js` (o código
  real implantado).

---

## 6. Configurações Cloudflare / secrets necessários

**Nada disto foi feito por esta sessão** — não há acesso à conta Cloudflare
da GLCTech. São os passos que vocês precisam executar.

### 6.1 Secrets do Worker

```bash
npx wrangler login
npx wrangler secret put ZOHO_USER            # mailbox Zoho que autentica o SMTP
npx wrangler secret put ZOHO_PASS            # senha de aplicativo específica do Zoho
npx wrangler secret put CONTACT_TO_EMAIL     # contac@glctech.com.br
npx wrangler secret put CAREERS_TO_EMAIL     # rh@glctech.com.br
npx wrangler secret put TURNSTILE_SECRET_KEY # opcional — ver 6.3
```

**`ZOHO_USER` — informação que falta:** este relatório **não sabe** qual
mailbox Zoho deve autenticar o envio. A recomendação (ver decisão registrada
abaixo) é usar `contac@glctech.com.br`, mas isso pressupõe que essa caixa
existe e tem uma senha de aplicativo gerável. **Confirmem antes do deploy.**
Se preferirem duas mailboxes separadas (uma para contato, outra para vagas),
o código precisa de um pequeno ajuste — falem antes de gerar as senhas.

### 6.2 KV para rate limiting (opcional, recomendado)

```bash
npx wrangler kv namespace create RATE_LIMIT
# copiar o id impresso para dentro de wrangler.toml, descomentando o bloco:
# [[kv_namespaces]]
# binding = "RATE_LIMIT"
# id = "<id>"
```
Sem isso o Worker funciona normalmente, apenas sem o limite de 5
envios/10min por IP.

### 6.3 Cloudflare Turnstile (opcional, recomendado)

1. Painel Cloudflare → **Turnstile** → **Add widget**.
2. Domínio: `glctechsec.com`. Modo: *Managed* (recomendado).
3. Copiar o **Site Key** (público) e colar em `data-sitekey="..."` em dois
   lugares:
   - `index.html` — `<div class="cf-turnstile" data-sitekey="0x0000000000000000000AA" ...>`
   - `trabalhe-conosco.html` — mesmo padrão.
4. Copiar o **Secret Key** e definir como secret do Worker (`6.1`).
5. Sem isso configurado, os formulários continuam funcionando — a verificação
   Turnstile é pulada automaticamente até `TURNSTILE_SECRET_KEY` existir
   (`worker/lib/turnstile.js`). Não há um estado "quebrado" intermediário.

### 6.4 Deploy do Worker

O Worker **substitui** o GitHub Pages como origem do site (ele já serve os
assets estáticos via `[assets]` no `wrangler.toml`, além de `/api/*`):

```bash
npm install
npm run deploy     # = npm run build && wrangler deploy
```

Depois do primeiro deploy, ligar o domínio ao Worker (ver seção 8 sobre DNS):
**Cloudflare Dashboard → Workers & Pages → glctechsec → Settings → Domains &
Routes → Add Custom Domain → `glctechsec.com`** (e `www.glctechsec.com`, se
aplicável). Isso ajusta o DNS automaticamente para apontar para o Worker em
vez do GitHub Pages — é uma alteração de DNS, então avisem antes se quiserem
que eu descreva o registro exato a ser trocado ao invés de usar o botão.

---

## 7. Configurações Zoho necessárias

**Informações que faltam e que não foram inventadas:**

- Confirmação de que `contac@glctech.com.br` é uma mailbox Zoho real e ativa,
  com permissão para gerar senha de aplicativo.
- Confirmação de que `rh@glctech.com.br` é uma mailbox (ou alias) real e ativa
  para receber os e-mails de candidatura.
- Se preferirem, o Zoho Mail API/ZeptoMail em vez de SMTP — não implementado
  nesta entrega (decisão registrada abaixo).

**Passos, assumindo SMTP (arquitetura atual):**

1. Zoho Mail → **Configurações → Segurança → Autenticação em duas etapas** →
   ativar (obrigatório para gerar senha de aplicativo).
2. Zoho Mail → **Configurações → Segurança → Senhas de aplicativo → Gerar
   nova senha** → usar essa string como `ZOHO_PASS` (nunca a senha da conta).
3. Confirmar que `smtppro.zoho.com:465` (TLS implícito) está acessível pela
   conta — é o host/porta já usado pelo código (`worker/lib/smtp.js`).

**Decisão registrada (assumida por falta de resposta às perguntas de
esclarecimento feitas durante a auditoria):**

- **SMTP direto via `cloudflare:sockets`** foi mantido em vez de migrar para
  a API HTTPS oficial da Zoho (ZeptoMail/Mail API). Motivo: a implementação
  SMTP já existia, testada (13 testes de protocolo), e não exige nenhum
  cadastro novo em serviço Zoho. A migração para API HTTPS é tecnicamente
  viável e pode ser considerada depois, mas exigiria credenciais (API key ou
  OAuth Client ID/Secret/Refresh Token) e verificação de domínio de envio que
  eu não tenho como configurar sem acesso à conta Zoho.
- **Uma única mailbox autentica os dois formulários** (`ZOHO_USER`), com
  `To:` diferente por formulário. Simplifica a gestão de credenciais.
- **Currículo anexado ao e-mail via MIME**, não Cloudflare R2. Motivo: não
  exige provisionar um recurso Cloudflare novo, funciona imediatamente após o
  deploy, e 5MB está confortavelmente dentro do limite de anexo do Zoho.

---

## 8. DNS necessários

Levantamento feito via DNS-over-HTTPS (Cloudflare `1.1.1.1`) em 2026-08-10 —
estado real dos dois domínios, não suposição:

### `glctechsec.com`
- **NS:** `eve.ns.cloudflare.com`, `hassan.ns.cloudflare.com` — zona já no
  Cloudflare. ✅
- **A (apex):** `104.21.85.105`, `172.67.204.157` — IPs anycast do Cloudflare
  (proxy "nuvem laranja" ativo). A origem por trás é hoje o **GitHub Pages**
  (confirmado pelos headers `x-github-request-id`, `x-fastly-request-id` na
  resposta ao vivo).
- **MX:** `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50) — Zoho
  Mail já é quem recebe e-mail para este domínio. **Não mexer.**
- **Necessário para publicar o Worker:** trocar a origem do domínio de
  GitHub Pages para o Worker. Forma recomendada: **Custom Domain** no próprio
  Worker (Cloudflare Dashboard → Workers & Pages → domínio → Settings →
  Domains & Routes), que gerencia o registro automaticamente sem tocar nos
  registros MX/SPF/DKIM de e-mail. **Isto é uma mudança de DNS — não foi
  aplicada por esta sessão; decidam e apliquem vocês, ou peçam que eu
  descreva o registro exato antes de vocês clicarem em algo.**

### `glctech.com.br`
- **NS:** `mimi.ns.cloudflare.com`, `noel.ns.cloudflare.com` — zona também no
  Cloudflare. ✅
- **MX:** mesmos três hosts Zoho — confirma que `contac@glctech.com.br` e
  `rh@glctech.com.br` são endereços plausíveis de existir nessa infraestrutura
  de e-mail (não é prova de que as caixas específicas existem — só que o
  domínio recebe e-mail via Zoho).
- Nenhuma mudança de DNS necessária neste domínio para os formulários
  funcionarem — ele é apenas o destino dos e-mails, não onde o Worker roda.

---

## 9. SPF / DKIM / DMARC

### `glctechsec.com`
| | Estado | Valor |
|---|---|---|
| SPF | ✅ presente | `v=spf1 include:zohomail.com ~all` |
| DKIM | ✅ presente | seletor `zmail._domainkey.glctechsec.com` (chave RSA Zoho) |
| DMARC | ❌ **ausente** | nenhum registro em `_dmarc.glctechsec.com` |

**Recomendação (não aplicada — mudança de DNS):** criar
`_dmarc.glctechsec.com` TXT começando em modo monitor-only, por exemplo:
```
v=DMARC1; p=none; rua=mailto:<endereço de relatórios de vocês>
```
e evoluir para `p=quarantine` depois de alguns dias observando os relatórios,
como já foi feito em `glctech.com.br` (abaixo). Isso reduz risco de spoofing
do domínio e melhora a taxa de entrega — mas **decidam o endereço de
relatório antes**; não inventei um.

### `glctech.com.br`
| | Estado | Valor |
|---|---|---|
| SPF | ✅ presente | `v=spf1 include:mailgun.org include:zohomail.com ~all` |
| DKIM | ⚠️ **não confirmado** | nenhum registro encontrado nos seletores comuns testados (`zmail`, `zoho1`, `zoho2`, `s1`, `s2`, `default`, `selector1`, `selector2`) |
| DMARC | ✅ presente | `v=DMARC1; p=none; rua=mailto:...@dmarc-reports.cloudflare.net` (modo monitor-only, gerenciado pelo recurso de DMARC Management do Cloudflare) |

**Informação que falta:** o seletor DKIM real de `glctech.com.br` não foi
localizado nos nomes comuns testados via DNS público. Isso **não** significa
necessariamente que DKIM está desligado — Zoho pode usar um seletor
customizado. **Verifiquem no painel Zoho: Mail Admin → Domínios →
`glctech.com.br` → DKIM**, e me passem o seletor exato se quiserem que eu
confirme o registro TXT correspondente.

**Nada em SPF/DKIM/DMARC foi alterado por esta sessão** — apenas consultado
via DNS público, conforme pedido explicitamente na tarefa.

---

## 10. Como publicar o Worker

```bash
git pull                      # este branch, depois de mergeado
npm install
npm run deploy                # build + wrangler deploy
```
Pré-requisitos: os secrets da seção 6.1 já configurados (`wrangler secret
put`) — sem `ZOHO_USER`/`ZOHO_PASS` o Worker roda e serve o site normalmente,
mas os dois endpoints de formulário respondem `500` de propósito (falha
fechada, sem tentar enviar e-mail sem credencial).

## 11. Como configurar as rotas

O Worker já serve `/api/contact`, `/api/careers` e todo o resto do site (via
`[assets]` no `wrangler.toml`) a partir de um único deploy — não há rotas
adicionais para configurar manualmente além de ligar o domínio customizado
(seção 6.4 / 8). Não há CORS a configurar: os formulários são same-origin por
design.

## 12. Como testar os formulários

### Localmente, antes de publicar secrets reais
```bash
cp .dev.vars.example .dev.vars   # preencher com uma senha de app real de teste
npx wrangler dev
```
- `POST http://localhost:8787/api/contact` com JSON válido → deve tentar
  enviar (e falhar com 502 se as credenciais não forem reais — comportamento
  esperado, o importante é não vazar detalhe do erro).
- Testar: nome vazio, e-mail inválido, mensagem vazia, campo honeypot
  preenchido (deve devolver `200` sem enviar nada), 6+ requisições seguidas
  do mesmo IP (deve devolver `429` a partir da 6ª, só com KV configurado).
- `POST http://localhost:8787/api/careers` (multipart) com PDF válido, PDF
  maior que 5MB, arquivo `.exe` renomeado para `.pdf`, sem currículo,
  campos obrigatórios faltando.

### Em produção, depois do deploy
1. Enviar uma mensagem real pelo formulário de contato do site.
2. Confirmar recebimento em `contac@glctech.com.br` (ou o endereço que vocês
   configuraram em `CONTACT_TO_EMAIL`), com `Reply-To` apontando para o
   e-mail informado no formulário.
3. Repetir para o formulário de vagas, confirmando que o PDF chega anexado
   em `rh@glctech.com.br`.
4. Testar responsividade e os dois formulários em Chrome, Firefox e Edge —
   desktop, tablet (~768px) e mobile (~390px). Safari, se houver acesso a um
   dispositivo Apple.

### Suíte automatizada
```bash
npm test        # 242 testes — 238 passam, 4 skipped (pré-existentes, não relacionados)
```

## 13. Como visualizar os logs

```bash
npx wrangler tail
```
Cada requisição às rotas de formulário loga uma linha mínima:
`[contact] <id> <status> <motivo>` ou `[careers] <id> <status> <motivo>` —
nunca a mensagem enviada pelo visitante, nunca a senha/token, nunca o erro
SMTP bruto (que citaria host e conta) devolvido ao navegador.

## 14. Como fazer rollback

- **Código:** reverter o merge deste PR e rodar `npm run deploy` novamente —
  o Worker anterior volta a ser publicado. Não há migração de dados
  envolvida (o Worker não tem estado além do KV opcional de rate limit).
- **Secrets:** não precisam ser removidos num rollback de código — um
  `ZOHO_PASS` antigo continua válido a menos que tenha sido revogado no Zoho.
- **DNS (se o Custom Domain do Worker já tiver sido ativado):** reverter para
  GitHub Pages exigiria restaurar os registros A/CNAME originais apontando
  para o GitHub Pages — **não recomendado**, já que era esse o estado
  quebrado (formulário de contato fora do ar). Se algo der errado após o
  deploy, o caminho mais seguro é corrigir o Worker e reimplantar, não voltar
  ao GitHub Pages.

---

## ⚠ Pendências — decisões ou ações que só vocês podem tomar

1. **Confirmar `ZOHO_USER`** — qual mailbox Zoho autentica o envio (seção 6.1
   e 7). Sem isso, não há como gerar a senha de aplicativo nem publicar os
   secrets.
2. **Confirmar que `contac@glctech.com.br` e `rh@glctech.com.br` existem** e
   recebem e-mail normalmente.
3. **Publicar o Worker** (`npm run deploy`) e **ligar o domínio customizado**
   — sem isso, o site continua no GitHub Pages e o contact form continua
   quebrado, independentemente de quão correto o código esteja.
4. **Criar o widget Cloudflare Turnstile** e colar as duas chaves (site key
   no HTML, secret key como Worker secret) — opcional, mas recomendado antes
   de publicar para produção com tráfego real.
5. **Adicionar um registro DMARC em `glctechsec.com`** — não existe hoje.
6. **Confirmar o seletor DKIM de `glctech.com.br`** no painel Zoho — não
   localizado via DNS público nos seletores comuns testados.
7. **Decidir o destino de `landing.html`** (formulário próprio, ainda em
   FormSubmit.co, página órfã) — fora do escopo desta entrega (contato e
   vagas), mas documentado para não ficar esquecido.
8. **Fotos reais dos fundadores e demais pendências herdadas da Revisão 3**
   — seguem listadas em `REVISION-3-CHANGELOG.md`, não fazem parte desta
   entrega.
