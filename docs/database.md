# Estrutura do Banco de Dados (ER)

Este documento descreve o modelo relacional do sistema CPA com base no arquivo `backend/prisma/schema.prisma`.

## Diagrama ER

```mermaid
erDiagram
  Admin {
    int id PK
    string nome
    string email UK
  }

  Eixos {
    int numero PK
    string nome
  }

  Dimensoes {
    int numero PK
    string nome
    int numero_eixos FK
    date data_criacao
  }

  Questoes_tipo {
    int id PK
    string descricao
  }

  Padrao_resposta {
    int id PK
    string sigla
  }

  Alternativas {
    int id PK
    string descricao
    int id_padrao_resp FK
  }

  Questoes {
    int id PK
    string descricao
    boolean basica
    int id_padrao_resposta FK
    int id_questoes_tipo FK
    int numero_dimensoes FK
    boolean ativo
    boolean repetir_todas_disciplinas
  }

  QuestoesAdicionais {
    int id PK
    string descricao
    int questaoId FK
  }

  Modalidades {
    int id PK
    string mod_ensino UK
    string mod_oferta
    date data_criacao
    int num_questoes
  }

  Categorias {
    int id PK
    string nome
    date data_criacao
  }

  Municipios {
    int id PK
    string nome UK
    string UF
  }

  Unidades {
    int id PK
    string nome
    string sigla UK
    string municipio_vinculo
  }

  Cursos {
    int id PK
    string identificador_api_lyceum UK
    string nome
    string nivel
    int municipio_sede FK
    int id_unidades FK
    int id_modalidade FK
    boolean ativo
  }

  Avaliadores {
    string matricula PK
    string nome
    string cpf
    string email
    int id_cursos FK
  }

  Avaliacao {
    int id PK
    string ano
    string periodo_letivo
    date data_inicio
    date data_fim
    int status
  }

  Avaliacao_questoes {
    int id PK
    int id_questoes FK
    int id_avaliacao FK
  }

  Respostas {
    int id PK
    int id_avaliacao_questoes FK
    string resposta
    date data_resposta
    string avaliador_matricula
  }

  RespostasGrade {
    int id PK
    int id_avaliacao_questoes FK
    int adicionalId
    string resposta
    date data_resposta
    string avaliador_matricula
  }

  Questoes_modalidades {
    int id_modalidade_questao PK
    int id_questoes FK
    int id_modalidades FK
  }

  Questoes_categorias {
    int id_questoes_categorias PK
    int id_questoes FK
    int id_categorias FK
  }

  Questoes_alternativas {
    int id_questao_alternativa PK
    int id_alternativas FK
    int id_questoes FK
  }

  Dimensoes ||--o{ Questoes : "classifica"
  Eixos ||--o{ Dimensoes : "organiza"

  Questoes_tipo ||--o{ Questoes : "tipa"
  Padrao_resposta ||--o{ Questoes : "padrao"
  Padrao_resposta ||--o{ Alternativas : "oferece"

  Questoes ||--o{ QuestoesAdicionais : "possui"
  Questoes ||--o{ Questoes_modalidades : "aplica_em"
  Modalidades ||--o{ Questoes_modalidades : "agrupa"

  Questoes ||--o{ Questoes_categorias : "classifica_em"
  Categorias ||--o{ Questoes_categorias : "agrupa"

  Questoes ||--o{ Questoes_alternativas : "usa"
  Alternativas ||--o{ Questoes_alternativas : "disponibiliza"

  Municipios ||--o{ Cursos : "sedia"
  Unidades ||--o{ Cursos : "oferta"
  Modalidades ||--o{ Cursos : "modalidade"
  Cursos ||--o{ Avaliadores : "vincula"

  Questoes ||--o{ Avaliacao_questoes : "compoe"
  Avaliacao ||--o{ Avaliacao_questoes : "possui"

  Avaliacao_questoes ||--o{ Respostas : "recebe"
  Avaliacao_questoes ||--o{ RespostasGrade : "recebe_grade"
```

## Observacoes Importantes

- O Prisma possui tabelas anotadas com `@ignore`/`@@ignore`, que nao sao expostas no Prisma Client para operacoes tipadas.
- Relacoes muitos-para-muitos implicitas entre `Avaliacao` e outras entidades (`Cursos`, `Categorias`, `Questoes`, `Modalidades`, `Unidades`) sao materializadas em tabelas de juncao gerenciadas pelo Prisma no banco.
- O diagrama acima prioriza as entidades funcionais principais e as tabelas de juncao explicitamente declaradas no schema.

## Tabelas Ignoradas no Prisma Client

- `Avaliacao_avaliadores` (`@@ignore`)
- `Questoes_avaliadores` (`@@ignore`)
- Campos com `@ignore`, como relacoes auxiliares em `Questoes`, `Cursos` e `Avaliadores`
