# CPA - Comissão Própria de Avaliação

PT-BR: Sistema para gestão de autoavaliação institucional (CPA), com autenticação integrada ao ecossistema UEA/Lyceum, criação de avaliações, aplicação por perfil e consolidação de respostas.

EN: System for institutional self-assessment management (CPA), with UEA/Lyceum-integrated authentication, evaluation authoring, profile-based execution, and response consolidation.

## Índice | Table of Contents

1. [Visão geral | Overview](#visão-geral--overview)
2. [Arquitetura | Architecture](#arquitetura--architecture)
3. [Stack técnica | Tech stack](#stack-técnica--tech-stack)
4. [Pré-requisitos | Prerequisites](#pré-requisitos--prerequisites)
5. [Quick start com Docker | Docker quick start](#quick-start-com-docker--docker-quick-start)
6. [Execução local sem Docker | Local run without Docker](#execução-local-sem-docker--local-run-without-docker)
7. [Variáveis de ambiente | Environment variables](#variáveis-de-ambiente--environment-variables)
8. [Banco de dados e Prisma | Database and Prisma](#banco-de-dados-e-prisma--database-and-prisma)
9. [Autenticação e autorização | Authentication and authorization](#autenticação-e-autorização--authentication-and-authorization)
10. [Fluxo de avaliação por perfil | Profile-based evaluation flow](#fluxo-de-avaliação-por-perfil--profile-based-evaluation-flow)
11. [Operação diária | Daily operations](#operação-diária--daily-operations)
12. [Troubleshooting](#troubleshooting)
13. [Documentação complementar | Additional documentation](#documentação-complementar--additional-documentation)

## Visão geral | Overview

PT-BR:
- O backend expõe APIs REST para autenticação, configuração de avaliações, cadastro de entidades acadêmicas e submissão de respostas.
- O frontend fornece interface para administradores e avaliadores.
- O banco PostgreSQL persiste entidades de avaliação, questões, categorias, modalidades, cursos e respostas.

EN:
- The backend exposes REST APIs for authentication, evaluation setup, academic entity management, and response submission.
- The frontend provides interfaces for administrators and evaluators.
- PostgreSQL stores evaluation entities, questions, categories, modalities, courses, and responses.

## Arquitetura | Architecture

PT-BR:
- Monorepo com 2 apps principais e 1 camada de documentação.
- Deploy local padrão por Docker Compose com 3 serviços: frontend, backend e banco.

EN:
- Monorepo with 2 main apps and 1 documentation layer.
- Default local deployment via Docker Compose with 3 services: frontend, backend, and database.

```text
CPA/
  backend/      # API Node.js + Express + Prisma
  frontend/     # SPA React + Vite + MUI + TanStack Query
  docs/         # Documentação técnica complementar
  docker-compose.yml
```

## Stack técnica | Tech stack

PT-BR e EN:
- Frontend: React 18, Vite, Material UI, TanStack Query, Axios.
- Backend: Node.js, Express, TypeScript, Prisma ORM.
- Database: PostgreSQL 16.
- Infra: Docker, Docker Compose, Nginx (container do frontend).
- API docs: Swagger em runtime.

## Pré-requisitos | Prerequisites

PT-BR:
- Docker + Docker Compose (recomendado).
- Opcional para modo local: Node.js 18+ e npm.

EN:
- Docker + Docker Compose (recommended).
- Optional for local mode: Node.js 18+ and npm.

## Quick start com Docker | Docker quick start

PT-BR:
1. Copie os arquivos de ambiente.
2. Suba os containers.
3. Inicialize o schema e rode seed.
4. Acesse frontend e backend.

EN:
1. Copy environment files.
2. Start containers.
3. Initialize schema and run seed.
4. Open frontend and backend.

### 1) Configuração de ambiente | Environment setup

Windows PowerShell:
```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Linux/macOS:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Importante | Important:
- Defina um valor forte para JWT_SECRET no backend/.env (mínimo 32 caracteres).
- Configure credenciais Lyceum válidas em LYCEUM_CONSUMER_EMAIL e LYCEUM_CONSUMER_PASSWORD.

### 2) Subir stack | Start stack

```bash
docker compose up --build -d
```

### 3) Inicializar banco | Initialize database

```bash
docker exec backend-cpa npx prisma db push
docker exec backend-cpa npx prisma db seed
```

### 4) Endpoints locais | Local endpoints

- Frontend: http://localhost:3050
- Backend API: http://localhost:3034
- Swagger: http://localhost:3034/api-docs
- PostgreSQL: localhost:5432

### 5) Parar stack | Stop stack

```bash
docker compose down
```

Remover volumes (apaga dados locais do banco) | Remove volumes (deletes local DB data):

```bash
docker compose down -v
```

## Execução local sem Docker | Local run without Docker

PT-BR:
- Use este modo para desenvolvimento rápido em terminais separados.
- Necessita PostgreSQL ativo e backend/.env configurado para seu host local.

EN:
- Use this mode for fast development in separate terminals.
- Requires a running PostgreSQL and backend/.env configured for your local host.

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Observação | Note:
- No modo local, o Vite costuma abrir em http://localhost:5173.

## Variáveis de ambiente | Environment variables

### Backend (backend/.env)

Obrigatórias | Required:
- DATABASE_URL
- JWT_SECRET (mínimo 32)

Comuns | Common:
- PORT (padrão: 3034)
- NODE_ENV (development, test, production)
- ALLOWED_ORIGINS (lista separada por vírgula)
- ENABLE_SWAGGER (true/false)
- SWAGGER_SERVER_URL (opcional)
- IMPORT_CURSOS_ON_START (true/false)
- DISABLE_SSL_VALIDATION (true/false, apenas dev)
- MATRICULA_HASH_SECRET
- LYCEUM_CONSUMER_EMAIL
- LYCEUM_CONSUMER_PASSWORD
- ADMIN_NAME
- ADMIN_EMAIL

Padrões e validação centralizados em:
- backend/src/config/env.ts

### Frontend (frontend/.env)

- VITE_BACKEND_URL (opcional)
  - vazio: usa /api (recomendado com proxy)
  - preenchido: usa URL absoluta de backend

Container frontend (Nginx) usa:
- API_PROXY_URL (definida no docker-compose para http://backend:3034)

## Banco de dados e Prisma | Database and Prisma

Comandos úteis (backend):

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
npx prisma studio
npm run migrate
```

Quando usar | When to use:
- db push: sincronização rápida em desenvolvimento.
- migrate deploy: aplicação de migrations em ambiente controlado/produção.
- seed: carga inicial de dados de apoio.

## Autenticação e autorização | Authentication and authorization

PT-BR:
- Login integra com API da UEA/Lyceum.
- Sessão baseada em cookie HTTP-only no backend.
- Endpoint de sessão: GET /auth/me.
- Papel administrativo: role admin/user + isAdmin.

EN:
- Login integrates with UEA/Lyceum API.
- Session is backend-managed via HTTP-only cookie.
- Session endpoint: GET /auth/me.
- Admin model: role admin/user + isAdmin.

## Fluxo de avaliação por perfil | Profile-based evaluation flow

PT-BR:
- Perfis/categorias de referência: DISCENTE, DOCENTE, TÉCNICO.
- Questões marcadas para repetição por disciplina usam consulta por perfil:
  - Discente: histórico por matrícula pessoal.
  - Docente: turmas por ano/func/semestre.
  - Técnico: sem lista de disciplinas.

EN:
- Reference profile/categories: DISCENTE, DOCENTE, TECNICO.
- Questions flagged to repeat per discipline rely on profile-based data retrieval:
  - Discente: history by personal enrollment.
  - Docente: classes by year/func/semester.
  - Tecnico: no discipline list.

## Operação diária | Daily operations

Subir ambiente | Start environment:
```bash
docker compose up --build -d
```

Status dos serviços | Service status:
```bash
docker compose ps
```

Logs do backend | Backend logs:
```bash
docker logs -f backend-cpa
```

Logs do frontend | Frontend logs:
```bash
docker logs -f frontend-cpa
```

Logs do banco | Database logs:
```bash
docker logs -f db-cpa
```

Rebuild apenas backend | Rebuild backend only:
```bash
docker compose up --build -d backend
```

Rebuild apenas frontend | Rebuild frontend only:
```bash
docker compose up --build -d frontend
```

## Troubleshooting

### 1) Erro de ambiente inválido no backend
Sintoma:
- Invalid environment variables / JWT_SECRET muito curto.

Ação:
- Ajuste backend/.env para cumprir as regras de backend/src/config/env.ts.
- JWT_SECRET deve ter no mínimo 32 caracteres.

### 2) Falha de login/session 401
Sintoma:
- Login parece ok, mas /auth/me retorna 401.

Ação:
- Verifique ALLOWED_ORIGINS no backend/.env.
- Verifique se frontend está usando mesma origem/proxy esperado.
- Confirme cookie de sessão presente e não bloqueado pelo navegador.

### 3) Seed não insere dados esperados
Sintoma:
- Categorias/eixos/dimensões ausentes.

Ação:
- Reexecute db push + seed.
- Valide backend/prisma/database.json e backend/prisma/seed.ts.

### 4) Erro de integração com API UEA
Sintoma:
- Timeout/erro SSL/erro de autorização em endpoints externos.

Ação:
- Revise LYCEUM_CONSUMER_EMAIL e LYCEUM_CONSUMER_PASSWORD.
- Em desenvolvimento, avalie DISABLE_SSL_VALIDATION=true somente se necessário.

### 5) Porta ocupada
Sintoma:
- Docker ou Vite falha ao subir por conflito de porta.

Ação:
- Libere a porta local ou ajuste mapeamento no docker-compose.yml.

## Documentação complementar | Additional documentation

- Índice de docs: [docs/README.md](docs/README.md)
- Modelo de dados (ER): [docs/database.md](docs/database.md)
- Mapeamento de perfis Oberon: [docs/OBERON_PROFILES_MAPPING.md](docs/OBERON_PROFILES_MAPPING.md)

## Licença | License

Este projeto está sob a licença definida em [LICENSE](LICENSE).

This project is under the license defined in [LICENSE](LICENSE).
