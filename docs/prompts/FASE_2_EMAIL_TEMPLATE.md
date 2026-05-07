# Prompt de Implementação — Fase 2: E-mail Básico ao Enviar Avaliação CPA

---

## 1. Contexto

A **Fase 1** (ajustes visuais de nomenclatura no frontend) foi concluída.

As seguintes renomeações visuais já foram aplicadas:

- "Categorias" → "Categorias Acadêmicas"
- "Técnico" → "Técnico Administrativo"

Essas alterações foram **apenas visuais** (labels na UI) e **não alteraram** contratos de API, banco de dados, seeds, enums ou regras internas. As entidades do domínio continuam com os mesmos nomes no backend: `categorias`, `dimensoes`, `questoes` são entidades **distintas** no sistema.

A **Fase 2** adiciona exclusivamente um passo pós-envio de avaliação: após o admin clicar em **Enviar Avaliação** e o backend processar o envio com sucesso, o sistema deve retornar um template de e-mail institucional pronto para ser copiado e enviado manualmente pelo admin.

**Nenhum e-mail é enviado automaticamente nesta fase.**

---

## 2. Objetivo

- Gerar no backend um objeto `emailTemplate` com `subject`, `body` e `systemUrl` ao enviar uma avaliação.
- Retornar esse objeto junto com a resposta atual do endpoint `PUT /api/avaliacoes/:id/enviar`.
- Exibir no frontend um modal após o envio bem-sucedido, mostrando assunto, corpo e link.
- Permitir ao admin copiar o conteúdo do template com um clique.
- **Não enviar e-mail real nesta fase.**

---

## 3. Estado atual encontrado no código

### Fluxo de envio — Backend

| Camada        | Arquivo                                           | O que faz                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rota          | `backend/src/routes/avaliacoesRouter.ts`          | Registra `PUT /api/avaliacoes/:id/enviar` com autenticação e autorização (`admin`)                                                                                                                                             |
| Controller    | `backend/src/controllers/avaliacoesController.ts` | Função `enviarAvaliacao`: chama `avaliacoesService.switchStatus(id, 2)` e retorna `{ message, avaliacao }`                                                                                                                     |
| Service       | `backend/src/services/avaliacoesService.ts`       | Método `switchStatus(id, newStatus)` — muda o status da avaliação no banco, retorna `AvaliacaoResponseDTO`                                                                                                                     |
| Config de env | `backend/src/config/env.ts`                       | Usa Zod para validar env vars; variáveis existentes: `PORT`, `JWT_SECRET`, `LYCEUM_API_BASE_URL`, `ALLOWED_ORIGINS`, etc. **`APP_PUBLIC_URL` não existe ainda.**                                                               |
| DTO           | `backend/src/dtos/AvaliacaoDTO.ts`                | `AvaliacaoResponseDTO` possui: `id`, `periodo_letivo`, `data_inicio`, `data_fim`, `status`, `ano`, `titulo` (gerado no mapAvaliacao como `"Avaliação CPA - {periodo_letivo}"`), além de `unidade`, `categorias`, `modalidades` |

**Retorno atual do endpoint:**

```json
{
  "message": "Avaliação enviada com sucesso.",
  "avaliacao": { "id": 123, "status": 2, "periodo_letivo": "2025.1", ... }
}
```

### Fluxo de envio — Frontend

| Camada   | Arquivo                                                  | O que faz                                                                                                                                                              |
| -------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API      | `frontend/src/api/avaliacoes.js`                         | `enviarAvaliacao(id)` → `api.put('/avaliacoes/${id}/enviar')`                                                                                                          |
| Mutation | `frontend/src/hooks/mutations/useAvaliacaoMutations.jsx` | `useEnviarAvaliacaoMutation` — `onSuccess` invalida a query `['avaliacoes']` mas **não usa o dado retornado**                                                          |
| Tabela   | `frontend/src/components/Tables/Table_Avaliacao.jsx`     | `handleEnviarConfirm` chama `enviarMutation.mutate(avaliacaoAlvo.id, { onSuccess, onError })` — no `onSuccess` apenas exibe notificação e fecha o modal de confirmação |

**Modais existentes disponíveis para reaproveitamento:**

- `frontend/src/components/Modals/Modal_Avaliacoes.jsx` — modal de criação/edição de avaliação (não reaproveitar para este fim)
- `frontend/src/components/utils/ConfirmDeleteModal.jsx` — modal genérico de confirmação (botão confirmar/cancelar)
- Padrão dos outros modais: componentes funcionais React com `show`/`onHide` props, usando `Modal` do `react-bootstrap`

**Não existe helper de clipboard dedicado no projeto.** Usar `navigator.clipboard.writeText()` nativamente.

### Testes existentes

- `backend/tests/unit/avaliacoesService.test.ts` — testa `create`, `hasUserResponded` e `getById`. **`switchStatus` não tem teste unitário ainda.**
- `backend/tests/factories/index.ts` — factory `createTestAvaliacao()` disponível
- `backend/tests/setup.ts` — setup do Jest com Prisma mock

---

## 4. O que deve ser implementado no backend

### 4.1 Adicionar `APP_PUBLIC_URL` ao env/config

Em `backend/src/config/env.ts`, adicionar ao schema Zod:

```typescript
APP_PUBLIC_URL: z.string().url().optional(),
```

E exportar no objeto `env` com fallback seguro apenas para desenvolvimento:

```typescript
APP_PUBLIC_URL: parsed.data.APP_PUBLIC_URL ||
  (parsed.data.NODE_ENV !== 'production' ? 'http://localhost:5173' : undefined),
```

> **Atenção:** O fallback `'http://localhost:5173'` deve ser usado **apenas em desenvolvimento**. Em produção, se `APP_PUBLIC_URL` não estiver definida, **não** gerar placeholder para o usuário final. Registre o erro tecnicamente (ex: `console.error`/logger) e retorne `emailTemplate: null`, mantendo o envio da avaliação bem-sucedido.

Documentar no `.env.example` (ou equivalente no projeto):

```
# URL pública do sistema — obrigatória em produção
APP_PUBLIC_URL=https://cpa.uea.edu.br
```

### 4.2 Criar helper de template de e-mail

Criar o arquivo `backend/src/utils/emailTemplateBuilder.ts`:

```typescript
import { env } from "../config/env";

export interface EmailTemplate {
  subject: string;
  body: string;
  systemUrl: string;
}

export function buildEnvioAvaliacaoEmailTemplate(avaliacao: {
  titulo?: string;
  periodo_letivo?: string;
  data_inicio?: Date | string;
  data_fim?: Date | string;
}): EmailTemplate {
  const systemUrl = env.APP_PUBLIC_URL;

  const periodoInfo = avaliacao.periodo_letivo
    ? `Período letivo: ${avaliacao.periodo_letivo}`
    : "";

  const fmt = (d?: Date | string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const vigenciaInfo =
    avaliacao.data_inicio && avaliacao.data_fim
      ? `Vigência: ${fmt(avaliacao.data_inicio)} a ${fmt(avaliacao.data_fim)}`
      : "";

  const body = [
    "Olá!",
    "",
    "Uma nova avaliação da Comissão Própria de Avaliação (CPA) está disponível para resposta.",
    periodoInfo,
    vigenciaInfo,
    "",
    `Acesse o sistema pelo link:\n${systemUrl}`,
    "",
    "Sua participação é muito importante para a melhoria da Universidade.",
    "",
    "Atenciosamente,",
    "Comissão Própria de Avaliação - CPA",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return {
    subject: "Nova avaliação CPA disponível",
    body,
    systemUrl,
  };
}
```

> **Regra de segurança:** `systemUrl` vem exclusivamente do env do backend. Nunca exposta como configurável pelo usuário.

> **Adaptação obrigatória:** O código acima é um exemplo de referência. Adapte imports, nomes, tipagens e padrão de tratamento de erro ao estilo real encontrado no projeto (ex: padrão de logging já existente em `errorMiddleware.ts` ou utils).

### 4.3 Alterar o controller `enviarAvaliacao`

Em `backend/src/controllers/avaliacoesController.ts`, importar o builder e incluir `emailTemplate` na resposta:

```typescript
import { buildEnvioAvaliacaoEmailTemplate } from "../utils/emailTemplateBuilder";

const enviarAvaliacao = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const avaliacao = await avaliacoesService.switchStatus(id, 2);

  let emailTemplate = null;
  try {
    emailTemplate = buildEnvioAvaliacaoEmailTemplate(avaliacao);
  } catch (templateError) {
    // falha na montagem do template não deve impedir a resposta de sucesso
    // logar para que o erro não passe silenciosamente em produção
    console.error(
      "[enviarAvaliacao] Falha ao gerar emailTemplate:",
      templateError,
    );
  }

  res.status(200).json({
    message: "Avaliação enviada com sucesso.",
    avaliacao,
    emailTemplate,
  });
});
```

**Regra crítica:** O bloco `try/catch` em torno do builder garante que uma falha na montagem do template **nunca quebre o envio** da avaliação. O envio é a operação principal; o template é acessório.

> Não alterar `switchStatus`, não alterar regras de status, não alterar validações existentes.

---

## 5. O que deve ser implementado no frontend

### 5.1 Atualizar a mutation `useEnviarAvaliacaoMutation`

Em `frontend/src/hooks/mutations/useAvaliacaoMutations.jsx`, a mutation precisa expor o dado retornado para que o chamador possa capturar `emailTemplate`. O padrão atual já permite isso via `onSuccess(data)` do TanStack Query — **não é necessário alterar a mutation**, apenas usar o `data` no `onSuccess` do `mutate()`.

### 5.2 Capturar `emailTemplate` em `Table_Avaliacao.jsx`

Em `frontend/src/components/Tables/Table_Avaliacao.jsx`:

1. Adicionar estado:

   ```jsx
   const [emailTemplate, setEmailTemplate] = useState(null);
   const [showEmailModal, setShowEmailModal] = useState(false);
   ```

2. Alterar `handleEnviarConfirm` para capturar `emailTemplate`:

   ```jsx
   const handleEnviarConfirm = async () => {
     enviarMutation.mutate(avaliacaoAlvo.id, {
       onSuccess: (data) => {
         showNotification("Avaliação enviada com sucesso!", "success");
         onSuccess?.("Avaliação enviada com sucesso!");
         setShowEnviar(false);
         // Confirmar o caminho real antes de finalizar — ver nota abaixo.
         const template = data?.emailTemplate ?? data?.data?.emailTemplate;
         if (template) {
           setEmailTemplate(template);
           setShowEmailModal(true);
         }
       },
       onError: (err) =>
         showNotification(
           err.response?.data?.message ||
             err.response?.data?.error ||
             "Erro ao enviar.",
           "error",
         ),
     });
   };
   ```

> **Atenção antes de finalizar:** Inspecione o valor real de `data` no `onSuccess` de uma mutation existente no projeto (ex: `useDeleteAvaliacaoMutation`) para confirmar se o TanStack Query repassa o `AxiosResponse` completo (body em `data.data`) ou apenas o body (`data`). Use o caminho correto encontrado. O padrão `data?.emailTemplate ?? data?.data?.emailTemplate` cobre ambos os casos como fallback seguro durante a implementação.

3. Renderizar o modal logo abaixo do modal de confirmação de envio:
   ```jsx
   <Modal_EmailTemplate
     show={showEmailModal}
     onHide={() => {
       setShowEmailModal(false);
       setEmailTemplate(null);
     }}
     emailTemplate={emailTemplate}
   />
   ```

### 5.3 Criar o modal `Modal_EmailTemplate.jsx`

Criar o arquivo `frontend/src/components/Modals/Modal_EmailTemplate.jsx`.

O modal deve:

- Receber props: `show`, `onHide`, `emailTemplate`
- Renderizar `emailTemplate.subject`, `emailTemplate.body` e `emailTemplate.systemUrl` em campos de leitura
- Oferecer botões para copiar cada campo individualmente usando `navigator.clipboard.writeText()`
- Exibir feedback visual (ex: texto "Copiado!" por 2 segundos) após cada cópia
- Tratar o caso `emailTemplate === null` sem quebrar: não renderizar nada ou não abrir
- Seguir o padrão visual dos outros modais do projeto (react-bootstrap `Modal`, CSS de `modalStyles.css` ou inline styles consistentes com o padrão do projeto)

Estrutura sugerida do modal:

```jsx
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const Modal_EmailTemplate = ({ show, onHide, emailTemplate }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!emailTemplate) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Template de E-mail — Divulgação da Avaliação</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Assunto */}
        {/* Corpo */}
        {/* Link do sistema */}
        {/* Botão copiar tudo */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Modal_EmailTemplate;
```

---

## 6. O que NÃO deve ser implementado

- **Não** enviar e-mail real.
- **Não** instalar ou configurar Nodemailer, SendGrid, Resend, ou qualquer provider SMTP.
- **Não** enviar solicitação ao CETIC.
- **Não** buscar lista de destinatários.
- **Não** exportar CSV de contatos.
- **Não** alterar o dashboard.
- **Não** alterar PDFBuilders.
- **Não** alterar matriculados.
- **Não** alterar professor/disciplina.
- **Não** alterar regras internas de `switchStatus` além do que está descrito.
- **Não** alterar o ciclo de vida completo da avaliação (ativar, encerrar, prorrogar).
- **Não** alterar autenticação/autorização.
- **Não** alterar outros endpoints além de `PUT /api/avaliacoes/:id/enviar`.
- **Não** criar tabela ou coluna nova no banco de dados.
- **Não** alterar o schema Prisma.

---

## 7. Passos sugeridos de implementação

1. **Inspecionar** `backend/src/services/avaliacoesService.ts` método `switchStatus` e `backend/src/controllers/avaliacoesController.ts` função `enviarAvaliacao` para confirmar o fluxo atual.
2. **Adicionar** `APP_PUBLIC_URL` ao schema Zod em `backend/src/config/env.ts`.
3. **Criar** `backend/src/utils/emailTemplateBuilder.ts` com a função `buildEnvioAvaliacaoEmailTemplate`.
4. **Alterar** `backend/src/controllers/avaliacoesController.ts`: importar builder, adicionar `try/catch` para gerar `emailTemplate`, incluir no retorno JSON sem remover campos existentes.
5. **Testar manualmente** o endpoint via curl ou Insomnia: `PUT /api/avaliacoes/:id/enviar` com avaliação em status rascunho (status 1). Confirmar que `emailTemplate` aparece no retorno.
6. **Adicionar estado** `emailTemplate` e `showEmailModal` em `Table_Avaliacao.jsx`.
7. **Alterar** `handleEnviarConfirm` para capturar `emailTemplate` no `onSuccess` — confirmar o caminho real (`data?.emailTemplate` ou `data?.data?.emailTemplate`) inspecionando uma mutation existente antes de finalizar.
8. **Criar** `frontend/src/components/Modals/Modal_EmailTemplate.jsx`.
9. **Importar e renderizar** o modal em `Table_Avaliacao.jsx`.
10. **Implementar** a cópia via `navigator.clipboard.writeText()` com feedback visual.
11. **Testar o fluxo completo**: enviar avaliação válida → modal aparece → copiar assunto/corpo → fechar modal → lista atualizada.
12. **Testar o caso sem `emailTemplate`**: se o campo vier `null` na resposta, o modal não deve abrir e o fluxo continua normalmente.
13. **Revisar o diff** para garantir que nenhuma alteração saiu do escopo descrito.

---

## 8. Critérios de aceite

- [ ] A avaliação continua mudando para status `2` (Enviada) normalmente após o envio.
- [ ] O endpoint `PUT /api/avaliacoes/:id/enviar` retorna `emailTemplate` com `subject`, `body` e `systemUrl`.
- [ ] Campos existentes (`message`, `avaliacao`) continuam presentes no retorno sem alteração.
- [ ] O modal de template aparece no frontend após envio bem-sucedido.
- [ ] O modal exibe assunto, corpo e link corretamente.
- [ ] Botão(ões) de copiar funcionam via clipboard.
- [ ] Feedback visual de "Copiado!" é exibido após a cópia.
- [ ] Se `emailTemplate` for `null` na resposta, o fluxo continua sem erro e o modal não abre.
- [ ] Nenhum e-mail real é enviado.
- [ ] Nenhuma dependência de SMTP/provider foi adicionada ao `package.json`.
- [ ] A variável `APP_PUBLIC_URL` usa fallback seguro se não definida em dev.
- [ ] Nenhuma fase futura foi implementada (sem SMTP, sem destinatários, sem CSV).

---

## 9. Estratégia de testes

### Testes manuais obrigatórios

1. Criar uma avaliação em status Rascunho (status 1).
2. Clicar em **Enviar Avaliação** na tabela de avaliações.
3. Confirmar o envio no modal de confirmação existente.
4. Verificar que o modal de template de e-mail aparece.
5. Confirmar que assunto, corpo e link estão corretos no modal.
6. Clicar nos botões de copiar e verificar o feedback visual "Copiado!".
7. Colar o conteúdo em um editor de texto e validar o texto.
8. Fechar o modal e verificar que a lista de avaliações atualiza com status `Enviada`.
9. Tentar enviar uma avaliação que já está com status `Enviada` ou superior — deve falhar com erro do backend (fluxo existente).

### Testes automatizados sugeridos

A estrutura de testes já existe em `backend/tests/`.

**Teste unitário** — criar `backend/tests/unit/emailTemplateBuilder.test.ts`:

- `buildEnvioAvaliacaoEmailTemplate` com dados completos → deve retornar `subject`, `body` com período e vigência, e `systemUrl`.
- `buildEnvioAvaliacaoEmailTemplate` com dados mínimos (sem `data_inicio`/`data_fim`) → não deve lançar exceção.
- `buildEnvioAvaliacaoEmailTemplate` com `periodo_letivo` undefined → não deve lançar exceção.

**Teste de integração** — adicionar caso em `backend/tests/integration/` (se existir pasta) ou em novo arquivo `avaliacoesEnviar.test.ts`:

- `PUT /api/avaliacoes/:id/enviar` com avaliação válida em rascunho → deve retornar 200, `avaliacao.status === 2`, e `emailTemplate` com os três campos.
- `emailTemplate.systemUrl` deve ser string não vazia.
- Campos `message` e `avaliacao` devem continuar presentes.

**Verificar estrutura de testes de integração** existente antes de criar novos arquivos. Usar o mesmo padrão encontrado em `backend/tests/`.

---

## 10. Cuidados importantes

- **Não acoplar** o envio da avaliação ao template. A falha no builder **não deve** impedir o retorno de sucesso ao frontend. O `try/catch` em torno do builder no controller é obrigatório.
- **Não alterar** a lógica de `switchStatus` em `avaliacoesService.ts`. A única mudança no service é zero — o template é gerado no controller.
- **Não remover** campos do retorno atual do endpoint (`message`, `avaliacao`).
- **Não usar URL hardcoded** no template. Sempre via `env.APP_PUBLIC_URL`.
- **Não expor** `APP_PUBLIC_URL` diretamente no frontend via variável de ambiente do Vite como dado sensível — o frontend deve receber a URL já embutida no `emailTemplate.systemUrl` vindo do backend.
- **Centralizar** o template em `emailTemplateBuilder.ts`. Não duplicar a lógica de montagem em outros lugares.
- **Garantir** que o modal de template não conflite com o modal de confirmação de envio. Os dois modais não devem aparecer simultaneamente: o modal de confirmação fecha antes do template abrir.
- **Confirmar** o caminho real do dado retornado pelo Axios (`response.data` vs `response.data.data`) antes de usar no `onSuccess`. O padrão Axios retorna o body em `response.data`.

---

## 11. Instrução final para o Claude Code

Implemente somente a Fase 2. Não avance para envio real de e-mail, configuração de SMTP, Nodemailer, lista de destinatários, solicitação ao CETIC, dashboard, matriculados, professor/disciplina, ou qualquer outro item de fases futuras.

Ao final da implementação, apresente:

1. **Resumo dos arquivos alterados** (caminho completo + o que foi feito em cada um).
2. **Como foi testado** (quais passos manuais foram realizados, se houver).
3. **Pontos pendentes** (ex: testes automatizados não implementados, variável de ambiente que o time precisará configurar em produção, etc.).
