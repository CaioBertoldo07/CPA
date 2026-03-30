# CPA - Comissão Própria de Avaliação

Projeto para gestão e realização de autoavaliação institucional.

### A avaliação interna das instituições, também denominada de autoavaliação, faz parte da Avaliação Institucional e caracteriza-se como um processo contínuo por meio do qual as Instituições de Educação Superior (IES) constroem conhecimento sobre a sua própria realidade com o objetivo de compreender os significados do conjunto de suas atividades educativas e alcançar maior relevância social. 
### A avaliação interna é coordenada pela Comissão Própria de Avaliação (CPA) e orientada pelas diretrizes e pelo roteiro da autoavaliação institucional da Comissão Nacional de Avaliação da Educação Superior (Conaes).


## Tecnologias Utilizadas

O CPA é construído com uma stack moderna e robusta:

- **Frontend:** React, Vite, Material UI (MUI), TanStack Query (React Query).
- **Backend:** Node.js, Express.
- **Banco de Dados:** PostgreSQL, Prisma ORM.
- **Infraestrutura:** Docker, Docker Compose, Nginx (no frontend).

## Documentação Adicional

- [Indice de Documentacao](docs/README.md)
- [Estrutura do Banco de Dados (Diagrama ER)](docs/database.md)

## Como Rodar o Projeto

Este projeto utiliza **Docker** para facilitar a execução. Siga os passos abaixo:

### 1. Pré-requisitos
- Docker e Docker Compose instalados.

### 2. Configuração
Crie os arquivos `.env` baseados nos exemplos:

- No diretório `backend/`:
  ```bash
  cp .env.example .env
  ```
- No diretório `frontend/`:
  ```bash
  cp .env.example .env
  ```

> **Importante:** No arquivo `.env` do backend, as variáveis `LYCEUM_CONSUMER_EMAIL` e `LYCEUM_CONSUMER_PASSWORD` devem pertencer a uma conta com permissões de acesso à API de autenticação e dados da UEA.

### 3. Iniciar os Containers
Na raiz do projeto, execute:
```bash
docker compose up --build -d
```

### 4. Inicializar e Popular o Banco de Dados
Com os containers rodando, execute os comandos abaixo para criar as tabelas e inserir os dados iniciais (Admin, Eixos, Dimensões e categorias):

```bash
# Criar tabelas e gerar o schema
docker exec backend-cpa npx prisma db push

# Popular o banco com dados iniciais
docker exec backend-cpa npx prisma db seed
```

### 5. Acesso
- **Frontend:** [http://localhost:3050](http://localhost:3050)
- **Backend:** [http://localhost:3034](http://localhost:3034)

---
## Estrutura do Projeto
- `backend/`: API em Node.js com Express e Prisma.
- `frontend/`: Aplicação React.
- `docker-compose.yml`: Orquestração dos serviços (Backend, Frontend e PostgreSQL).
