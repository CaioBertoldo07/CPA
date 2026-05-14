# Levantamento de Endpoints Lyceum para Atualizações CPA

> **Documento gerado em:** 12/05/2026
> **Fontes analisadas:**
> - Homologação: https://homolog-api.uea.edu.br/lyceum/api/documentacao (155 endpoints)
> - Produção: https://api.uea.edu.br/lyceum/api/documentacao (156 endpoints)
> - Perfil A6 filtrado: https://homolog-api.uea.edu.br/lyceum/api/documentacao/perfil/A6 (16 endpoints)

---

## 1. Resumo Executivo

### Demandas viáveis com endpoints existentes (perfil A6 direto)

- **Listar unidades e cursos com modalidade:** Viável agora. Endpoints `6.04`–`6.06` (`/unidadecurso/listar`) liberam A6 e retornam unidade, curso, modalidade, município.
- **Docentes por turma/disciplina/ano (eixo 3 dim. 2):** Viável agora. Endpoints `4.09`–`4.11` (`/docente/listar/turmas/ano/{ano}` e variações) liberam A6 e retornam CPF, nome, e-mail, titulação, turma, disciplina, curso, unidade.
- **Login e autenticação:** Sem restrição de perfil.

### Dependem de liberação de permissão para A6

- **Matriculados por curso/período:** endpoints de aluno (`/aluno/listar`, `/matricula/listar`, `/alunoview/listar`, `/cadu/aluno/historico/faculdade`) exigem A2/A4.
- **Disciplinas atuais do aluno:** endpoints `5.04`, `5.11`–`5.15` exigem A2/A4.
- **Vínculo aluno → professor (horário de aulas):** endpoint `5.19`/`5.20` exige A2/A4.

### Sem endpoint evidente

- **Contagem agregada de matriculados por curso/unidade/período:** não existe — solicitar ao CETIC.
- **Lista de destinatários/e-mails por unidade/curso/perfil para mala direta:** não encontrada.
- **Envio de notificação ao CETIC via API:** não encontrado.

### Perguntas prioritárias para o CETIC

Ver Seção 11 — 10 perguntas listadas.

---

## 2. Metodologia

A análise foi conduzida diretamente nas páginas de documentação oficial da API LYCEUM:

- **Homologação** (`homolog-api.uea.edu.br`): 155 endpoints em 7 módulos — 1_GERAL (3), 2_AUTENTICACAO (5), 3_USUARIO (1), 4_LYCEUM (39), 5_CADU (21), 6_PORTAL_CALOURO (17), 7_DIPLOMA_DIGITAL (69).
- **Produção** (`api.uea.edu.br`): 156 endpoints. Diferença: 1 endpoint extra em `7_DIPLOMA_DIGITAL` (`7.70 – atualizar/rollback/status/all/processos`, irrelevante para o CPA).
- **Documentação filtrada por perfil A6** (`/perfil/A6`): 16 endpoints — 10 sem exigência de perfil + 6 específicos para A6.

Termos pesquisados: aluno, matricula, docente, turma, disciplina, historico, curso, unidade, email, horario, prematricula, A6.

---

## 3. Endpoints de Autenticação e Token

| Finalidade | Método | Endpoint | Perfil exigido | Corpo | Retorno útil | Observação |
|---|---|---|---|---|---|---|
| Login usuário UEA (LDAP/OBERON) | POST | `/lyceum/login` | Nenhum | `{"email":"...","senha":"...","app":"..."}` | JWT + Matricula, Cpf, UsuarioNome, UnidadeId, UnidadeSigla, OberonPerfilid, OberonPerfilNome, PerfilSistema, EmailExterno, token | Endpoint principal. Token JWT válido 24h. Usar header `Authorization: Bearer {token}` nas demais chamadas. |
| Login mock (dev) | POST | `/lyceum/loginmoc` | Nenhum | Igual | JWT mock | Apenas para desenvolvimento |
| Login teste | POST | `/lyceum/loginteste` | Nenhum | Igual | JWT teste | Apenas para testes |
| Login concluinte/ex-aluno | POST | `/lyceum/login/concluinte` | Nenhum | `{"email":"...","senha":"...","app":"..."}` | JWT + dados de concluinte (OberonPerfilid: O1 Discente) | Para fluxos envolvendo concluintes |
| Login mock concluinte | POST | `/lyceum/loginmoc/concluinte` | Nenhum | Igual | JWT mock | Apenas dev |

**Campos do token retornado (confirmados no endpoint 2.01):**
`Matricula`, `Cpf`, `Usuario`, `UsuarioId`, `UsuarioNome`, `UnidadeId`, `UnidadeSigla`, `UnidadeNome`, `OberonPerfilid`, `OberonPerfilNome`, `PerfilSistema` (array de IDs numéricos), `EmailExterno`, `Ip`, `App`, `token` (JWT).

---

## 4. Endpoints de Usuário/Perfil

| Finalidade | Método | Endpoint | Perfil exigido | Parâmetros | Retorno útil | Serve para o CPA? |
|---|---|---|---|---|---|---|
| Cadastro de usuário na API | POST | `/lyceum/usuario/novo` | Nenhum | Body com CPF/CNPJ, nome | Confirmação de cadastro | Não diretamente |
| Dados do docente (próprio) | GET | `/lyceum/docente/listar/cpfpessoal` | A1, A2, A3, A4 | Token | Dados do docente logado | Não (A6 não listado) |
| Dados do aluno (próprio) | GET | `/lyceum/aluno/listar/matriculapessoal` | [1] token pessoal | Token | Dados do aluno logado | Não (token do próprio aluno) |
| Aluno completo (view) por CPF pessoal | GET | `/lyceum/alunoview/listar/cpfpessoal` | A1, A2, A3, A4 | Token | Dados completos do aluno logado | Não (A6 não listado) |
| Pessoa por CPF pessoal | GET | `/lyceum/pessoa/listar/cpfpessoal` | A1, A2, A3, A4 | Token | Dados de pessoa | Não (A6 não listado) |
| Coordenador de curso (próprio) | GET | `/lyceum/coordcurso/listar/matriculapessoal` | A1, A2, A3, A4 | Token | Coordenadores do próprio curso | Não (A6 não listado) |

**Nota:** O token retornado pelo `/login` já contém todos os dados do usuário logado (matrícula, CPF, unidade, perfil), dispensando endpoint separado para identificação do usuário CPA.

---

## 5. Endpoints de Cursos / Unidades / Modalidades

| Finalidade | Método | Endpoint | Perfil exigido | Parâmetros | Retorno útil | Observação |
|---|---|---|---|---|---|---|
| Listar todos os cursos | GET | `/lyceum/curso/listar` | A1, A2, A3, A4, A9 | — | CURSO, MNEMONICO, NOME, TITULO, TIPO, MODALIDADE, FACULDADE (unidade), DEPTO, ATIVO, VAGAS, dados INEP | **A6 não listado** — requer liberação |
| Listar cursos por tipo | GET | `/lyceum/curso/listar/tipo/{tipo}` | A1, A2, A3, A4 | tipo (PGSS, PGLS, CEX, AP, DO, GRAD) | Idem filtrado por tipo | **A6 não listado** |
| **Listar unidades + cursos** | GET | **`/lyceum/unidadecurso/listar`** | **A2, A3, A4, A6** | — | CURSO, MNEMONICO, NOME, TITULO, TIPO, MODALIDADE, FACULDADE, NOME_COMP, NOME_ABREV, MUNICIPIO_ID, MUNICIPIO_NOME, MUNICIPIO_UF | **Disponível para A6** |
| **Unidades + cursos por município** | GET | **`/lyceum/unidadecurso/listar/municipio/{municipio}`** | **A2, A3, A4, A6** | municipio | Idem filtrado | **Disponível para A6** |
| **Unidades + cursos por unidade** | GET | **`/lyceum/unidadecurso/listar/unidade/{unidade}`** | **A2, A3, A4, A6** | unidade | Idem filtrado | **Disponível para A6** |
| Coordenadores de cursos | GET | `/lyceum/coordcurso/listar` | A2, A3, A4 | — | Dados de coordenadores | A6 não listado |
| Coordenadores por município | GET | `/lyceum/coordcurso/listar/municipio/{municipio}` | A2, A3, A4 | municipio | Idem | A6 não listado |
| Coordenadores por unidade | GET | `/lyceum/coordcurso/listar/unidade/{unidade}` | A2, A3, A4 | unidade | Idem | A6 não listado |
| Coordenadores por matrícula | GET | `/lyceum/coordcurso/listar/matricula/{matricula}` | A2, A3, A4 | matricula | Idem | A6 não listado |

---

## 6. Endpoints para Matriculados por Curso/Período

| Possibilidade | Método | Endpoint | Parâmetros | Retorno | Limitação | Decisão sugerida |
|---|---|---|---|---|---|---|
| Lista de todos os alunos ativos | GET | `/lyceum/aluno/listar` | — | ALUNO, CURSO, CURSO_NOME, TURNO, NOME_COMPL, ... | 187.964 registros totais; 10.000 por chamada; **A2/A3/A4 apenas** | Caminho B |
| Aluno por matrícula | GET | `/lyceum/aluno/listar/matricula/{matricula}` | matricula | Dados de um aluno | Individual; A2/A3/A4 | Caminho B (individual) |
| Matrículas (todas) | GET | `/lyceum/matricula/listar` | — | ALUNO, DISCIPLINA, TURMA, ANO, SEMESTRE, SIT_MATRICULA | 102.168 registros; 10.000/chamada; A2/A3/A4; sem filtro por curso | Caminho B |
| Matrículas por aluno | GET | `/lyceum/matricula/listar/aluno/{aluno}` | aluno | Disciplinas matriculadas do aluno | Individual; A2/A3/A4 | Caminho B |
| Matrículas pessoal | GET | `/lyceum/matricula/listar/matriculapessoal` | Token | Matrículas do aluno logado | A1/A2/A3/A4 | Apenas para o próprio aluno |
| Aluno + curso + unidade (view) | GET | `/lyceum/alunoview/listar` | — | ALUNO, CPF, E_MAIL, CURSO, CURSO_NOME, CURSO_TIPO, ANO_INGRESSO, UNIDADE, UNIDADE_NOME | 1.781.103 registros(!); A2/A3/A4; **sem filtro por período** | Caminho B |
| Histórico por faculdade/unidade | GET | `/lyceum/cadu/aluno/historico/faculdade/{faculdade}` | faculdade | ALUNO_MATRICULA, ALUNO_NOME, ALUNO_CPF, ALUNO_EMAIL, DISC_ANO, DISC_SEMESTRE, DISC_DISCIPLINA, DISC_TURMA, DISC_SIT_HIST | A2/A4; filtro por unidade, sem período | Caminho B |
| Horário de aulas por unidade/ano/semestre | GET | `/lyceum/cadu/aluno/horarioaulas/faculdade/{faculdade}/ano/{ano}/semestre/{semestre}` | faculdade, ano, semestre | ALUNO, DISCIPLINA, TURMA, ANO, SEMESTRE + **DOCEN_NUM_FUNC, DOCEN_NOME_COMPL** | 65.536 registros; A2/A3/A4; melhor candidato pois filtra por período | Caminho B (+ docente) |
| Pré-matrículas por ano/semestre | GET | `/lyceum/prematricula/listar/ano/{ano}/semestre/{semestre}` | ano, semestre | Lista de pré-matrículas | A2/A3/A4; pode não incluir todos ativos | Não confirmado |

### Classificação Final

**Caminho A — endpoint agregado pronto:** NÃO ENCONTRADO. Não há endpoint que retorne COUNT de alunos agrupado por curso/unidade/período.

**Caminho B — lista individual, CPA agrega:** Possível com `/lyceum/cadu/aluno/historico/faculdade/{f}` (filtro por unidade) ou `/lyceum/aluno/listar` (sem filtro, 187k registros). Porém ambos exigem A2/A4, não A6. Além disso, o volume de dados exige paginação ou múltiplas chamadas.

**Caminho C — solicitar ao CETIC:** Recomendado como solução definitiva. Solicitar ao CETIC: (a) liberação de A6 para endpoints de aluno, OU (b) endpoint novo de contagem agregada, OU (c) snapshot periódico como arquivo exportável.

---

## 7. Endpoints para Disciplinas do Aluno

| Método | Endpoint | Parâmetros | Retorno útil | Limitação |
|---|---|---|---|---|
| GET | `/lyceum/cadu/aluno/disciplina/matricula/{matricula}/ano/{ano}/semestre/{semestre}` | matricula, ano, semestre | ALUNO_MATRICULA, MATRICULA_ANO, MATRICULA_SEMESTRE, MATRICULA_SITUACAO, TURMA_SIGLA, TURMA_UNIDADE, TURMA_TURNO, DISCIPLINA_SIGLA, DISCIPLINA_NOME, NOME (aluno) | A2/A4; **não retorna professor** |
| GET | `/lyceum/cadu/aluno/historico/semestreatual/matricula/{matricula}` | matricula | ALUNO_MATRICULA, ALUNO_NOME_COMPL, ALUNO_CPF, DISC_ANO, DISC_SEMESTRE, DISC_DISCIPLINA, DISC_NOME, DISC_TURMA, DISC_SIT_HIST, DISC_NOTA_FINAL, DISC_PERC_PRESENCA | A2/A4; **não retorna professor** |
| GET | `/lyceum/cadu/aluno/historico/matricula/{matricula}/ano/{ano}/semestre/{semestre}` | matricula, ano, semestre | Idem acima filtrado por período | A2/A4; não retorna professor |
| GET | `/lyceum/cadu/aluno/historico` | — | ALUNO_MATRICULA, ALUNO_NOME_COMPL, ALUNO_CPF, ALUNO_EMAIL, DISC_ANO, DISC_SEMESTRE, DISC_DISCIPLINA, DISC_NOME, DISC_TURMA, DISC_SIT_HIST | A2/A3/A4; **5 milhões de registros totais** — não usar sem filtro |
| GET | `/lyceum/matricula/listar/aluno/{aluno}` | aluno (matrícula) | ALUNO, DISCIPLINA, TURMA, ANO, SEMESTRE, SIT_MATRICULA, CONCEITO_FIM | A2/A3/A4; não retorna professor |
| GET | `/lyceum/prematricula/listar/matricula/{matricula}` | matricula | Pré-matrículas do aluno | A2/A3/A4 |

**Observação crítica:** Nenhum endpoint de disciplinas do aluno retorna o professor. Para vincular aluno → disciplina → professor, é necessário cruzar com os endpoints de docente por turma (Seção 8).

---

## 8. Endpoints para Professor por Disciplina/Turma/Oferta

| Método | Endpoint | Parâmetros | Retorno útil | Identificador do professor | Limitação |
|---|---|---|---|---|---|
| GET | `/lyceum/docente/listar/turmas` | — | DOC_NUM_FUNC, DOC_NOME_COMPL, **DOC_CPF**, DOC_EMAIL, DOC_EMAIL_COM, DOC_TITULACAO, TUR_ANO, TUR_SEMESTRE, TUR_DISCIPLINA, TUR_TURMA, TUR_FACULDADE, CUR_CURSO, CUR_NOME, CUR_MODALIDADE | CPF + num_func + e-mail | A2/A3/A4; 144.628 registros totais |
| GET | `/lyceum/docente/listar/turmas/ano/{ano}/semestre/{semestre}` | ano, semestre | Idem filtrado | CPF + num_func | A2/A3/A4 |
| GET | **`/lyceum/docente/listar/turmas/ano/{ano}`** | ano | Idem filtrado por ano | CPF + num_func | **A2, A6 — disponível para A6!** |
| GET | **`/lyceum/docente/listar/turmas/ano/{ano}/func/{func}`** | ano, matrícula funcional | Idem filtrado por ano e funcionário | CPF + num_func | **A2, A6 — disponível para A6!** |
| GET | **`/lyceum/docente/listar/turmas/ano/{ano}/func/{func}/semestre/{semestre}`** | ano, func, semestre | Idem filtrado por ano, funcionário e semestre | CPF + num_func | **A2, A6 — disponível para A6!** |
| GET | `/lyceum/docente/listar/turmas/cpf/{cpf}` | cpf | Todas as turmas de um docente | CPF | A2/A3/A4 |
| GET | `/lyceum/docente/listar/turmas/cpf/{cpf}/ano/{ano}` | cpf, ano | Turmas do docente filtrado por ano | CPF | A2/A3/A4 |
| GET | `/lyceum/docente/listar/turmas/cpf/{cpf}/ano/{ano}/semestre/{semestre}` | cpf, ano, semestre | Turmas do docente por período | CPF | A2/A3/A4 |
| GET | `/lyceum/cadu/aluno/horarioaulas/faculdade/{faculdade}/ano/{ano}/semestre/{semestre}` | faculdade, ano, semestre | ALUNO, DISCIPLINA, TURMA, ANO, SEMESTRE, **DOCEN_NUM_FUNC**, **DOCEN_NOME_COMPL** | Num_func + nome | A2/A3/A4; vincula aluno ↔ professor por turma |
| GET | `/lyceum/cadu/aluno/horarioaulas/matricula/{matricula}/ano/{ano}/semestre/{semestre}` | matricula, ano, semestre | Idem para um aluno específico | Num_func + nome | A2/A3/A4 |

### Classificação sobre identificação do professor

- **Professor tem CPF estável?** SIM — campo `DOC_CPF` presente em todos os endpoints de docente/turmas (confirmado nos endpoints 4.06, 4.07, 4.09).
- **Professor vem só por nome?** NÃO — além do nome (`DOC_NOME_COMPL`), há CPF (`DOC_CPF`), número funcional (`DOC_NUM_FUNC`), e-mails institucionais e pessoal.
- **Há turma/oferta?** SIM — campos `TUR_TURMA`, `TUR_DISCIPLINA`, `TUR_ANO`, `TUR_SEMESTRE`, `TUR_FACULDADE`, `CUR_CURSO`.
- **Serve para avaliação por professor/disciplina (eixo 3 dim. 2)?** SIM — com os endpoints 4.09–4.11 (disponíveis para A6), o CPA obtém docente → turma → disciplina → curso → unidade → semestre. Para vincular com o avaliador (aluno), o endpoint 5.19/5.20 é necessário mas requer A2/A4.
- **Professores duplicados em cursos/unidades diferentes:** `DOC_CPF` + `TUR_FACULDADE` permitem identificar o professor e diferenciar seus contextos. Um mesmo professor aparece em múltiplas tuplas se ministrar disciplinas em unidades ou cursos distintos (comportamento esperado, não um bug).

---

## 9. Endpoints para Destinatários/E-mails

| Método | Endpoint | Parâmetros | Retorno útil | Serve para envio direto? | Limitação |
|---|---|---|---|---|---|
| GET | `/lyceum/docente/listar/email/{email}` | email | Dados do docente com aquele e-mail | Não (busca individual) | A2/A3/A4; não é listagem |
| GET | `/lyceum/docente/listar/emailpessoal` | Token | E-mail do docente logado | Não (apenas pessoal) | A1/A2/A3/A4 |
| GET | `/lyceum/alunoview/listar/email/{email}` | email | Dados do aluno com aquele e-mail | Não (busca individual) | A2/A3/A4; não é listagem |
| GET | `/lyceum/docente/listar/turmas/ano/{ano}` | ano | DOC_EMAIL, DOC_EMAIL_COM por turma | Parcial — e-mails presentes como campo | A2/A6; requer agregação |
| GET | `/lyceum/alunoview/listar` | — | E_MAIL do aluno | Parcial — campo presente sem filtro de destinatários | A2/A3/A4; 1,7 mi de registros |

### Classificação

- **Pronto para envio direto:** INSUFICIENTE. Não existe endpoint que retorne lista de e-mails por avaliação/unidade/curso/perfil.
- **Parcial:** Os endpoints de docente/turmas (A6) e alunoview (A2/A4) incluem e-mails nos campos de retorno. Com processamento no CPA, é possível extrair listas — mas isso requer permissão adicional para alunoview.
- **Precisa do CETIC:** Confirmar com CETIC se uso de e-mails da API para mala direta é permitido (LGPD) e se há endpoint dedicado planejado.

---

## 10. Matriz Demanda × Endpoints

| Demanda CPA | Endpoint(s) necessário(s) | Encontrado? | Perfil necessário | Risco | Observação |
|---|---|---|---|---|---|
| 1. Enviar solicitação ao CETIC para divulgação de avaliação | Nenhum identificado | NÃO | — | Alto | Processo manual/e-mail externo; sem endpoint na API |
| 2. Matriculados por curso/período | `/lyceum/aluno/listar` + filtros, ou `/cadu/aluno/historico/faculdade/{f}` | PARCIAL | A2/A4 (A6 não tem acesso) | Alto | Não existe endpoint agregado; requer liberação ou endpoint novo |
| 3. Taxa de participação (respostas/matriculados×100) | Depende de (2) | PARCIAL | A2/A4 | Médio | Viável quando (2) for resolvido |
| 4. Dashboard filtro por unidade/curso/modalidade/período | `/unidadecurso/listar` (A6) + endpoints de aluno (A2/A4) | PARCIAL | A6 para estrutura; A2/A4 para alunos | Médio | Estrutura de cursos/unidades/modalidades disponível para A6 |
| 5. Avaliação por professor/disciplina (eixo 3 dim. 2) | `4.09`–`4.11` (docente→turma, A6) + `5.19` (aluno→professor, A2/A4) | PARCIAL | **A6 para docente/turma; A2/A4 para vínculo aluno→prof** | Médio | Identificação do professor viável com A6; vínculo com avaliador requer A2/A4 |
| 6. Professores duplicados (múltiplos vínculos) | `4.09`–`4.11` com DOC_CPF como chave estável | SIM | A6 | Baixo | CPF + TUR_FACULDADE resolvem identificação |
| 7. Lista de destinatários/e-mails para mala direta | Nenhum endpoint dedicado | NÃO | A2/A4 (e-mails nos campos de retorno) | Alto | Sem endpoint de lista de destinatários; verificar LGPD |

---

## 11. Lacunas e Perguntas para o CETIC

1. **O perfil A6 CPA pode ser habilitado para acessar os endpoints de alunos e matrículas (`/lyceum/aluno/listar`, `/lyceum/matricula/listar`, `/lyceum/alunoview/listar`)?** Atualmente apenas A2/A3/A4 têm acesso. Sem isso, a taxa de participação não pode ser calculada automaticamente.

2. **Existe ou pode ser criado um endpoint de contagem agregada de alunos matriculados por curso, unidade e período?** Algo como `GET /lyceum/aluno/count/faculdade/{f}/ano/{ano}/semestre/{s}` ou similar, retornando COUNT agrupado.

3. **O endpoint `/lyceum/cadu/aluno/horarioaulas/faculdade/{faculdade}/ano/{ano}/semestre/{semestre}` pode ser habilitado para A6?** Esse endpoint retorna aluno + disciplina + turma + professor (`DOCEN_NUM_FUNC`, `DOCEN_NOME_COMPL`) e é essencial para montar o vínculo avaliador → professor.

4. **O CPF do professor (`DOC_CPF`) é retornado sem máscara para o perfil A6?** Na documentação o valor aparece como `634***`. Precisa ser confirmado se o valor real é entregue ou truncado na chamada de produção.

5. **Podemos armazenar o CPF do professor internamente no banco de dados do CPA?** Questão LGPD — confirmar com o DPO/CETIC se há base legal para armazenamento e qual o prazo de retenção.

6. **Existe endpoint para listar e-mails de discentes ou docentes por unidade/curso/perfil, para fins de convite à avaliação?** Não foi encontrado endpoint dedicado para listagem de destinatários.

7. **O CPA pode enviar e-mails de convite diretamente aos avaliadores (discentes e docentes), ou o disparo deve sempre passar pelo sistema institucional/CETIC?** Confirmar fluxo operacional e permissões de uso dos e-mails da API.

8. **Há rate limiting nas chamadas à API?** Os endpoints de aluno retornam até 10.000 registros por chamada. Para paginação de 187.964 alunos seriam necessárias ~19 chamadas em sequência. Confirmar limites por minuto/hora e estratégia de paginação.

9. **Os tokens gerados em homologação funcionam exatamente da mesma forma que em produção?** A documentação é idêntica entre os dois ambientes para o perfil A6. Confirmar se os perfis e permissões são espelhados.

10. **O campo `TUR_SEMESTRE` usa o valor `80` em alguns retornos (observado em 4.09)?** Confirmar o mapeamento completo de semestres: 1 = 1º semestre, 2 = 2º semestre, 80 = ? (possivelmente semestre especial ou modular).

---

## 12. Decisão Recomendada

### O que já dá para implementar (perfil A6, sem permissões adicionais)

- **Dashboard de unidades e cursos com modalidade e município:** `GET /lyceum/unidadecurso/listar` (6.04) — disponível para A6. Filtrar por município (6.05) ou unidade (6.06).
- **Docentes por turma/disciplina/ano para avaliação por professor:** `GET /lyceum/docente/listar/turmas/ano/{ano}` (4.09) e variações (4.10, 4.11) — disponíveis para A6. Retornam CPF, nome, e-mail, titulação, turma, disciplina, curso, unidade, modalidade.
- **Identificação e deduplicação de professores:** usar `DOC_CPF` como chave primária e `TUR_FACULDADE` para diferenciar vínculos em unidades distintas.
- **Login e autenticação:** `POST /lyceum/login` — sem restrição.

### O que precisa de liberação de acesso

Solicitar ao CETIC inclusão do perfil A6 nos seguintes endpoints:
- `/lyceum/aluno/listar` e variações (A2/A4 → A6)
- `/lyceum/matricula/listar` e variações (A2/A4 → A6)
- `/lyceum/cadu/aluno/historico/faculdade/{faculdade}` (A2/A4 → A6)
- `/lyceum/cadu/aluno/horarioaulas/faculdade/{f}/ano/{ano}/semestre/{s}` (A2/A4 → A6)
- `/lyceum/curso/listar` (A1/A2/A3/A4 → A6)

### O que precisa de endpoint novo

- **Contagem agregada de matriculados por curso/unidade/período** — não existe; solicitar ao CETIC.
- **Lista de destinatários/e-mails por perfil/unidade/curso** — não encontrado; solicitar ao CETIC ou planejar envio via sistema institucional.

### O que deve ficar como fallback manual/snapshot

- **Notificação ao CETIC para divulgação de avaliação:** processo manual/e-mail enquanto não há API para isso.
- **Taxa de participação:** calcular no CPA com atualização periódica (snapshot) dos matriculados via planilha ou exportação do LYCEUM, até que o acesso aos endpoints de aluno seja liberado para A6.
- **Envio de mala direta:** manter como processo via CETIC enquanto questões de permissão e LGPD não forem resolvidas.

---

*Documento gerado com base em análise direta da documentação oficial da API LYCEUM em 12/05/2026.*
*Evidências coletadas em: https://homolog-api.uea.edu.br/lyceum/api/documentacao e https://api.uea.edu.br/lyceum/api/documentacao e /perfil/A6.*
