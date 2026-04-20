# Boas Práticas — Testes de Aceitação com Cucumber + Gherkin

Você está revisando ou escrevendo testes de aceitação do sistema de gerenciamento de alunos e avaliações (`sistema/tests/`). Aplique as práticas abaixo em tudo que tocar.

## Estrutura

```
tests/
  features/
    alunos.feature
    turmas.feature
    avaliacoes.feature
    email.feature
  steps/
    alunos.steps.ts
    turmas.steps.ts
    avaliacoes.steps.ts
    email.steps.ts
  support/
    world.ts      # contexto compartilhado entre steps
    hooks.ts      # Before/After: sobe servidor de teste, limpa dados JSON
```

## Escrita de Cenários Gherkin

Regras fundamentais:

- **Given** — estado inicial do sistema (pré-condição)
- **When** — ação do usuário/sistema
- **Then** — resultado observável esperado

Cada cenário deve ser independente: não dependa da ordem de execução nem de estado deixado por outro cenário.

### Cenários obrigatórios por funcionalidade

**Alunos**
```gherkin
Feature: Gerenciamento de Alunos

  Scenario: Cadastrar aluno com dados válidos
    Given que não existe aluno com CPF "123.456.789-09"
    When o professor cadastra um aluno com nome "Ana Lima", CPF "123.456.789-09" e email "ana@email.com"
    Then o aluno "Ana Lima" deve aparecer na lista de alunos

  Scenario: Rejeitar CPF inválido
    When o professor tenta cadastrar um aluno com CPF "000.000.000-00"
    Then o sistema deve retornar erro de validação

  Scenario: Remover aluno existente
    Given que existe um aluno com nome "João Silva"
    When o professor remove o aluno "João Silva"
    Then "João Silva" não deve aparecer na lista de alunos
```

**Turmas**
```gherkin
Feature: Gerenciamento de Turmas

  Scenario: Criar turma e matricular aluno
    Given que existe um aluno com nome "Maria Santos"
    When o professor cria a turma "Introdução a Programação" no ano 2024 semestre 1
    And matricula "Maria Santos" nessa turma
    Then a turma deve exibir "Maria Santos" na sua lista de alunos

  Scenario: Visualizar turma com avaliações
    Given que a turma "Algoritmos" tem aluno "Pedro Costa" com avaliação "MA" na meta "Requisitos"
    When o professor acessa a página da turma "Algoritmos"
    Then deve ver "Pedro Costa" com conceito "MA" na coluna "Requisitos"
```

**Avaliações**
```gherkin
Feature: Avaliações

  Scenario: Preencher avaliação de aluno
    Given que "Carlos Souza" está matriculado na turma "Estruturas de Dados"
    When o professor define o conceito "MPA" para "Carlos Souza" na meta "Testes"
    Then a tabela deve exibir "MPA" para "Carlos Souza" na coluna "Testes"

  Scenario: Alterar avaliação existente
    Given que "Carlos Souza" tem conceito "MANA" na meta "Testes" da turma "Estruturas de Dados"
    When o professor altera o conceito para "MA"
    Then a tabela deve exibir "MA" para "Carlos Souza" na coluna "Testes"
```

**E-mail**
```gherkin
Feature: Envio de e-mail consolidado

  Scenario: Enviar um único e-mail por dia com todas as avaliações modificadas
    Given que "Lucas Ferreira" está matriculado nas turmas "Redes" e "SO"
    When o professor altera a avaliação de "Lucas Ferreira" em "Redes" na meta "Requisitos" para "MA"
    And altera a avaliação de "Lucas Ferreira" em "SO" na meta "Testes" para "MPA"
    Then deve ser enviado exatamente 1 e-mail para "lucas@email.com" contendo ambas as alterações

  Scenario: Não enviar segundo e-mail no mesmo dia
    Given que já foi enviado um e-mail para "Lucas Ferreira" hoje
    When o professor altera outra avaliação de "Lucas Ferreira"
    Then não deve ser enviado novo e-mail para "lucas@email.com" nesse dia
```

## Steps TypeScript

- Cada step deve fazer exatamente o que o texto diz — sem efeitos colaterais ocultos
- Use o `World` para compartilhar contexto entre Given/When/Then do mesmo cenário
- Steps de setup (Given) chamam a API diretamente via HTTP ou service — não manipulam JSON diretamente
- Steps de verificação (Then) fazem assertions com `expect` do chai ou `assert` nativo

```typescript
// Exemplo de step bem escrito
Given('que não existe aluno com CPF {string}', async function (cpf: string) {
  const res = await fetch(`${BASE_URL}/alunos`);
  const alunos: Aluno[] = await res.json();
  const existe = alunos.some(a => a.cpf === cpf);
  if (existe) {
    await fetch(`${BASE_URL}/alunos/${alunos.find(a => a.cpf === cpf)!.id}`, { method: 'DELETE' });
  }
});
```

## Isolamento e Limpeza

- `Before`: limpa os arquivos JSON de dados de teste (nunca os de produção)
- `After`: nenhuma limpeza necessária se o `Before` já garante estado inicial
- Use arquivos JSON separados para testes: configure o servidor de teste com `DATA_DIR=tests/data`
- Nunca use dados fixos que dependam de IDs específicos — sempre crie via API e capture o ID retornado

## Cobertura Mínima Esperada

- CRUD completo de Alunos (criar, listar, editar, remover, validação CPF)
- CRUD completo de Turmas (criar, listar, editar, remover, matricular aluno)
- Avaliações: preencher, alterar, persistência entre recarregamentos
- E-mail: consolidação diária, deduplicação no mesmo dia

## Qualidade

- Nomes de cenários em português, descritivos do comportamento do usuário
- Sem `console.log` nos steps em código commitado
- Após escrever novos cenários, rode `npx cucumber-js` e confirme que todos passam antes de commitar
