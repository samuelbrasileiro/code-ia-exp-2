# Plano de Desenvolvimento — Sistema de Gerenciamento de Alunos e Avaliações

## Contexto

Construir um sistema web de gerenciamento de alunos, turmas e avaliações. O sistema deve permitir CRUD de alunos, CRUD de turmas, lançamento de avaliações por turma com conceitos MANA/MPA/MA, persistência via JSON e envio de e-mail consolidado por aluno (máximo um por dia). Stack obrigatória: React + TypeScript (client), Node/Express + TypeScript (server), Cucumber + Gherkin (testes de aceitação).

---

## Estrutura de Diretórios Alvo

```
sistema/
  client/                    # Vite + React + TypeScript
    src/
      pages/                 # Alunos, Turmas, DetalheTurma
      components/            # Formulários, tabelas reutilizáveis
      services/              # Chamadas HTTP à API
      types/                 # Tipos compartilhados (Student, Class, etc.)
  server/                    # Node/Express + TypeScript
    src/
      routes/                # alunos.ts, turmas.ts, avaliacoes.ts, metas.ts
      services/              # StudentService, ClassService, AssessmentService, EmailService
      persistence/           # JsonRepository (leitura/escrita de JSON)
      scheduler/             # job de envio de e-mail diário
      types/                 # Interfaces de domínio
    data/                    # alunos.json, turmas.json, emailQueue.json
  tests/
    features/                # alunos.feature, turmas.feature, avaliacoes.feature, email.feature
    steps/                   # step definitions TypeScript
    support/                 # world.ts, hooks.ts (setup/teardown de dados de teste)
```

---

## Modelos de Domínio

```typescript
// Student
{ id: string; name: string; cpf: string; email: string }

// Goal (meta de avaliação — configurável no servidor)
{ id: string; name: string } // ex.: "Requisitos", "Testes", "Design"

// Assessment
{ studentId: string; goalId: string; concept: 'MANA' | 'MPA' | 'MA'; updatedAt: string }

// Class
{
  id: string; topic: string; year: number; semester: number;
  studentIds: string[];
  assessments: Assessment[];
}

// EmailQueueEntry
{ studentId: string; date: string; changes: { classId: string; goalId: string; concept: string }[]; sent: boolean }
```

---

## Fase 1 — Backend

### 1.1 Setup do Projeto Server
- Inicializar `sistema/server/` com `npm init`, TypeScript strict, `ts-node-dev`
- Dependências: `express`, `cors`, `node-cron`, `nodemailer`, `uuid`
- Dependências de dev: `typescript`, `@types/express`, `@types/node`, `@types/nodemailer`, `ts-node-dev`
- Arquivo `tsconfig.json` com `strict: true`, `noImplicitAny: true`
- Script `dev` (ts-node-dev) e `build` (tsc)

### 1.2 Camada de Persistência (`persistence/JsonRepository.ts`)
- Funções genéricas `readJson<T>(file)` e `writeJson<T>(file, data)`
- Arquivos iniciais em `data/`: `alunos.json []`, `turmas.json []`, `emailQueue.json []`
- Criação automática dos arquivos se não existirem

### 1.3 API de Alunos (`routes/alunos.ts` + `services/StudentService.ts`)
- `GET /api/alunos` — listar todos
- `POST /api/alunos` — criar (validar formato de CPF: `\d{3}\.\d{3}\.\d{3}-\d{2}`)
- `PUT /api/alunos/:id` — atualizar
- `DELETE /api/alunos/:id` — remover (verificar se não está matriculado em turma ativa)
- Erros semânticos: 400 para validação, 404 para não encontrado, 409 para CPF duplicado

### 1.4 API de Metas (`routes/metas.ts`)
- `GET /api/metas` — retornar lista de metas configuradas (inicialmente fixas: Requisitos, Testes, Design, Implementação)

### 1.5 API de Turmas (`routes/turmas.ts` + `services/ClassService.ts`)
- `GET /api/turmas` — listar todas
- `POST /api/turmas` — criar
- `GET /api/turmas/:id` — detalhes (join com alunos)
- `PUT /api/turmas/:id` — atualizar metadados
- `DELETE /api/turmas/:id` — remover
- `PUT /api/turmas/:id/alunos` — atualizar lista de alunos matriculados

### 1.6 API de Avaliações (`routes/avaliacoes.ts` + `services/AssessmentService.ts`)
- `GET /api/turmas/:id/avaliacoes` — avaliações da turma
- `PUT /api/turmas/:id/avaliacoes` — atualizar uma avaliação `{ studentId, goalId, concept }`
  - Registrar mudança no `emailQueue.json` (por aluno + data de hoje)
  - Se já houver entrada do aluno para hoje, apenas adicionar/sobrescrever o item na lista de mudanças

### 1.7 Serviço de E-mail (`services/EmailService.ts` + `scheduler/emailScheduler.ts`)
- `EmailService.sendDailyDigest(studentId, date)`: monta e-mail com todas as mudanças do dia em todas as turmas, envia via `nodemailer`
- Configuração SMTP via variáveis de ambiente (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`)
- `emailScheduler.ts`: job `node-cron` diário (ex.: 23h) que percorre entradas do `emailQueue.json` com `sent: false` e `date === hoje`, chama `EmailService` e marca `sent: true`
- Para desenvolvimento/teste: endpoint `POST /api/email/disparar` que executa o envio manualmente

---

## Fase 2 — Frontend

### 2.1 Setup do Projeto Client
- Inicializar `sistema/client/` com `npm create vite@latest -- --template react-ts`
- Dependências: `react-router-dom`, `axios`
- TypeScript strict; tipos compartilhados em `src/types/`
- Proxy Vite para `/api` apontando para `localhost:3001`

### 2.2 Roteamento e Layout (`src/App.tsx`)
- React Router com rotas:
  - `/alunos` — página de alunos
  - `/turmas` — lista de turmas
  - `/turmas/:id` — detalhe da turma (alunos + tabela de avaliações)
- Navegação lateral/topo simples com links

### 2.3 Serviço HTTP (`src/services/api.ts`)
- Instância axios com `baseURL: /api`
- Funções tipadas para cada endpoint do backend

### 2.4 Página de Alunos (`src/pages/Alunos.tsx`)
- Tabela listando todos os alunos (nome, CPF, e-mail)
- Botão "Novo Aluno" abre formulário (modal ou inline)
- Editar / excluir por linha
- Formulário valida CPF no formato `000.000.000-00` antes de submeter

### 2.5 Página de Turmas (`src/pages/Turmas.tsx`)
- Tabela com tópico, ano, semestre, número de alunos
- Botão "Nova Turma" abre formulário
- Link para detalhe de cada turma
- Editar / excluir por linha

### 2.6 Detalhe da Turma (`src/pages/DetalheTurma.tsx`)
- Exibe metadados da turma
- Seção de matrícula: selecionar alunos cadastrados para matricular/desmatricular
- Tabela de avaliações: linhas = alunos matriculados, colunas = metas
  - Cada célula: dropdown `MANA | MPA | MA | —` (vazio)
  - Alteração dispara `PUT /api/turmas/:id/avaliacoes` imediatamente (auto-save)
  - Feedback visual de sucesso/erro por célula

---

## Fase 3 — Testes de Aceitação

### 3.1 Setup Cucumber
- Diretório `sistema/tests/`
- Dependências: `@cucumber/cucumber`, `@types/node`, `ts-node`, `axios`
- Script `npm test` executando `cucumber-js` com suporte a TypeScript via `ts-node`
- `support/world.ts`: instância axios apontando para server de teste; `support/hooks.ts`: limpar arquivos JSON antes de cada cenário

### 3.2 Feature: Gerenciamento de Alunos (`features/alunos.feature`)
```gherkin
Funcionalidade: Gerenciamento de Alunos
  Cenário: Cadastrar um aluno com dados válidos
  Cenário: Rejeitar cadastro com CPF inválido
  Cenário: Editar nome de um aluno existente
  Cenário: Remover um aluno sem turmas
```

### 3.3 Feature: Gerenciamento de Turmas (`features/turmas.feature`)
```gherkin
Funcionalidade: Gerenciamento de Turmas
  Cenário: Criar uma turma e matricular alunos
  Cenário: Visualizar turma com seus alunos
  Cenário: Remover uma turma
```

### 3.4 Feature: Avaliações (`features/avaliacoes.feature`)
```gherkin
Funcionalidade: Avaliações por Turma
  Cenário: Lançar conceito MA para um aluno em uma meta
  Cenário: Alterar conceito de MPA para MANA
  Cenário: Visualizar tabela de avaliações da turma
```

### 3.5 Feature: E-mail (`features/email.feature`)
```gherkin
Funcionalidade: Notificação por E-mail
  Cenário: Gerar entrada na fila ao alterar avaliação
  Cenário: Consolidar múltiplas avaliações do mesmo dia em uma única entrada
  Cenário: Marcar entrada como enviada após disparo
```

---

## Verificação End-to-End

1. `cd sistema/server && npm run dev` — servidor na porta 3001
2. `cd sistema/client && npm run dev` — cliente na porta 5173
3. Fluxo manual:
   - Cadastrar 2 alunos com CPF válido
   - Criar turma, matricular ambos
   - Lançar e alterar avaliações na tabela
   - Chamar `POST /api/email/disparar` e verificar log/envio
4. `cd sistema/tests && npm test` — todos os cenários Cucumber devem passar
5. `cd sistema/server && npm run build` e `cd sistema/client && npm run build` — sem erros TypeScript

---

## Ordem de Implementação (commits)

| # | Ação | Mensagem de Commit |
|---|------|--------------------|
| 1 | Setup server (tsconfig, express, estrutura) | `chore: inicializa projeto server` |
| 2 | Persistência JSON genérica | `feat: camada de persistência JSON` |
| 3 | CRUD alunos (API + validação CPF) | `feat: API de gerenciamento de alunos` |
| 4 | API de metas (fixas) | `feat: endpoint de metas de avaliação` |
| 5 | CRUD turmas + matrícula de alunos | `feat: API de gerenciamento de turmas` |
| 6 | API de avaliações + fila de e-mail | `feat: API de avaliações e fila de notificação` |
| 7 | Serviço de e-mail + agendador diário | `feat: serviço de e-mail e scheduler diário` |
| 8 | Setup client (Vite, Router, axios) | `chore: inicializa projeto client` |
| 9 | Página de alunos (CRUD) | `feat: página de gerenciamento de alunos` |
| 10 | Página de turmas (CRUD) | `feat: página de gerenciamento de turmas` |
| 11 | Detalhe da turma + tabela de avaliações | `feat: detalhe de turma com tabela de avaliações` |
| 12 | Setup Cucumber + hooks de teste | `chore: inicializa suite de testes de aceitação` |
| 13 | Cenários e steps: alunos | `test: testes de aceitação de alunos` |
| 14 | Cenários e steps: turmas | `test: testes de aceitação de turmas` |
| 15 | Cenários e steps: avaliações | `test: testes de aceitação de avaliações` |
| 16 | Cenários e steps: e-mail | `test: testes de aceitação de notificação por e-mail` |
