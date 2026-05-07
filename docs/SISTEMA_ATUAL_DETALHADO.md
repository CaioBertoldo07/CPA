# Documentacao Detalhada do Sistema CPA (Estado Atual)

## 1. Objetivo deste documento

Este documento descreve como o sistema CPA funciona hoje, com base no codigo atual do repositorio.

Escopo coberto:
- funcionalidades por perfil de usuario
- fluxo funcional ponta a ponta
- mapa de telas no frontend
- mapa de endpoints no backend
- regras de negocio principais
- estrutura de dados e entidades
- integracoes externas (Lyceum/UEA)
- processos automatizados (cron e seed)
- requisitos operacionais e limitacoes atuais

## 2. Visao geral do sistema

O CPA e um sistema de autoavaliacao institucional com dois atores principais:
- Admin: configura e opera avaliacoes e cadastros
- Avaliador (usuario comum): responde avaliacoes disponiveis para seu perfil

A arquitetura e composta por:
- frontend SPA (React + Vite)
- backend API REST (Node.js + Express + TypeScript)
- banco PostgreSQL (Prisma ORM)

O sistema utiliza autenticacao integrada ao ecossistema UEA/Lyceum, com sessao baseada em cookie HTTP-only no backend e validacao de permissao por perfil administrativo.

## 3. Arquitetura funcional

### 3.1 Frontend

Responsabilidades:
- autenticar usuario
- exibir telas administrativas
- exibir telas de avaliador
- montar formularios de resposta
- exibir relatorios e indicadores

Stack principal:
- React 18
- React Router
- TanStack Query
- Material UI
- Axios

### 3.2 Backend

Responsabilidades:
- autenticar usuarios contra API da universidade
- aplicar autorizacao por papeis
- expor CRUDs e fluxos de avaliacao
- aplicar validacoes de negocio
- consolidar relatorios
- integrar com Lyceum para dados academicos

Stack principal:
- Express
- TypeScript
- Prisma
- JWT
- Zod (config/env)

### 3.3 Banco de dados

Responsabilidades:
- persistir configuracoes da avaliacao
- persistir respostas anonimizadas
- manter catalogos auxiliares (eixos, dimensoes, categorias, etc.)

## 4. Perfis, acesso e permissao

## 4.1 Usuario nao autenticado

- Acesso apenas a tela de login
- Sem acesso a APIs protegidas

## 4.2 Avaliador (usuario autenticado nao admin)

Capacidades:
- consultar avaliacoes disponiveis para seu perfil
- abrir avaliacao e responder perguntas
- consultar se ja respondeu determinada avaliacao
- acessar pagina de ajuda

Restricoes:
- nao acessa CRUD administrativo
- nao acessa relatorios gerenciais
- nao pode alterar configuracoes

## 4.3 Admin

Capacidades:
- tudo do avaliador (quando aplicavel)
- CRUD de entidades administrativas
- criacao, edicao, envio, prorrogacao e exclusao de avaliacoes
- consulta de respostas e relatorios
- gerenciamento de outros admins

## 5. Fluxo ponta a ponta

## 5.1 Login

1. Usuario informa email e senha
2. Backend chama API Lyceum para validar credenciais
3. Backend monta payload do usuario (inclui papel admin/user)
4. Backend emite JWT (24h) e grava cookie HTTP-only cpa_auth
5. Frontend consome /auth/me para identificar sessao ativa e nivel de acesso

Observacoes:
- login possui rate limit no endpoint de autenticacao
- logout limpa cookie de sessao
- endpoint de registro existe, mas retorna nao implementado

## 5.2 Jornada do admin

1. Admin entra na area administrativa
2. Configura base (eixos, dimensoes, padroes, categorias, modalidades, etc.)
3. Cadastra/edita questoes e composicao da avaliacao
4. Cria avaliacao com unidades, categoria, questoes e, quando necessario, cursos/modalidades
5. Envia avaliacao para o ciclo ativo
6. Acompanha resultados em dashboards e relatorios

## 5.3 Jornada do avaliador

1. Avaliador entra na area de avaliacoes disponiveis
2. Sistema filtra avaliacoes conforme perfil e vinculacoes
3. Avaliador abre avaliacao e responde formulario
4. Sistema valida preenchimento e salva respostas
5. Sistema marca avaliacao como respondida para aquele usuario

## 6. Estado e ciclo de vida de avaliacao

Status atuais observados no dominio:
- 1: Rascunho
- 2: Enviada
- 3: Ativa
- 4: Encerrada

Comportamento:
- ao listar avaliacoes, backend tenta ativar disponiveis e encerrar vencidas
- avaliacao em rascunho e a principal candidata para alteracoes
- relatorios consolidam respostas por avaliacao e filtros de contexto

## 7. Regras de negocio principais

## 7.1 Regras de criacao/edicao de avaliacao

- unidades, categorias e questoes devem existir
- se categoria DISCENTE estiver selecionada:
  - pelo menos uma modalidade obrigatoria
  - pelo menos um curso obrigatorio
- validacoes de existencia sao feitas via repositorios

## 7.2 Disponibilidade para avaliador

Filtragem considera combinacoes de:
- categoria/perfil do usuario (discente, docente, tecnico)
- periodo de vigencia (janela de datas)
- unidade e/ou curso (conforme perfil)
- status da avaliacao

Para evitar dupla resposta:
- busca respostas ja registradas para a avaliacao e exclui da lista disponivel

## 7.3 Respostas e anonimato

- matricula e anonimizada por hash
- sistema verifica duplicidade por hash e, por compatibilidade, tambem por matricula crua em dados legados
- em caso de falha no Lyceum para dados complementares, resposta ainda pode ser salva sem enriquecimento demografico

## 7.4 Tipos de questao

- tipo objetivo (alternativa unica)
- tipo grade (subitens/questoes adicionais)

Tambem existe suporte para repeticao por disciplina:
- questoes marcadas para repetir por disciplina podem gerar multiplas linhas de resposta para um mesmo usuario

## 8. Modulos funcionais do frontend

## 8.1 Rotas publicas

- /
- /login

## 8.2 Rotas admin

- /eixos
- /avaliacoes
- /relatorios
- /questoes
- /admin
- /modalidades
- /categorias
- /padraoresposta
- /agenda
- /cursos
- /relatorio/:id
- /relatorio/:id/disciplinas

## 8.3 Rotas avaliador

- /avaliadores (redirect)
- /avaliadores/avaliacoes
- /avaliadores/ajuda
- /avaliadores/avaliacao/:id

## 8.4 O que cada area entrega

Login:
- autenticacao
- tratamento de erro de sessao

Area Admin:
- dashboards e relatorios
- CRUD de catalogos e estrutura academica
- CRUD de questoes e avaliacoes
- controle de admins

Area Avaliador:
- lista de pendencias
- formulario de respostas por eixo/dimensao
- feedback de progresso e status de envio

## 9. API backend por dominio

Nota: todas as rotas em /api sao protegidas, exceto auth/login (e endpoints de health fora de /api).

## 9.1 Auth

Base: /api/auth

- POST /login
- GET /me
- POST /logout
- POST /register (nao implementado para uso real)

## 9.2 Avaliacoes

- POST /api/avaliacoes
- GET /api/avaliacoes
- GET /api/avaliacoes/disponiveis
- GET /api/avaliacoes/:id
- PUT /api/avaliacoes/:id
- DELETE /api/avaliacoes/:id
- GET /api/verificar-resposta/:idAvaliacao
- PUT /api/avaliacoes/:id/enviar
- PUT /api/avaliacoes/:id/prorrogar

## 9.3 Respostas e relatorios

- POST /api/respostas
- GET /api/avaliacoes/:idAvaliacao/respostas
- GET /api/avaliacoes/:id/relatorio/disciplinas
- GET /api/dashboard/estatisticas-categorias

## 9.4 Questoes

- GET /api/questoes
- POST /api/questoes
- GET /api/questoes/:id
- PUT /api/questoes/:id
- DELETE /api/questoes/:id

## 9.5 Padrao de resposta e alternativas

Padrao:
- GET /api/padraoresposta
- POST /api/padraoresposta
- GET /api/padraoresposta/:id
- PUT /api/padraoresposta/:id
- DELETE /api/padraoresposta/:id

Alternativas:
- GET /api/alternativas
- POST /api/alternativas
- GET /api/alternativas/:id
- PUT /api/alternativas/:id
- DELETE /api/alternativas/:id
- GET /api/alternativas/byIdPadrao/:id

## 9.6 Categorias

- GET /api/categorias
- POST /api/categorias
- PUT /api/categorias/:id
- DELETE /api/categorias/:id

## 9.7 Modalidades

- GET /api/modalidades
- POST /api/modalidades
- GET /api/modalidades/:id
- PUT /api/modalidades/:id
- DELETE /api/modalidades/:id

## 9.8 Eixos e dimensoes

Eixos:
- GET /api/eixos
- POST /api/eixos
- GET /api/eixos/:numeroEixo
- PUT /api/eixos/:numero
- DELETE /api/eixos/:numero

Dimensoes (base /api/dimensoes):
- GET /numero/:numero
- GET /eixo/:numeroEixo
- GET /eixo/numero/:numeroDimensao
- GET /
- POST /
- DELETE /:numero
- PUT /:numero

## 9.9 Cursos

- GET /api/cursos
- GET /api/cursos/by-unidades
- GET /api/cursos/by-modalidades
- GET /api/cursos/paginated
- POST /api/cursos/classify
- PATCH /api/cursos/status
- GET /api/cursos/tipos

## 9.10 Unidades e municipios

Unidades:
- GET /api/unidades
- GET /api/unidades/municipios
- GET /api/unidades/:id

Municipios:
- GET /api/municipios
- GET /api/municipios/:id

## 9.11 Tipos de questao

- GET /api/tipos

## 9.12 Admin

- GET /api/admin
- POST /api/admin
- PUT /api/admin/:email
- DELETE /api/admin/:email

## 9.13 Operacao e saude da aplicacao

- GET /health
- GET /readiness

## 10. Entidades e dados (visao de dominio)

Entidades centrais:
- Avaliacao
- Questoes
- Avaliacao_questoes
- Respostas
- RespostasGrade

Catalogos e classificacoes:
- Eixos
- Dimensoes
- Categorias
- Modalidades
- Padrao_resposta
- Alternativas
- Questoes_tipo

Estrutura academica:
- Cursos
- Unidades
- Municipios

Controle de acesso:
- Admin

Pontos importantes:
- ha relacoes muitos-para-muitos entre avaliacao e varios catalogos
- ha tabelas ignoradas no Prisma Client para legados/estruturas sem chave adequada

## 11. Integracoes externas

## 11.1 Lyceum/UEA

Uso principal:
- autenticar usuario
- obter dados academicos do perfil discente
- obter lista institucional de cursos para importacao

Configuracao:
- base URL via variavel de ambiente
- credenciais especificas para consumo de dados institucionais

Seguranca/compatibilidade:
- existe configuracao para tolerar cenarios de SSL em ambiente nao produtivo

## 11.2 Token universitario em memoria

- token da universidade e mantido em memoria no backend para consultas complementares
- estrategia reduz exposicao no cliente, mas exige cuidado com reinicio de processo

## 12. Automacoes e carga inicial

## 12.1 Cron de importacao de cursos

Quando habilitado em configuracao de ambiente:
- backend chama API institucional de cursos
- realiza upsert de cursos
- realiza upsert de unidades/municipios relacionados
- atualiza modalidades derivadas do curso

## 12.2 Seed de banco

Inicializa dados essenciais:
- admin padrao
- tipos de questao
- dados estruturais iniciais (eixos/dimensoes/categorias)
- modalidades base

## 13. Operacao, deploy e configuracao

## 13.1 Variaveis criticas no backend

- DATABASE_URL
- JWT_SECRET
- ALLOWED_ORIGINS
- LYCEUM_API_BASE_URL
- LYCEUM_CONSUMER_EMAIL
- LYCEUM_CONSUMER_PASSWORD
- IMPORT_CURSOS_ON_START
- DISABLE_SSL_VALIDATION
- MATRICULA_HASH_SECRET
- ENABLE_SWAGGER

## 13.2 Variaveis criticas no frontend

- VITE_BACKEND_URL
- API_PROXY_URL (quando executado em container Nginx)

## 13.3 Documentacao em runtime

- Swagger pode ser habilitado por configuracao

## 14. Limites e lacunas atuais

Lacunas funcionais:
- registro publico de usuario nao disponivel
- recuperacao de senha fora do escopo CPA (dependente do provedor institucional)
- sem trilha completa de auditoria de alteracoes por entidade

Limites tecnicos observaveis:
- dependencia alta da disponibilidade da API institucional
- sem mecanismo explicito de refresh token
- comportamento de dados complementares depende de token universitario em memoria

## 15. Riscos operacionais e recomendacoes

Riscos:
- indisponibilidade do Lyceum impacta login e enriquecimento de dados
- ausencia de politicas explicitas de backup/restore pode impactar continuidade
- mudancas de schema sem governanca podem afetar relatorios

Recomendacoes:
- formalizar rotina de backup e testes de restauracao
- monitorar health/readiness e latencia de integracao externa
- definir politica de observabilidade (logs, alertas, auditoria)
- documentar SLA interno para janela de avaliacao e encerramento

## 16. Resumo executivo

Hoje o CPA entrega um fluxo completo para:
- autenticar usuarios via ambiente institucional
- configurar avaliacoes com regras por perfil
- coletar respostas anonimizadas
- consolidar relatorios gerenciais

O sistema esta funcional para operacao administrativa e aplicacao de avaliacoes, com foco em integracao academica e governanca basica de dados.

---

Ultima atualizacao deste documento: 2026-05-06
Base de referencia: codigo atual do repositorio CPA
