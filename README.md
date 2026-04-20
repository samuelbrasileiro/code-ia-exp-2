# Sistema de Gerenciamento de Alunos e Avaliações

**Acesse o sistema:** [sistema-gestao-alunos-frontend.onrender.com](https://sistema-gestao-alunos-frontend.onrender.com)
**API (backend):** [sistema-gestao-alunos.onrender.com](https://sistema-gestao-alunos.onrender.com)

> O plano gratuito do Render hiberna o serviço após inatividade — o primeiro acesso pode levar até 1 minuto para responder.

Sistema web para gerenciamento de alunos, turmas e avaliações pedagógicas, com envio automatizado de e-mails diários consolidados.

## Funcionalidades

- **Alunos** — CRUD completo com validação de CPF e e-mail
- **Turmas** — Criação e edição de turmas com matrícula de alunos
- **Avaliações** — Grade interativa por turma (alunos × metas) com conceitos `MANA`, `MPA` e `MA`
- **E-mails automáticos** — Resumo diário das avaliações alteradas, enviado ao aluno via job agendado às 23h

## Estrutura do Repositório

```
sistema/
  client/     # React + TypeScript (Vite)
  server/     # Node.js + Express + TypeScript
    data/     # Persistência em JSON
  tests/
    features/ # Cenários Gherkin (Cucumber)
    steps/    # Step definitions TypeScript
```

## Pré-requisitos

- Node.js ≥ 18
- npm ≥ 9

## Instalação

```bash
# Backend
cd sistema/server
npm install

# Frontend
cd sistema/client
npm install

# Testes
cd sistema/tests
npm install
```

## Configuração

Crie o arquivo `sistema/server/.env` com base no exemplo abaixo:

```env
PORT=3001
NODE_ENV=development

# SMTP para envio de e-mails
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=seu-usuario@email.com
EMAIL_PASS=sua-senha
EMAIL_FROM=sistema@seudominio.com

# Desabilita o job de e-mail (útil em dev/testes)
DISABLE_EMAIL_JOB=true
```

> Sem configuração de SMTP, o sistema funciona normalmente — apenas o envio de e-mails ficará inativo.

## Executando em Desenvolvimento

Inicie o backend e o frontend em terminais separados:

```bash
# Terminal 1 — Backend (porta 3001)
cd sistema/server
npm run dev

# Terminal 2 — Frontend (porta 5173)
cd sistema/client
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

O frontend em dev faz proxy automático de `/api` para `localhost:3001`.

## Build de Produção

O servidor serve o frontend como arquivos estáticos em produção.

```bash
cd sistema/server
npm run build   # compila cliente + servidor
npm start       # inicia em http://localhost:3001
```

## Executando os Testes

Os testes de aceitação (Cucumber) sobem um servidor isolado na porta 3002 com dados próprios.

```bash
cd sistema/tests
npm test           # executa todos os cenários
npm run test:wip   # executa apenas cenários marcados com @wip
```

> O script `pretest` compila o servidor automaticamente antes de rodar os testes.

## Uso do Web App

### Alunos

1. Acesse **Alunos** no menu superior
2. Clique em **Novo Aluno** e preencha nome, CPF (`000.000.000-00`) e e-mail
3. Use os botões de edição e exclusão na lista para gerenciar registros existentes

### Turmas

1. Acesse **Turmas** no menu superior
2. Clique em **Nova Turma** informando tópico, ano e semestre
3. Na página da turma, use **Matricular Aluno** para adicionar alunos à turma

### Avaliações

1. Acesse uma turma e visualize a grade de avaliações
2. Clique em qualquer célula para registrar ou alterar o conceito do aluno naquela meta
3. Os conceitos disponíveis são:
   - **MANA** — Meta Ainda Não Atingida
   - **MPA** — Meta Parcialmente Atingida
   - **MA** — Meta Atingida

### E-mails

- Ao salvar uma avaliação, a alteração é registrada na fila de e-mails do dia
- O job automático envia um e-mail consolidado para o aluno às **23h**
- É possível disparar os e-mails manualmente pela página da turma via **Enviar E-mails**

## API REST

Base URL: `http://localhost:3001/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/alunos` | Lista alunos |
| `POST` | `/alunos` | Cria aluno |
| `PUT` | `/alunos/:id` | Atualiza aluno |
| `DELETE` | `/alunos/:id` | Remove aluno |
| `GET` | `/turmas` | Lista turmas |
| `POST` | `/turmas` | Cria turma |
| `GET` | `/turmas/:id` | Detalhe da turma |
| `PUT` | `/turmas/:id` | Atualiza turma |
| `DELETE` | `/turmas/:id` | Remove turma |
| `PUT` | `/turmas/:id/alunos` | Atualiza matrículas |
| `GET` | `/turmas/:id/avaliacoes` | Lista avaliações |
| `PUT` | `/turmas/:id/avaliacoes` | Salva avaliações |
| `GET` | `/metas` | Lista metas |
| `GET` | `/email/status` | Status da fila de e-mails |
| `POST` | `/email/disparar` | Dispara e-mails pendentes |
| `GET` | `/health` | Health check |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, TypeScript, Vite, React Router, Axios |
| Backend | Node.js, Express 5, TypeScript, Nodemailer, node-cron |
| Persistência | Arquivos JSON locais |
| Testes | Cucumber.js, Chai |
