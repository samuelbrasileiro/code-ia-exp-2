# CLAUDE.md — Sistema de Gerenciamento de Alunos e Avaliações

## Contexto do Projeto

O objetivo é construir um sistema web de gerenciamento de alunos e avaliações.

O repositório final deve conter:
- `sistema/` — código-fonte completo e testes

## Sistema a Construir

### Funcionalidades Obrigatórias

1. **Gerenciamento de Alunos** — CRUD completo (nome, CPF, email), página dedicada com listagem
2. **Gerenciamento de Avaliações** — tabela com alunos nas linhas e metas nas colunas; conceitos: `MANA`, `MPA`, `MA`
3. **Persistência** — via arquivos JSON no servidor
4. **Gerenciamento de Turmas** — CRUD de turmas (tópico, ano, semestre, alunos matriculados, avaliações por turma); visualização individual por turma
5. **Envio de E-mail** — ao preencher/alterar avaliação de um aluno, enviar no máximo **um e-mail por dia** consolidando todas as avaliações modificadas naquele dia, em todas as turmas do aluno

### Conceitos de Domínio

| Código | Significado |
|--------|-------------|
| `MANA` | Meta Ainda Não Atingida |
| `MPA`  | Meta Parcialmente Atingida |
| `MA`   | Meta Atingida |

## Stack Tecnológica

- **Frontend**: React + TypeScript (pasta `sistema/client/`)
- **Backend**: Node.js + TypeScript (pasta `sistema/server/`)
- **Testes de Aceitação**: Cucumber + Gherkin (cenários em `.feature`, steps em TypeScript)
- **Persistência**: arquivos JSON locais no servidor

Toda adição de dependência deve ser justificada. Prefira bibliotecas com manutenção ativa e tipagem nativa em TypeScript.

## Arquitetura

```
sistema/
  client/          # React + TypeScript (Vite)
  server/          # Node/Express + TypeScript
    data/          # arquivos JSON de persistência
  tests/
    features/      # arquivos .feature (Gherkin)
    steps/         # step definitions em TypeScript
```

O servidor expõe uma API REST consumida pelo cliente React. Não misture lógica de negócio com lógica de rota.

## Padrões de Código

- TypeScript strict mode habilitado em ambos os projetos
- Sem `any` implícito
- Componentes React funcionais com hooks
- Validação de entrada apenas nas bordas do sistema (API e formulários)
- Sem comentários que descrevam o óbvio; comente apenas invariantes não-evidentes

## Fluxo de Desenvolvimento com o Agente

Para cada ação:

1. Verifique se o sistema **compila e funciona**
2. **Revise** o diff: corretude, modularidade, legibilidade, segurança

## Skills Disponíveis e Quando Usar

Estas skills devem ser acionadas proativamente:

| Situação | Skill a usar |
|----------|-------------|
| Após implementar uma funcionalidade | `/simplify` — revisa qualidade, reuso e eficiência do código alterado |
| Ao escrever ou revisar testes de aceitação | `/acceptance-tests` — boas práticas com Cucumber + Gherkin |
| Ao implementar ou revisar código de backend | `/backend` — boas práticas Node.js + TypeScript |
| Ao implementar ou revisar código de frontend | `/frontend` — boas práticas React + TypeScript |
| Antes de fazer merge de uma funcionalidade | `/review` — revisão completa do pull request |
| Antes de fazer merge com mudanças sensíveis | `/security-review` — revisão de segurança das alterações pendentes |

## Regras Críticas de Negócio

- O e-mail diário consolidado deve ser gerado **server-side** via job agendado ou no momento da modificação, com deduplicação por data
- Avaliações são **por turma**: o mesmo aluno pode ter conceitos diferentes em turmas diferentes
- CPF deve ser validado quanto ao formato antes de salvar
- A tabela de avaliações deve refletir o estado atual em tempo real ao carregar a página

## Qualidade Esperada

O sistema final deve estar no mesmo padrão de qualidade de um sistema produzido sem agentes. Isso inclui:

- Testes de aceitação (Cucumber) cobrindo os cenários principais de cada funcionalidade
- API REST com respostas de erro semânticas (status HTTP corretos)
- Interface utilizável e sem erros visuais óbvios

## Git

- Um commit por ação aceita do agente
- Mensagens de commit em português, descritivas do "porquê"
- Branch principal: `main`
- Código e testes em `sistema/`; documentos de processo na raiz
