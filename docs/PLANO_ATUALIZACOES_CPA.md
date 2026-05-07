# Plano Tecnico - Atualizacoes CPA (v2)

## 1. Resumo executivo

Este plano foi refinado para sair de um formato de arquitetura macro e entrar em formato de execucao controlada.

Objetivo da v2:

- manter o que foi encontrado no codigo real;
- incluir fase explicita de investigacao externa (Spike Lyceum/CETIC);
- reordenar as fases para entregar valor rapido sem abrir refatoracao pesada cedo;
- quebrar cada fase em tarefas pequenas (estilo commit/backlog);
- adicionar criterios de aceite e estrategia de testes por fase;
- detalhar governanca de envio CETIC (idempotencia, logs, fallback);
- revisar estimativas das fases com maior risco tecnico.

Diretriz de execucao:

- entregas pequenas, independentes e reversiveis;
- no maximo uma mudanca estrutural por fase;
- bloquear implementacao de matriculados e professor/disciplina ate concluir Spike.

---

## 2. Estado atual identificado no codigo

### Backend

Encontrado no codigo:

- Rotas de avaliacao, incluindo envio e prorrogacao:
  - `backend/src/routes/avaliacoesRouter.ts`
- Controller de envio atualmente troca status para enviada:
  - `backend/src/controllers/avaliacoesController.ts`
- Regra principal no service:
  - `backend/src/services/avaliacoesService.ts` (switchStatus)
- Relatorios e dashboard:
  - `backend/src/routes/respostasRouter.ts`
  - `backend/src/controllers/respostasController.ts`
  - `backend/src/services/respostasService.ts`
- Integracoes Lyceum existentes:
  - login e token/sessao: `backend/src/services/authService.ts`
  - unidade/curso via consumer: `backend/src/services/lyceumService.ts`
  - disciplinas por perfil: `backend/src/services/avaliacoesService.ts`
- Modelo de dados atual:
  - `backend/prisma/schema.prisma`
  - respostas com `disciplina` textual em `Respostas` e `RespostasGrade`
- Filtro de disponibilidade por curso/categoria/unidade:
  - `backend/src/repositories/avaliacaoRepository.ts`

Lacunas encontradas no codigo:

- nao existe servico de e-mail institucional implementado;
- nao existe endpoint para gerar template de e-mail ao enviar avaliacao;
- nao existe modelagem professor/oferta/turma no Prisma;
- dashboard por categoria usa populacao fixa/mock, nao matriculados reais.

### Frontend

Encontrado no codigo:

- Rotas admin/avaliador/relatorios:
  - `frontend/src/App.jsx`
- Fluxo de envio atual:
  - botao em `frontend/src/components/Tables/Table_Avaliacao.jsx`
  - API em `frontend/src/api/avaliacoes.js`
  - mutation em `frontend/src/hooks/mutations/useAvaliacaoMutations.jsx`
- Pontos de nomenclatura visual:
  - `frontend/src/components/utils/Sidebar.jsx`
  - `frontend/src/pages/Categorias.jsx`
  - `frontend/src/components/Tables/Table_Avaliacao.jsx`
- Dashboard e relatorios:
  - `frontend/src/pages/Relatorios.jsx`
  - `frontend/src/pages/RelatorioAvaliacao.jsx`
  - `frontend/src/pages/RelatorioDisciplinas.jsx`
  - `frontend/src/hooks/queries/useRespostaQueries.jsx`
- Exportacao PDF:
  - `frontend/src/hooks/usePDFExport.js`
  - `frontend/src/components/PDFBuilders/*`

### Documentacao

Encontrado no codigo:

- `README.md`
- `docs/SISTEMA_ATUAL_DETALHADO.md`
- `docs/OBERON_PROFILES_MAPPING.md`
- `backend/src/utils/oberonProfileMapper.ts`

---

## 3. Demandas da CPA e impacto tecnico

1. Nomenclatura visual

- Impacto: baixo.
- Escopo: camada de apresentacao frontend/PDF.

2. E-mail ao enviar avaliacao

- Impacto: medio.
- Escopo: backend (template/endpoint) + frontend (modal/copia).

3. Solicitacao ao CETIC

- Impacto: medio.
- Escopo: governanca de envio, idempotencia, logs e fallback.

4. Matriculados por curso/periodo

- Impacto: medio/alto.
- Escopo: depende da viabilidade da API Lyceum.

5. Dashboard avancado + PDF

- Impacto: alto.
- Escopo: unificacao da regra de agregacao e filtro.

6. Avaliacao por professor/disciplina

- Impacto: alto.
- Escopo: nova modelagem e mudanca de fluxo de coleta.

---

## 4. Fase 1 - Ajustes visuais de nomenclatura

Escopo:

- Trocar "Categorias" por "Categorias Academicas" em UI.
- Trocar exibicao "Tecnico" por "Tecnico Administrativo" em UI.

Arquivos provaveis:

- `frontend/src/components/utils/Sidebar.jsx`
- `frontend/src/pages/Categorias.jsx`
- `frontend/src/components/Tables/Table_Avaliacao.jsx`
- `frontend/src/pages/RelatorioAvaliacao.jsx`
- `frontend/src/components/PDFBuilders/AvaliacaoPDFBuilder.js`

Nao alterar:

- schema Prisma, seed, regras de matching por categoria, enums internos.

Tarefas por commit (proposta):

- Commit 1: criar mapper de labels de exibicao (somente frontend).
- Commit 2: aplicar mapper em menu/telas de cadastro/listagem.
- Commit 3: aplicar mapper nos PDFs e revisar textos residuais.

Criterios de aceite:

- nenhum endpoint ou payload de API foi alterado;
- nenhuma regra de filtro por categoria foi alterada;
- labels novos visiveis em menu, tela de categorias, tabela de avaliacao e PDF.

Estrategia de testes:

- smoke manual admin nas telas afetadas;
- validar criacao/edicao/envio de avaliacao sem regressao.

---

## 5. Fase 2 - E-mail basico ao enviar avaliacao

Ponto atual no backend:

- `PUT /api/avaliacoes/:id/enviar` em `backend/src/routes/avaliacoesRouter.ts`
- implementacao em `backend/src/controllers/avaliacoesController.ts` e `backend/src/services/avaliacoesService.ts`

Proposta tecnica:

- ao enviar avaliacao, retornar tambem `emailTemplate` com assunto/corpo.
- manter status da avaliacao como fonte de verdade (nao acoplar status ao envio de e-mail).

Contrato proposto de retorno:

- `message`
- `avaliacao`
- `emailTemplate.subject`
- `emailTemplate.body`
- `emailTemplate.systemUrl`

Variavel de ambiente proposta:

- `APP_PUBLIC_URL` para link canonico do sistema.

Tarefas por commit (proposta):

- Commit 1: criar `emailTemplateBuilder` no backend.
- Commit 2: alterar retorno do endpoint de envio com `emailTemplate`.
- Commit 3: ajustar mutation de envio no frontend para ler `emailTemplate`.
- Commit 4: criar modal pos-envio com botoes copiar assunto/corpo.

Criterios de aceite:

- status muda para enviada como hoje;
- resposta da API inclui template completo;
- modal abre apos envio com conteudo copiavel;
- nenhuma tentativa de envio real de e-mail nesta fase.

Estrategia de testes:

- teste unitario do builder de template;
- teste de integracao do endpoint para retorno do novo contrato;
- teste manual do fluxo de envio e copia no frontend.

---

## 6. Fase 3 - Solicitacao ao CETIC (governanca de envio)

Situacao atual:

- nao existe servico de e-mail no projeto.

Decisoes necessarias:

- quem envia (sistema ou intermediacao obrigatoria CETIC);
- remetente institucional permitido;
- trilha de auditoria minima.

Variaveis de ambiente propostas:

- `MAIL_PROVIDER`
- `MAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `CETIC_EMAIL_TO`
- `CETIC_EMAIL_CC` (opcional)

Endpoint proposto:

- `POST /api/avaliacoes/:id/solicitar-cetic`

Regras de governanca (proposta):

- idempotencia por avaliacao + janela temporal (evitar duplo clique);
- timeout explicito e retry controlado (sem loop infinito);
- registro de tentativa (sucesso/falha, data/hora, usuario admin, hash do payload);
- fallback manual (copiar conteudo) sem reverter status da avaliacao.

Tarefas por commit (proposta):

- Commit 1: criar interface de provider de e-mail + implementacao inicial.
- Commit 2: criar endpoint `solicitar-cetic` com idempotencia.
- Commit 3: adicionar persistencia de logs de solicitacao.
- Commit 4: adicionar acao no frontend e feedback de sucesso/falha.

Criterios de aceite:

- botao nao dispara envio duplicado em clique repetido;
- falha de envio nao altera status da avaliacao;
- tentativa fica registrada para auditoria;
- fallback manual disponivel no frontend.

Estrategia de testes:

- teste de integracao com mock de provider (sucesso/falha/timeout);
- teste de idempotencia;
- teste de permissao admin;
- teste manual de UX no frontend.

---

## 7. Fase 0.5 (Spike) - Investigacao tecnica Lyceum/CETIC

Objetivo:

- reduzir incerteza antes das fases 4 e 6.

Entregaveis obrigatorios do Spike:

- lista de endpoints reais para:
  - matriculados agregados por curso/unidade/periodo;
  - aluno -> disciplinas -> turma -> professor (se existir);
  - destinatarios/e-mails para mala direta (se existir);
- requisitos de autenticacao (consumer token, token pessoal, ambos);
- payloads reais de sucesso e erro;
- limites de rate/performance e politicas de uso;
- permissao efetiva do perfil CPA em homolog/producao;
- identificador tecnico estavel de professor (ou ausencia dele).

Saida esperada:

- documento de decisao (go/no-go) para fase 4 e fase 6 com estrategia A/B:
  - A: implementacao direta por endpoint agregado;
  - B: snapshot local quando endpoint agregado inexistente.

Criterios de aceite do Spike:

- todos os itens acima respondidos com evidencia objetiva;
- backlog das fases 4 e 6 revisado com base no resultado.

---

## 8. Fase 4 - Matriculados por curso/periodo

Dependencia:

- iniciar somente apos conclusao do Spike.

Ja existe no sistema:

- integracao com Lyceum para dados academicos e importacao de cursos/unidades.

Lacunas:

- sem endpoint interno de matriculados;
- sem snapshot local de matriculas.

Proposta de modelagem (quando necessario):

- entidade `MatriculasSnapshot`:
  - `periodo_letivo`
  - `curso_identificador_api_lyceum`
  - `unidade_sigla`
  - `categoria` (quando aplicavel)
  - `matriculados`
  - `capturado_em`
  - `fonte`

Endpoints internos propostos:

- `GET /api/dashboard/matriculados`
- `POST /api/matriculados/snapshot`

Tarefas por commit (proposta):

- Commit 1: definir contrato de consulta de matriculados.
- Commit 2: implementar coleta (direta Lyceum ou snapshot local).
- Commit 3: expor endpoint para dashboard.
- Commit 4: integrar cards de matriculados e taxa de participacao.

Criterios de aceite:

- taxa de participacao calculada como `respostas/matriculados*100`;
- filtros por periodo/unidade/curso funcionando;
- valor consistente entre API e tela.

Estrategia de testes:

- testes de calculo e arredondamento;
- testes de filtro por combinacoes principais;
- teste de regressao com avaliacao sem matriculados (divisao por zero).

---

## 9. Fase 5 - Dashboard avancado e PDF com filtros

Meta:

- camada unica de agregacao para dashboard e PDF.

Estado atual:

- endpoints separados para dashboard e relatorios;
- frontend ainda compoe parte da regra de apresentacao e agregacao.

Proposta:

- criar `analyticsAggregationService` no backend.
- padronizar query params:
  - `periodo`, `avaliacaoId`, `unidadeId`, `cursoId`, `categoriaId`, `modalidadeId`, `eixo`, `dimensao`, `municipio`.
- frontend apenas renderiza datasets agregados.

Tarefas por commit (proposta):

- Commit 1: definir contrato unico de filtros e resposta.
- Commit 2: implementar agregacao unica no backend.
- Commit 3: migrar dashboard para novo endpoint.
- Commit 4: migrar relatorio e exportacao PDF para mesmo dataset.
- Commit 5: remover duplicacoes antigas de regra no frontend.

Criterios de aceite:

- mesmos numeros em dashboard e PDF para o mesmo filtro;
- filtros novos aplicaveis em todos os blocos do relatorio;
- tempo de resposta aceitavel no recorte principal.

Estrategia de testes:

- testes de contrato da API de agregacao;
- testes de consistencia dashboard x PDF;
- testes de filtro combinatorio (amostras criticas);
- smoke manual em ambiente com dados reais.

---

## 10. Fase 6 - Avaliacao por professor/disciplina

Dependencia:

- iniciar apos Spike com identificador tecnico de professor confirmado.

Estado atual:

- repeticao por disciplina existe, mas disciplina e texto;
- sem entidade professor/oferta;
- risco alto de colisao se usar nome.

Proposta de modelagem:

- `Professor` normalizado:
  - `id`
  - `codigo_externo` (quando existir)
  - `cpf_hash` (se permitido)
  - `nome_exibicao`
- `OfertaDisciplinaProfessor`:
  - periodo/unidade/curso/disciplina/turma/professor
- respostas referenciam `oferta_disciplina_professor_id` nas questoes que exigirem.

Fluxo proposto para avaliador:

- selecao por oferta (disciplina + turma + professor), nao apenas nome.

Tarefas por commit (proposta):

- Commit 1: criar modelagem Prisma e migracoes.
- Commit 2: adaptar montagem de avaliacao para ofertas.
- Commit 3: adaptar persistencia de respostas com chave tecnica.
- Commit 4: criar endpoints/relatorios por professor-disciplina.
- Commit 5: ajustar frontend de resposta e relatórios.

Criterios de aceite:

- nenhum fluxo depende de nome como identificador unico;
- relatorio por professor/disciplina funciona por oferta;
- respostas historicas antigas continuam consultaveis.

Estrategia de testes:

- testes de integridade referencial;
- teste com professor em multiplos cursos/unidades;
- teste de regressao em questoes sem repeticao por disciplina;
- testes de permissao admin/avaliador.

---

## 11. Dependencias externas e perguntas para CETIC/Lyceum

- Existe endpoint de matriculados agregados por curso/unidade/periodo?
- Existe endpoint para destinatarios/e-mails por avaliacao?
- O perfil CPA tem permissao para esses dados em homolog e producao?
- Existe endpoint aluno -> disciplinas -> professor/turma/oferta?
- Existe identificador unico de professor estavel entre sistemas?
- Qual politica para uso de CPF (completo, mascarado, hash)?
- Envio direto de e-mail pelo sistema e permitido ou obrigatoriamente via CETIC?
- Quais limites de uso e SLA dos endpoints relevantes?

---

## 12. Riscos tecnicos

Risco alto:

- dependencia de API externa sem contrato estavel;
- divergencia numerica dashboard x PDF sem agregacao unica;
- identificacao de professor por nome.

Risco medio:

- regressao de regra ao mexer em nomenclatura;
- duplicidade de solicitacao CETIC sem idempotencia;
- falha de envio sem trilha de auditoria.

Risco baixo:

- ajustes visuais com impacto localizado;
- pequenas variacoes de arredondamento em percentuais.

Risco de compliance/LGPD:

- armazenamento de dados pessoais sem minimizacao;
- falta de trilha para quem solicitou envio e quando.

---

## 13. Estimativa por fase (dias uteis)

- Fase 1: 1 a 2 dias.
- Fase 2: 2 a 4 dias.
- Fase 3: 4 a 8 dias.
- Fase 0.5 (Spike): 3 a 7 dias.
- Fase 4: 5 a 12 dias (depende do resultado do Spike).
- Fase 5: 10 a 18 dias.
- Fase 6: 12 a 25 dias.

Observacao:

- Fases 5 e 6 foram revisadas para faixa mais conservadora devido ao risco de integracao e refatoracao.

---

## 14. Ordem recomendada de implementacao

Ordem final recomendada:

1. Fase 1 - Nomenclatura visual.
2. Fase 2 - Template/modal de e-mail.
3. Fase 3 - Solicitacao ao CETIC (governanca de envio).
4. Fase 0.5 - Spike Lyceum/CETIC.
5. Fase 4 - Matriculados no dashboard.
6. Fase 5 - Dashboard avancado + PDF com agregacao unica.
7. Fase 6 - Professor/disciplina com nova modelagem.

Racional:

- entrega rapida para a CPA nas fases 1, 2 e 3;
- evita iniciar partes de alto risco sem evidencias tecnicas do Spike;
- reduz retrabalho ao consolidar agregacao antes da fase professor/disciplina.

---

## 15. Checklists finais por fase

### Fase 1

- [ ] Labels alterados somente em apresentacao.
- [ ] Sem mudanca de schema ou regra interna.
- [ ] Smoke de telas admin e PDF.

### Fase 2

- [ ] Endpoint de envio retorna `emailTemplate`.
- [ ] Modal de copia no frontend funcionando.
- [ ] Sem envio real de e-mail nesta fase.

### Fase 3

- [ ] Endpoint CETIC com idempotencia.
- [ ] Logs de tentativa persistidos.
- [ ] Falha de envio nao altera status da avaliacao.

### Fase 0.5 (Spike)

- [ ] Endpoints externos validados com evidencias.
- [ ] Identificador tecnico de professor confirmado ou risco formalizado.
- [ ] Decisao A/B para fases 4 e 6 documentada.

### Fase 4

- [ ] Fonte de matriculados definida (direta ou snapshot).
- [ ] Taxa de participacao com filtros funcionando.
- [ ] Validacao numerica com dados reais.

### Fase 5

- [ ] Camada unica de agregacao ativa.
- [ ] Dashboard e PDF usando a mesma base.
- [ ] Consistencia de filtro comprovada.

### Fase 6

- [ ] Modelagem professor/oferta em producao.
- [ ] Coleta e relatorio por oferta funcionando.
- [ ] Regressao de fluxos antigos validada.

---

## 16. Checklist geral final

- [ ] Aprovar esta v2 com stakeholders (produto, CETIC, equipe tecnica).
- [ ] Executar fases na ordem recomendada.
- [ ] Trabalhar por PRs pequenas e rastreaveis.
- [ ] Incluir criterios de aceite no template de cada PR.
- [ ] Incluir plano de testes por fase antes de codificar.
- [ ] Registrar decisoes externas do Spike no repositorio (`docs/`).
