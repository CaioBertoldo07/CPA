# Mapeamento de Perfis Oberon para Categorias CPA

## Contexto
O sistema CPA precisa mapear os perfis Oberon (O1-O8) da Universidade do Estado do Amazonas (UEA) para categorias internas (DISCENTE, DOCENTE, TÉCNICO). Este mapeamento determina:

1. **Quais avaliações cada usuário pode visualizar/responder** com base no perfil
2. **Controle de acesso padrão** para diferentes grupos de usuários

## Mapeamento de Perfis

| ID | Nome Oberon | Categorias CPA | Descrição |
|----|------------|---|----------|
| O1 | DISCENTE | DISCENTE | Perfil de Alunos |
| O2 | DOCENTE | DOCENTE | Perfil de Professores |
| O3 | TÉCNICO | TÉCNICO | Perfil de Servidores Técnico-Administrativos |
| O4 | DISCENTE E DOCENTE | DISCENTE, DOCENTE | Usuário com múltiplos papéis (aluno e professor) |
| O5 | DISCENTE E TÉCNICO | DISCENTE, TÉCNICO | Usuário com múltiplos papéis (aluno e técnico) |
| O6 | DOCENTE E TÉCNICO | DOCENTE, TÉCNICO | Usuário com múltiplos papéis (professor e técnico) |
| O7 | EXTERNO | DOCENTE | Perfil de Docentes ou Técnicos Externos |
| O8 | ESTAGIÁRIO | TÉCNICO | Perfil de Estagiário (tratado como técnico) |

## Implementação

### Arquivo: `backend/src/utils/oberonProfileMapper.ts`
Contém:
- Mapa completo `OBERON_PROFILES` com ID, nome e categorias
- Funções utilitárias:
  - `getOberonProfile(perfilId)` - Obtém perfil completo
  - `getCategoriesForProfile(perfilId)` - Retorna array de categorias
  - `getProfileName(perfilId)` - Retorna nome do perfil (uso auxiliar)
  - `getCategoriesAsString(perfilId)` - Retorna categorias em formato string separado por `;`
  - `isValidOberonProfile(perfilId)` - Valida se ID é válido

## Fluxo de Login Atualizado

1. Usuário entra com email/senha da UEA
2. API Lyceum retorna e `OberonPerfilid` (ex: "4")
3. Backend usa `oberonPerfilNome` como categoria (sem mapear no login)
4. Token JWT é gerado com:
  - `categoria: oberonPerfilNome`
   - `oberonPerfilId: "4"`
   - `oberonPerfilNome: [valor original da API]`
5. Quando `/auth/me` é chamado, `verifyUser()` preserva `categoria`/`oberonPerfilNome`

## Próximos Passos

1. **Rebuild do backend**: `docker compose up --build -d backend`
2. **Reset do banco de dados** (opcional): Se deseja usar o novo seed com categorias corretas
3. **Teste de login**: Verificar que `categoria` retorna o nome correto baseado em `OberonPerfilId`
4. **Filtro de avaliações** (futuro): Atualizar queries de avaliações para filtrar por categorias do usuário

## Notas Técnicas

- O campo `categoria` no DTO `UserResponseDTO` vem diretamente de `oberonPerfilNome`
- Para perfis com múltiplas categorias (O4, O5, O6), o valor já vem do Oberon (ex: "DISCENTE E DOCENTE")
- A função utiliza `;` como separador para armazenamento em banco, se necessário usar array
- O mapeamento é **idempotente**: mesmo `OberonPerfilid` sempre retorna a mesma categoria
- **Backward compatible**: Perfis desconhecidos retornam 'DISCENTE' como fallback seguro
