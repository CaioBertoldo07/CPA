# Prompt de Implementacao - Fase 3: Solicitacao ao CETIC CPA

## 1. Contexto

As fases anteriores ja foram concluidas:

- Fase 1: ajustes visuais de nomenclatura no frontend.
- Fase 2: geracao de `emailTemplate` no envio da avaliacao e exibicao no modal.

Nesta Fase 3, o objetivo e adicionar envio controlado da solicitacao ao CETIC, com governanca minima (auditoria, idempotencia, timeout e fallback manual), sem implementar mala direta para avaliadores finais.

A Fase 3 esta dividida em duas partes dentro deste prompt:

- **Fase 3A**: implementacao completa do backend (env vars, provider, log Prisma, endpoint, idempotencia, testes).
- **Fase 3B**: implementacao do frontend (API/mutation, botao no modal, feedback, fallback manual).

O Claude Code deve validar e testar o backend (Fase 3A) antes de iniciar o frontend (Fase 3B). Nao misturar as duas partes antes da validacao do backend.

## 2. Objetivo

Implementar somente o necessario para:

- criar servico simples de envio de e-mail no backend;
- criar endpoint `POST /api/avaliacoes/:id/solicitar-cetic`;
- registrar tentativas de solicitacao ao CETIC;
- aplicar idempotencia para evitar envio duplicado;
- adicionar acao no frontend para solicitar envio ao CETIC;
- manter fallback manual de copia do template em caso de falha.

## 3. Estado atual encontrado no codigo

### 3.1 Backend

- [ENCONTRADO NO CODIGO] Fluxo de envio atual de avaliacao:
  - `backend/src/routes/avaliacoesRouter.ts`: existe `PUT /api/avaliacoes/:id/enviar` com `authenticateToken` + `authorize(['admin'])`.
  - `backend/src/controllers/avaliacoesController.ts`: `enviarAvaliacao` chama `avaliacoesService.switchStatus(id, 2)` e retorna `{ message, avaliacao, emailTemplate }`.
  - `backend/src/services/avaliacoesService.ts`: `switchStatus` ja existe e nao deve ter regra de negocio alterada nesta fase.

- [ENCONTRADO NO CODIGO] Builder da Fase 2:
  - `backend/src/utils/emailTemplateBuilder.ts` existe.
  - O builder usa `env.APP_PUBLIC_URL` e hoje lanca erro quando nao configurada.

- [ENCONTRADO NO CODIGO] Configuracao de ambiente:
  - `backend/src/config/env.ts` usa Zod e ja possui `APP_PUBLIC_URL`.
  - Ainda nao existem variaveis de SMTP/CETIC.

- [ENCONTRADO NO CODIGO] Autenticacao/autorizacao:
  - `backend/src/middleware/authMiddleware.ts` tem `authenticateToken` e `authorize(requiredRoles)` com `role` no token.

- [ENCONTRADO NO CODIGO] Tratamento de erros/logs:
  - `backend/src/middleware/errorMiddleware.ts` define `AppError`, `asyncHandler` e `errorHandler` central.
  - Padrao atual usa `console.error` para logs tecnicos.

- [ENCONTRADO NO CODIGO] Prisma/schema:
  - `backend/prisma/schema.prisma` nao possui modelo de log de solicitacao CETIC.

- [ENCONTRADO NO CODIGO] Dependencias:
  - `backend/package.json` nao possui dependencia de envio SMTP (ex: nodemailer).

- [ENCONTRADO NO CODIGO] Testes:
  - Estrutura existe em `backend/tests/` com pastas `unit/`, `integration/`, `helpers/`, `factories/`.

- [ENCONTRADO NO CODIGO] Arquivo de exemplo de ambiente:
  - `backend/.env.example` existe.

### 3.2 Frontend

- [ENCONTRADO NO CODIGO] Tabela/fluxo de envio:
  - `frontend/src/components/Tables/Table_Avaliacao.jsx` chama `useEnviarAvaliacaoMutation`.
  - No sucesso do envio, abre `Modal_EmailTemplate` com `emailTemplate` retornado.

- [ENCONTRADO NO CODIGO] Modal da Fase 2:
  - `frontend/src/components/Modals/Modal_EmailTemplate.jsx` existe.
  - Ja tem botoes de copia e fallback manual (copiar conteudo).

- [ENCONTRADO NO CODIGO] API e mutations:
  - `frontend/src/api/avaliacoes.js` nao possui funcao `solicitarCetic`.
  - `frontend/src/hooks/mutations/useAvaliacaoMutations.jsx` nao possui mutation para CETIC.

- [ENCONTRADO NO CODIGO] Notificacao/feedback:
  - `Table_Avaliacao.jsx` usa `useNotification` para mensagens de sucesso/erro.

### 3.3 Ausencias importantes

- [ENCONTRADO NO CODIGO] Nao ha endpoint `POST /api/avaliacoes/:id/solicitar-cetic`.
- [ENCONTRADO NO CODIGO] Nao ha servico de e-mail SMTP implementado.
- [ENCONTRADO NO CODIGO] Nao ha auditoria persistida para solicitacoes CETIC.

## 4. Decisoes tecnicas da fase

### 4.1 Provider de e-mail

- [PROPOSTA] Criar camada simples de envio de e-mail no backend com interface e implementacao SMTP.
- [PROPOSTA] Estrutura sugerida (adaptar ao padrao do projeto):

```txt
backend/src/services/email/
  emailProvider.ts
  smtpEmailProvider.ts
  emailService.ts
```

- [PROPOSTA] Interface minima:

```ts
sendMail({
  to,
  cc,
  from,
  subject,
  text,
  timeoutMs,
});
```

### 4.2 Variaveis de ambiente

- [PROPOSTA] Adicionar no `backend/src/config/env.ts` e `backend/.env.example`:

```env
MAIL_PROVIDER=smtp
MAIL_FROM=cpa@uea.edu.br

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=

CETIC_EMAIL_TO=
CETIC_EMAIL_CC=
CETIC_REQUEST_IDEMPOTENCY_WINDOW_MINUTES=10
```

Regras:

- `CETIC_EMAIL_TO` obrigatoria para envio real.
- `MAIL_FROM` obrigatoria para envio real.
- `CETIC_EMAIL_CC` opcional.
- Validar obrigatoriedade **no momento do envio** ou condicionalmente por `MAIL_PROVIDER` e ambiente, nao no startup do servidor. Configuracao SMTP incompleta nao deve impedir o backend de subir em ambiente de desenvolvimento ou teste.
- Em producao, se SMTP/CETIC estiver mal configurado: responder com `FAILED` de forma controlada, registrar erro no log e informar fallback manual. Nao derrubar o servidor.
- Nunca expor credenciais SMTP no frontend.
- Nunca deixar credenciais hardcoded.

#### Teste em ambiente de desenvolvimento

Para testes locais/homologacao, `CETIC_EMAIL_TO` pode ser configurado com o e-mail do desenvolvedor/responsavel pelo teste, em vez do e-mail real do CETIC.

Exemplo:

```env
CETIC_EMAIL_TO=caio23bezerra@gmail.com
```

Isso permite validar o fluxo real de envio sem acionar o CETIC indevidamente.

Importante:

- nunca usar o e-mail real do CETIC em testes locais sem autorizacao;
- deixar claro no `.env.example` que `CETIC_EMAIL_TO` deve ser substituido conforme o ambiente;
- em producao, configurar `CETIC_EMAIL_TO` com o endereco institucional correto.

### 4.3 Idempotencia

- [PROPOSTA] Janela padrao: 10 minutos (env ou constante interna documentada).
- [PROPOSTA] Antes de enviar, verificar tentativa recente (`PENDING`/`SENT`) para a mesma avaliacao dentro da janela.
- [PROPOSTA] Se houver tentativa recente dentro da janela, retornar status `ALREADY_REQUESTED` na resposta da API e nao reenviar.
- [PROPOSTA] Ciclo de vida do `PENDING`: log criado com status `PENDING` antes da tentativa de envio; atualizado para `SENT` ou `FAILED` apos resultado. `PENDING` recente (dentro da janela) bloqueia nova tentativa. `PENDING` antigo fora da janela nao bloqueia.

### 4.4 Auditoria/log

- [PROPOSTA] Criar modelo Prisma para log minimo de solicitacao CETIC.
- [PROPOSTA] Nome sugerido: `SolicitacaoCeticLog` (ajustar para padrao real de nomes do schema, se necessario).

Campos sugeridos:

```txt
id
avaliacao_id
admin_email ou admin_id
destinatario
cc
assunto
payload_hash
status (PENDING | SENT | FAILED)
erro_resumido
created_at
sent_at
```

Regras:

- Nao armazenar senha SMTP.
- Nao armazenar o corpo completo do e-mail — somente os campos listados acima. Isso reduz risco LGPD e poluicao no banco.
- `ALREADY_REQUESTED` e status de resposta da API, nao status persistido no log. Se desejar auditar tentativa bloqueada, pode ser implementado como log separado em fase futura.
- Armazenar somente o minimo util para auditoria.

### 4.5 Timeout (sem retry automatico)

- [PROPOSTA] Timeout explicito por tentativa (ex: 8-15s).
- [PROPOSTA] Nao implementar retry automatico nesta primeira versao. E-mail institucional com retry automatico pode causar envio duplicado se o provider enviar mas a resposta falhar por timeout.
- [PROPOSTA] Em caso de falha, registrar log `FAILED` e retornar resposta com fallback manual. Reenvio deve ser acao futura controlada pelo admin.
- [PROPOSTA] Nao implementar fila (BullMQ/Redis fora de escopo).

### 4.6 Fallback manual

- [PROPOSTA] Manter no frontend o conteudo copiavel do template da Fase 2 sempre disponivel.
- [PROPOSTA] Se envio ao CETIC falhar, manter modal com opcao de copiar.

## 5. O que deve ser implementado no backend

1. [PROPOSTA] Atualizar `backend/src/config/env.ts` com vars de e-mail/CETIC e validacoes Zod.
2. [PROPOSTA] Atualizar `backend/.env.example` com novas vars, sem credenciais reais.
3. [PROPOSTA] Criar camada de provider de e-mail SMTP (interface + implementacao).
4. [PROPOSTA] Se usar Nodemailer, adicionar `nodemailer` ao `backend/package.json`. Como o backend e TypeScript, verificar se a versao instalada exige `@types/nodemailer` separado e instalar se necessario. Justificar tecnicamente no PR.
5. [PROPOSTA] Criar modelo Prisma de auditoria (`SolicitacaoCeticLog` ou nome equivalente), com migration.
6. [PROPOSTA] Criar service de solicitacao CETIC com responsabilidade de:
   - validar permissao admin (na rota/controller);
   - buscar avaliacao por id;
   - gerar/reutilizar template via `backend/src/utils/emailTemplateBuilder.ts`;
   - montar assunto/corpo para CETIC;
   - aplicar idempotencia;
   - registrar tentativa (PENDING);
   - executar envio com timeout controlado;
   - atualizar log para `SENT` ou `FAILED`.
   - Em caso de idempotencia, retornar `ALREADY_REQUESTED` na resposta da API sem criar novo log de envio. Nao persistir `ALREADY_REQUESTED` como status principal do log nesta fase.
7. [PROPOSTA] Criar controller para endpoint `POST /api/avaliacoes/:id/solicitar-cetic`.
8. [PROPOSTA] Registrar rota em `backend/src/routes/avaliacoesRouter.ts` com `authenticateToken` + `authorize(['admin'])`.
9. [PROPOSTA] Garantir que falha no envio ao CETIC **nunca altera o status da avaliacao** e **nunca remove o fallback manual**. O envio ao CETIC e operacao independente do ciclo de vida da avaliacao.
10. [PROPOSTA] Se `CETIC_EMAIL_TO`, `MAIL_FROM` ou variaveis SMTP estiverem ausentes no momento do envio, o endpoint deve retornar `FAILED` de forma controlada e registrar log `FAILED`, sem tentar enviar. Nao derrubar o servidor.
11. [PROPOSTA] Se `emailTemplateBuilder` falhar (ex: `APP_PUBLIC_URL` ausente), o endpoint deve retornar `FAILED` e manter o fallback manual disponivel no frontend.

Resposta sugerida de sucesso:

```json
{
  "message": "Solicitacao enviada ao CETIC com sucesso.",
  "status": "SENT",
  "avaliacaoId": 123,
  "sentTo": "cetic@uea.edu.br",
  "cc": [],
  "attemptId": 10
}
```

Resposta sugerida de idempotencia:

```json
{
  "message": "Ja existe uma solicitacao recente para esta avaliacao.",
  "status": "ALREADY_REQUESTED",
  "avaliacaoId": 123,
  "lastAttemptAt": "2026-05-07T12:00:00.000Z"
}
```

Resposta sugerida de falha controlada:

```json
{
  "message": "Nao foi possivel enviar a solicitacao ao CETIC. Use o fallback manual para copiar o conteudo.",
  "status": "FAILED",
  "avaliacaoId": 123,
  "attemptId": 11
}
```

## 6. O que deve ser implementado no frontend

1. [PROPOSTA] Em `frontend/src/api/avaliacoes.js`, adicionar funcao `solicitarCetic(id)` chamando `POST /api/avaliacoes/:id/solicitar-cetic`.
2. [PROPOSTA] Em `frontend/src/hooks/mutations/useAvaliacaoMutations.jsx`, adicionar `useSolicitarCeticMutation`.
3. [PROPOSTA] Em `frontend/src/components/Modals/Modal_EmailTemplate.jsx`, adicionar botao `Solicitar envio ao CETIC`.
4. [PROPOSTA] Passar `avaliacaoId` para `Modal_EmailTemplate` a partir de `Table_Avaliacao.jsx` (se necessario).
5. [PROPOSTA] Implementar loading/disabled para evitar duplo clique.
6. [PROPOSTA] Exibir feedback para `SENT`, `FAILED` e `ALREADY_REQUESTED`.
7. [PROPOSTA] Em falha, manter template visivel e copiavel (fallback manual obrigatorio).
8. [PROPOSTA] Nao recarregar pagina inteira; apenas atualizar o necessario.

## 7. O que NAO deve ser implementado

- Nao enviar e-mail para alunos, docentes, tecnicos ou outros avaliadores finais.
- Nao buscar lista de destinatarios finais.
- Nao implementar CSV.
- Nao implementar mala direta.
- Nao implementar fila (BullMQ/Redis).
- Nao implementar dashboard.
- Nao mexer em matriculados.
- Nao mexer em professor/disciplina.
- Nao alterar regras de status/disponibilidade da avaliacao (o envio ao CETIC e independente do ciclo de vida da avaliacao).
- Nao remover nem ocultar fallback manual de copia do template em nenhum cenario.
- Nao alterar autenticacao/autorizacao alem da nova rota admin.

- Nao implementar fases 4, 5 ou 6.

## 8. Passos sugeridos de implementacao por commit

### Fase 3A — Backend (validar antes de iniciar o frontend)

1. Commit 1: adicionar env vars de e-mail/CETIC + validacao Zod + atualizar `.env.example`.
2. Commit 2: criar provider de e-mail SMTP (interface + implementacao simples); adicionar `nodemailer` (e `@types/nodemailer` se necessario).
3. Commit 3: criar modelo Prisma de log + migration.
4. Commit 4: criar service/controller/rota `POST /api/avaliacoes/:id/solicitar-cetic`.
5. Commit 5: aplicar idempotencia + timeout controlado + auditoria.
6. Commit 6: testes backend.

### Fase 3B — Frontend (somente apos validacao do backend)

7. Commit 7: adicionar API/mutation no frontend.
8. Commit 8: adicionar botao e feedback no `Modal_EmailTemplate` mantendo fallback manual.
9. Commit 9: revisao final de escopo.

## 9. Criterios de aceite

- Endpoint `POST /api/avaliacoes/:id/solicitar-cetic` exige admin autenticado.
- Envio usa `CETIC_EMAIL_TO` (e `CETIC_EMAIL_CC` quando configurado).
- Tentativa fica registrada em log de auditoria.
- Duplo clique/tentativas consecutivas nao geram envios duplicados dentro da janela de idempotencia.
- Falha de e-mail nao altera status da avaliacao e nao remove o fallback manual.
- Frontend mostra feedback claro de sucesso/falha/ja solicitado.
- Fallback manual (copiar template) permanece disponivel independentemente do resultado do envio.
- Nenhum e-mail e enviado para avaliadores finais.
- Nao ha implementacao de itens de fases futuras.

## 10. Estrategia de testes

### Backend

- Teste unitario com mock do provider: caminho de sucesso.
- Teste unitario com mock do provider: falha e retorno `FAILED`.
- Teste unitario de idempotencia: segunda chamada retorna `ALREADY_REQUESTED`.
- Teste de permissao: usuario sem role admin recebe 403.
- Teste de timeout com provider mockado (falha por timeout retorna `FAILED` e nao altera status da avaliacao).

### Integracao

- Testar endpoint `POST /api/avaliacoes/:id/solicitar-cetic` com avaliacao valida.
- Validar criacao/atualizacao de log de tentativa.
- Validar resposta em cada status (`SENT`, `FAILED`, `ALREADY_REQUESTED`).

### Frontend

- Clique em `Solicitar envio ao CETIC` com sucesso -> mensagem de sucesso.
- Falha simulada -> mensagem de erro e fallback manual preservado.
- Resposta `ALREADY_REQUESTED` -> mensagem amigavel sem novo envio.
- Botao com loading/disabled evita duplo clique.

## 11. Cuidados importantes

- Nao deixar credenciais no codigo.
- Nao vazar credenciais SMTP para frontend.
- Nao criar reenvio infinito.
- Nao acoplar envio de e-mail com alteracao de status da avaliacao.
- Nao quebrar o template da Fase 2.
- Manter logs minimos, auditaveis e uteis.
- Implementacao deve ser simples, pequena, segura e reversivel.

## 12. Instrucao final para o Claude Code

Implemente somente a Fase 3. Nao avance para destinatarios finais, CSV, mala direta, dashboard, matriculados ou professor/disciplina. Ao final, apresente arquivos alterados, migrations criadas, variaveis de ambiente novas, testes realizados e pontos pendentes.
