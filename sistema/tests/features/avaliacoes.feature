Feature: Avaliações

  Scenario: Preencher avaliação de aluno
    Given que "Carlos Souza" está matriculado na turma "Estruturas de Dados"
    When o professor define o conceito "MPA" para "Carlos Souza" na meta "Testes" da turma "Estruturas de Dados"
    Then a tabela da turma "Estruturas de Dados" deve exibir "MPA" para "Carlos Souza" na coluna "Testes"

  Scenario: Alterar avaliação existente
    Given que "Carlos Souza" está matriculado na turma "Estruturas de Dados"
    And "Carlos Souza" tem conceito "MANA" na meta "Testes" da turma "Estruturas de Dados"
    When o professor altera o conceito de "Carlos Souza" na meta "Testes" da turma "Estruturas de Dados" para "MA"
    Then a tabela da turma "Estruturas de Dados" deve exibir "MA" para "Carlos Souza" na coluna "Testes"

  Scenario: Rejeitar conceito inválido
    Given que "Carlos Souza" está matriculado na turma "Estruturas de Dados"
    When o professor tenta definir o conceito "INVALIDO" para "Carlos Souza" na meta "Testes" da turma "Estruturas de Dados"
    Then o sistema deve retornar erro de validação

  Scenario: Avaliações persistem após recarregar os dados
    Given que "Carlos Souza" está matriculado na turma "Estruturas de Dados"
    And "Carlos Souza" tem conceito "MA" na meta "Requisitos" da turma "Estruturas de Dados"
    When o professor acessa os dados da turma "Estruturas de Dados"
    Then a tabela da turma "Estruturas de Dados" deve exibir "MA" para "Carlos Souza" na coluna "Requisitos"
