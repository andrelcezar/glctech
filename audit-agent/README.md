# Agente de Auditoria Contínua — GLCTechSec Europe

Auditoria periódica e **não destrutiva** de `https://glctechsec.com`: conversão, SEO
internacional, GDPR/privacidade, UX, performance, acessibilidade, segurança, conteúdo e
posicionamento comercial. Nunca altera o site em produção — só analisa, classifica e envia
um relatório por e-mail.

Especificação de origem: o documento `AGENTE_AUDITORIA_CONTINUA_GLCTECHSEC_EUROPE.md`
fornecido pelo usuário. Plano técnico completo e decisões de arquitetura registradas na
sessão que implementou isto (destinatário, formato de histórico, uso de Playwright).

## Como funciona

O "motor" é uma **Skill do Claude Code**
([`.claude/skills/glctechsec-audit/SKILL.md`](../.claude/skills/glctechsec-audit/SKILL.md)),
não um serviço separado. Boa parte do que a auditoria pede (clareza da proposta de valor,
tom comercial, heurísticas de UX) é julgamento — melhor feito por um LLM com acesso real ao
site e ao repositório a cada execução do que por um pipeline determinístico tentando simular
esse julgamento. Os checks objetivos (headers de segurança, meta tags, links quebrados,
segredos expostos) continuam determinísticos, via `curl`/`grep` diretos.

```
Routine semanal ──┐
Routine mensal   ──┼──► sessão Claude Code Remote → Skill glctechsec-audit
Execução manual  ──┘         │
                              ├─ curl/WebFetch no site ao vivo + Grep/Read no repo
                              ├─ node audit-agent/probe.mjs (console errors, timing)
                              ├─ compara com audit-agent/history/known-issues.json
                              ├─ monta relatório (semanal ou mensal)
                              └─ se DRY_RUN=false: envia por ZohoMail_sendEmail
                                                    e grava o histórico
```

## Arquivos

| Arquivo | Papel |
|---|---|
| `config.json` | Única fonte de configuração: URL do site, destinatário do e-mail, alias de envio, `dryRun`, cron de referência |
| `probe.mjs` | Script Playwright único: navega numa página real, captura erros de console e timing básico. Ver limitação conhecida no cabeçalho do arquivo (proxy do ambiente pode bloquear Chromium — degrada para "não avaliado", nunca inventa dado) |
| `history/known-issues.json` | Índice de achados por fingerprint → primeira vez visto, última vez visto, status (NOVO/PENDENTE-REINCIDENTE/RESOLVIDO) |
| `history/runs/<data>.json` | Snapshot bruto de cada execução real (não-dry-run) |
| `history/logs.ndjson` | Uma linha por execução (formato da seção 29 da spec) |

## DRY_RUN

`config.json` → `"dryRun": true` (default). Nesse modo, a auditoria roda inteira e o
relatório é gerado e mostrado, mas **nada é enviado por e-mail e nada é gravado em
`history/`**. Para uma execução real, editar `config.json` para `"dryRun": false`
explicitamente — a skill nunca muda esse valor sozinha.

## Como rodar manualmente

Peça ao Claude, nesta sessão ou numa nova com este repositório aberto: *"rode a auditoria
semanal do glctechsec em dry-run"* ou *"rode o relatório mensal do glctechsec"*.

Para testar só o probe de navegador real:
```bash
node audit-agent/probe.mjs https://glctechsec.com/ https://glctechsec.com/trabalhe-conosco.html
```

## Qual conector Zoho usar

Este repositório (`glctechsec.com`) usa especificamente o conector **`zoho_MCP`**
(ferramentas `mcp__zoho_MCP__ZohoMail_*`), autenticado como `contact@glctechsec.com` — a
caixa própria do site europeu (`config.json` → `report.zohoMcpServer`). O ambiente pode ter
também um conector `zoho` genérico, autenticado como `andre.cezar@glctech.com.br` (conta da
entidade brasileira) — **não é o usado por este agente**. Confirmado via
`ZohoMail_getMailAccounts` (`accountId 6691063000000008002`).

## Trocar o destinatário ou o remetente

Editar `config.json` → `report.recipient` / `report.senderAlias`. Aliases de envio já
vistos disponíveis na conta `contact@glctechsec.com`: o próprio `contact@glctechsec.com`,
mais `suporte@glctech.com.br` e `diretoria@glctech.com.br` (grupos compartilhados entre as
duas contas Zoho). Nenhum estava marcado como `"validated"` no momento da implementação —
mesmo assim o envio real de teste funcionou; se algum dia falhar por causa disso, a skill
tenta automaticamente `report.recipientFallback` e registra qual dos dois foi usado.

## Agendamento

Duas Routines (`mcp__Claude_Code_Remote__create_trigger`), criadas **depois** de um dry-run
manual aprovado — ver a sessão de implementação para os IDs se precisar
editar/desativar (`update_trigger`/`delete_trigger`):

- Semanal: roda a auditoria completa, gera o relatório semanal.
- Mensal: agrega os runs semanais salvos em `history/runs/` daquele mês.

## Limites (por design, não é bug)

- Nunca edita `*.html`, `worker/`, `scripts/`, `wrangler.toml`, `css/`, `assets/`.
- Nunca faz `git commit`/`push` fora de `audit-agent/history/`, e só quando `dryRun: false`.
- Nunca faz deploy, altera DNS, credenciais, CI/CD, analytics ou cookies.
- Nenhuma exploração ofensiva — toda checagem de segurança é observação passiva.
- Nenhum dado inventado: cliente, número, case, certificação, vulnerabilidade ou evidência
  ausente é registrado como **OPORTUNIDADE**, nunca afirmado como fato.
