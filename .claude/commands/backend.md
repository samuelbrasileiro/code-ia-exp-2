# Boas Práticas — Backend Node.js + TypeScript

Você está revisando ou implementando código no servidor Node + TypeScript do sistema de gerenciamento de alunos e avaliações (`sistema/server/`). Aplique as práticas abaixo em tudo que tocar.

## Estrutura de Arquivos

```
server/src/
  routes/         # definição de rotas Express (sem lógica de negócio)
  services/       # lógica de negócio (AlunoService, TurmaService, AvaliacaoService, EmailService)
  repositories/   # acesso aos arquivos JSON (AlunoRepository, TurmaRepository, etc.)
  types/          # interfaces compartilhadas de domínio
  jobs/           # jobs agendados (ex: emailDiario)
server/data/      # arquivos JSON de persistência (não commitar dados reais)
```

Nunca coloque lógica de negócio dentro de um handler de rota. A rota valida entrada, chama o service, devolve a resposta.

## TypeScript

- `strict: true` habilitado — sem `any` implícito
- Defina tipos de domínio em `types/index.ts`:
  - `Aluno`, `Turma`, `Avaliacao`, `Conceito = 'MANA' | 'MPA' | 'MA'`
- Tipagem explícita em `Request`/`Response` do Express quando necessário
- Use `zod` ou validação manual com mensagens de erro claras nos endpoints de entrada

## API REST

Convenções de resposta:

| Situação | Status |
|---|---|
| Criação bem-sucedida | `201 Created` + recurso criado |
| Leitura / atualização | `200 OK` + dados |
| Recurso não encontrado | `404 Not Found` + `{ error: string }` |
| Dados inválidos (CPF, email) | `422 Unprocessable Entity` + `{ error: string }` |
| Erro interno | `500 Internal Server Error` + `{ error: string }` |

- Rotas em kebab-case: `GET /alunos`, `GET /turmas/:id/avaliacoes`
- Não exponha stack traces em produção

## Persistência JSON

- Cada entidade tem seu próprio arquivo: `alunos.json`, `turmas.json`, `avaliacoes.json`
- O Repository é a única camada que lê/escreve arquivos
- Leituras e escritas síncronas (`fs.readFileSync` / `fs.writeFileSync`) são aceitáveis dado o volume esperado; envolva em try/catch
- Inicialize o arquivo com `[]` se não existir
- Gere IDs como UUIDs (`crypto.randomUUID()`) no momento da criação

## Validações de Domínio

- CPF: valide formato e dígitos verificadores antes de salvar
- E-mail: valide formato com regex
- Conceito: apenas `'MANA'`, `'MPA'`, `'MA'` são aceitos
- Rejeite CPF duplicado com `422` e mensagem descritiva

## E-mail Consolidado Diário

Regra de negócio crítica:

1. Ao salvar/alterar uma avaliação, registre em fila interna `pendingEmails[alunoId][data] = [avaliações modificadas]`
2. Um job agendado (ou verificação lazy no momento da modificação) envia **no máximo 1 e-mail por aluno por dia**
3. O e-mail consolida todas as avaliações modificadas naquele dia em todas as turmas do aluno
4. Persista o controle de e-mails enviados em `emailsEnviados.json` para sobreviver a reinicializações
5. Use `nodemailer` com SMTP configurável via variáveis de ambiente

## Separação de Responsabilidades

```
Rota → valida body → chama Service → Service chama Repository → retorna dado
```

- Services não importam Express
- Repositories não contêm regras de negócio
- Jobs importam apenas Services

## Qualidade

- Sem `console.log` em código commitado (use um logger simples ou remova)
- Trate todos os erros de I/O com try/catch e retorne status HTTP adequado
- Após cada implementação, rode `/simplify` para revisar qualidade
