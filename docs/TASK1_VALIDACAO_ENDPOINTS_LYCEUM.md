# Task 1 — Validação dos Endpoints Lyceum/CETIC

> **Executado em:** 15/06/2026
> **Executado por:** Claude Code (automação) com credenciais `edp.eng21@uea.edu.br`
> **Referência anterior:** `docs/LEVANTAMENTO_ENDPOINTS_LYCEUM_CPA.md` (12/05/2026)

---

## Resumo Executivo

| Item | Status |
|---|---|
| Autenticação (`/login`) | ✅ Funcionando — estrutura documentada |
| Homolog (`homolog-api.uea.edu.br`) | ❌ Down — 502 Bad Gateway em todos os endpoints |
| Produção (`api.uea.edu.br`) — endpoints A6 existentes | ✅ Confirmados (com oscilação) |
| `GET /Matriculados/listar` | ⚠️ Não testável — servidor em oscilação durante os testes |
| `GET /emails/listar` | ⚠️ Não testável — servidor em oscilação durante os testes |
| Endpoints de índice (`/listar/indice/{indice}`) | ⚠️ Não testável — mesmo motivo |
| Endpoints de filtro (`/listar/filtro`) | ⚠️ Não testável — mesmo motivo |
| Método dos endpoints de filtro (GET vs POST) | ⏳ Não confirmado — aguarda servidor estável |

**Conclusão principal:** Os endpoints `Matriculados` e `emails` **não constavam na documentação oficial do Lyceum em 12/05/2026**. Eles são provavelmente endpoints novos criados pelo CETIC. O ambiente homolog está fora e a produção oscilou durante os testes. É necessário aguardar estabilidade ou contatar o CETIC para confirmar disponibilidade e permissões.

---

## 1. Autenticação — Estrutura Confirmada

### Endpoint
```
POST https://api.uea.edu.br/lyceum/login
Content-Type: application/json

{
  "email": "usuario@uea.edu.br",
  "senha": "senha_do_usuario"
}
```

### Resposta real (estrutura completa confirmada)
```json
{
  "APILYCEUM": {
    "usuario": {
      "Sistema": "APILYCEUM",
      "Descricao": "Api de acesso a base de dados do sistema Lyceum UEA",
      "Versao": "V1",
      "Instituicao": "UEA - Universidade do Estado do Amazonas",
      "Desenvolvimento": "CTIC - UEA",
      "Ano": "maio - 2024",
      "DataHoraToken": "15-06-2026 19:19:58",
      "Iat": 1781565598,
      "Exp": 1781651998,
      "ModoAuth": "U",
      "Matricula": "2115080032",
      "Cpf": "04357270286",
      "Usuario": "edp.eng21",
      "UsuarioId": "126788",
      "UsuarioNome": "Eric Dias Perin",
      "UnidadeId": "16",
      "UnidadeSigla": "EST",
      "UnidadeNome": "Escola Superior de Tecnologia",
      "OberonPerfilid": "01",
      "OberonPerfilNome": "DISCENTE",
      "PerfilSistema": [1, 6],
      "EmailExterno": "email@gmail.com",
      "Ip": "172.26.0.3",
      "App": "Anônimo"
    },
    "status": true,
    "token": "eyJ0eXAiOiJKV1Qi..."
  }
}
```

### Campos importantes do token
| Campo | Tipo | Observação |
|---|---|---|
| `APILYCEUM.token` | string | JWT Bearer — usar no header `Authorization` |
| `APILYCEUM.status` | boolean | `true` em caso de sucesso |
| `APILYCEUM.usuario.ModoAuth` | string | `"U"` = User mode |
| `APILYCEUM.usuario.PerfilSistema` | number[] | Perfis do sistema — conta com `[1, 6]` tem A6 |
| `APILYCEUM.usuario.Exp` | number | Unix timestamp — token válido por 24h |
| `APILYCEUM.usuario.OberonPerfilid` | string | `"01"` = DISCENTE |

### Como usar o token
```http
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
```

---

## 2. Status dos Ambientes

### Homolog (`https://homolog-api.uea.edu.br`)
- **Status:** ❌ DOWN — 502 Bad Gateway em todos os endpoints testados
- **Incluindo:** `/lyceum/login`, `/lyceum/unidadecurso/listar`, `/lyceum/Matriculados/listar`
- **Ação necessária:** Contatar CETIC para verificar status do ambiente de homologação

### Produção (`https://api.uea.edu.br`)
- **Status inicial:** ✅ Estável — `/unidadecurso/listar` e `/cadu/aluno/historico/...` retornando 200
- **Status durante testes dos novos endpoints:** ❌ Oscilação — nginx retornando 405 com `Allow: OPTIONS` para TODOS os paths (incluindo URLs inexistentes), indicando interrupção temporária do servidor de aplicação PHP
- **Evidência de oscilação:** URL inventada `/lyceum/rota-inexistente-xyzabc` também retornou 405 — comportamento de nginx sem upstream PHP ativo

---

## 3. Endpoints A6 Confirmados (Referência)

Estes endpoints já estavam documentados em 12/05/2026 e funcionam com o perfil A6:

### `GET /lyceum/unidadecurso/listar`
- **Chaves da resposta:** `INDICE`, `UNIDADECURSOS`
- **Campos em `UNIDADECURSOS[]`:** `CURSO`, `NOME`, `MUNICIPIO_NOME`, `MUNICIPIO_UF`, `NOME_COMP`, `NOME_ABREV`, `TIPO`, `MODALIDADE`, `CURSO_TIPO`

---

## 4. Novos Endpoints (Matriculados e Emails) — Contexto Crítico

### Descoberta importante
O documento de levantamento de 12/05/2026 **NÃO lista** os endpoints `/Matriculados/listar` e `/emails/listar`. Eles foram especificados na Task como endpoints "disponibilizados para o perfil A6 da CPA" — o que indica que são endpoints **criados recentemente pelo CETIC**, possivelmente após o levantamento anterior.

Segundo o levantamento de maio:
- **Contagem de matriculados:** "Caminho C — solicitar ao CETIC. Não existe endpoint que retorne COUNT de alunos agrupado"
- **Lista de e-mails:** "Sem endpoint dedicado identificado — precisa do CETIC"

### Hipóteses sobre os novos endpoints

**Hipótese A — Endpoints dedicados novos:**
O CETIC criou endpoints específicos para o CPA com A6 que retornam dados agregados (matriculados por curso/período e e-mails por perfil/unidade). Estes não constam na documentação pública.

**Hipótese B — Liberação de A6 para endpoints existentes:**
O CETIC habilitou o perfil A6 nos endpoints de aluno/email que antes exigiam A2/A4. As URLs `/Matriculados/listar` e `/emails/listar` seriam aliases ou novos nomes.

**Hipótese C — Endpoints só disponíveis via VPN ou IP específico:**
Os novos endpoints podem exigir acesso de IP específico (servidor CPA) e não estarem disponíveis externamente.

---

## 5. O Que Falta Confirmar

| Item | Como confirmar |
|---|---|
| URLs exatas dos novos endpoints | Testar quando homolog estiver estável OU pedir documentação ao CETIC |
| Método de `/filtro` (GET ou POST) | Testar com servidor estável |
| Nome do campo de quantidade de matriculados | Testar `/Matriculados/listar` com resposta real |
| Estrutura JSON de `/Matriculados/listar` | Testar quando disponível |
| Estrutura JSON de `/emails/listar` | Testar quando disponível |
| Estrutura JSON dos índices | Testar `listar/indice/{indice}` |
| Se conta consumer tem A6 para os novos endpoints | Verificar com CETIC |

---

## 6. Próximos Passos Recomendados

### Imediato (Pessoa 1 + Pessoa 2)
1. **Monitorar homolog:** Testar `https://homolog-api.uea.edu.br/lyceum/login` periodicamente. Quando subir, testar os 6 endpoints.
2. **Contatar CETIC:** Confirmar:
   - Os endpoints `/Matriculados/listar` e `/emails/listar` existem e estão disponíveis para A6?
   - Qual o ambiente correto para testes (homolog ou produção)?
   - A credencial `LYCEUM_CONSUMER_EMAIL` tem acesso a esses endpoints?
   - Existe documentação interna para eles?

### Quando homolog voltar (ou com resposta do CETIC)
Executar os testes listados nos itens do checklist da issue #109.

---

## 7. O Que o Backend Já Sabe Fazer

Baseado no `lyceumService.ts` existente:
- Autenticação via `POST /lyceum/login` com `{ email, senha }` → `APILYCEUM.token`
- Token injetado via interceptor Axios em todas as requisições
- `getUnidadeCursos()` → `GET /unidadecurso/listar` → `{ UNIDADECURSOS: LyceumCursoDTO[] }`
- `getAlunoInfo(token)` → usa token pessoal do aluno (ModoAuth U)

O `LyceumCursoDTO` atual:
```typescript
interface LyceumCursoDTO {
    CURSO: string;
    NOME: string;
    MUNICIPIO_NOME: string;
    MUNICIPIO_UF: string;
    NOME_COMP: string;
    NOME_ABREV: string;
    TIPO: string;
    MODALIDADE: string;
    CURSO_TIPO: string;
}
```

---

## 8. Perguntas para o CETIC (Atualização)

Com base nos testes de hoje, acrescentar às perguntas anteriores:

1. **Os endpoints `/lyceum/Matriculados/listar` e `/lyceum/emails/listar` existem na API?** Eles não constam na documentação pública. Confirmar se foram criados e se o perfil A6 tem acesso.

2. **O ambiente de homologação (`homolog-api.uea.edu.br`) está operacional?** Retornou 502 em todos os testes de hoje (15/06/2026).

3. **Quais são os campos de resposta dos endpoints de Matriculados e Emails?** Especialmente: qual campo contém a quantidade de matriculados?

4. **O endpoint de filtro usa GET ou POST?** Confirmar método HTTP para `/listar/filtro`.

5. **A credencial `edp.eng21@uea.edu.br` (PerfilSistema: [1, 6]) tem acesso aos novos endpoints?**
