# Prompt de Implementacao - Fase 1: Ajustes Visuais de Nomenclatura CPA

## 1. Contexto

O sistema CPA ja possui categorias/perfis usados por regras internas no backend e no frontend (filtros, payloads e comparacoes tecnicas). Nesta Fase 1, a mudanca e somente de exibicao visual.

Nao altere valores tecnicos nem contratos de API.

## 2. Objetivo

Implementar apenas ajustes visuais no frontend:

- exibir "Categorias Academicas" no lugar de "Categorias" em textos de UI onde fizer sentido;
- exibir "Tecnico Administrativo" no lugar de "Tecnico" apenas como texto de apresentacao, quando aplicavel;
- manter valores internos intactos (por exemplo: DISCENTE, DOCENTE, TECNICO, TÉCNICO, nomes vindos do backend).

## 3. Arquivos relevantes encontrados

Arquivos reais identificados no repositorio para esta fase:

- `frontend/src/components/utils/Sidebar.jsx`
- `frontend/src/pages/Categorias.jsx`
- `frontend/src/components/Tables/Table_Avaliacao.jsx`
- `frontend/src/components/Modals/Modal_Avaliacoes.jsx`
- `frontend/src/pages/RelatorioAvaliacao.jsx`
- `frontend/src/components/PDFBuilders/AvaliacaoPDFBuilder.js`

Arquivos adicionais para varredura de exibicao (somente se necessario):

- `frontend/src/components/Tables/Table_Categorias.jsx`
- `frontend/src/components/Modals/Modal_Categorias.jsx`
- `frontend/src/components/DrawerAvaliacaoDetalhes.jsx`
- `frontend/src/pages/Relatorios.jsx`

## 4. O que deve ser implementado

1. Fazer varredura controlada dos textos visuais relacionados a:

- Categorias / Categoria
- Tecnico / TÉCNICO / TECNICO (somente exibicao)

2. Criar, se fizer sentido, um helper/mapper centralizado de labels de exibicao no frontend (exemplo: util de display para categoria/perfil).

3. Aplicar o mapper somente na camada de apresentacao:

- menu/sidebar;
- titulos e subtitulos de paginas;
- headers de tabela;
- labels de cards/relatorios;
- builders de PDF.

4. Garantir consistencia visual entre:

- telas administrativas;
- relatorio da avaliacao;
- PDF da avaliacao.

5. Manter payloads e valores tecnicos sem alteracao.

## 5. O que NAO deve ser implementado

- Nao alterar backend.
- Nao alterar Prisma.
- Nao alterar seed.
- Nao alterar enums internos.
- Nao alterar nomes salvos no banco.
- Nao alterar regras de filtro por categoria.
- Nao alterar endpoints.
- Nao implementar nada da Fase 2 (e-mail/template/modal de envio de e-mail).
- Nao mexer em dashboard avancado, matriculados ou professor/disciplina.

## 6. Passos sugeridos de implementacao

1. Fazer busca global por termos relacionados no frontend.
2. Separar pontos de UI (texto) dos pontos de logica (comparacoes tecnicas).
3. Criar helper/mapper visual se houver repeticao de strings.
4. Aplicar mudancas nas telas principais da fase.
5. Aplicar mudancas no PDF da avaliacao.
6. Validar fluxos principais manualmente.
7. Confirmar que nenhum arquivo de backend foi alterado.

## 7. Criterios de aceite

- Menu admin exibe "Categorias Academicas".
- Tela de categorias exibe nomenclatura alinhada com "Categorias Academicas".
- Tabelas/modais/relatorios usam nomenclatura visual consistente.
- Quando houver exibicao de categoria/perfil tecnico na UI, usar "Tecnico Administrativo" apenas como label de exibicao.
- PDF de avaliacao usa nomenclatura atualizada quando aplicavel.
- Nenhum payload de API foi alterado.
- Nenhum arquivo de backend foi alterado.
- Criacao/edicao/envio de avaliacao continua funcionando.
- Filtros por categoria continuam funcionando sem regressao.

## 8. Estrategia de testes

### Testes manuais minimos

1. Abrir menu admin e verificar label "Categorias Academicas".
2. Acessar tela de categorias e validar titulo/subtitulo/placeholders afetados.
3. Criar avaliacao e editar avaliacao para garantir que fluxo permanece igual.
4. Verificar listagem de avaliacoes (headers/labels).
5. Abrir relatorio de avaliacao e conferir labels relacionados.
6. Exportar/gerar PDF da avaliacao e validar nomenclatura.
7. Confirmar que filtros continuam operando com valores tecnicos originais.
8. Confirmar que "Tecnico Administrativo" aparece apenas como texto de exibicao.

### Sugestao de testes automatizados (se viavel no projeto)

- Testes de componente para labels de exibicao (mapper/helper).
- Snapshot tests de componentes-chave com labels alterados.
- Teste de regressao simples para fluxo de criacao/edicao de avaliacao (sem mudanca de payload).

## 9. Cuidados importantes

- Nao fazer replace global cego.
- Nao alterar strings usadas como identificador tecnico.
- Cuidado com comparacoes tecnicas, por exemplo: `categoria === "TECNICO"`.
- Cuidado com dados vindos do backend: manter valor bruto e transformar apenas na renderizacao.
- Preferir mapper de exibicao em vez de mudar valor real.
- Antes de finalizar, revise o diff completo e confirme explicitamente que nenhum arquivo de backend, Prisma, seed, configuração de API ou regra de negócio foi alterado.
- Trate “Categoria” e “Categorias” caso a caso: altere para “Categoria Acadêmica” ou “Categorias Acadêmicas” apenas quando estiver se referindo ao domínio CPA de categorias acadêmicas.
- Se criar helper/mapper, prefira um arquivo centralizado em `frontend/src/utils/`, evitando duplicar lógica de exibição em vários componentes.

## 10. Instrucao final para o Claude Code

Implemente somente a Fase 1. Ao final, apresente um resumo dos arquivos alterados, o que foi validado e qualquer ponto que ficou pendente. Nao avance para a Fase 2.
