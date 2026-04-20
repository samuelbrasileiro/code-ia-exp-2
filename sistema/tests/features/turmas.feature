Feature: Gerenciamento de Turmas

  Scenario: Criar turma com dados válidos
    When o professor cria a turma "Introdução a Programação" no ano 2024 semestre 1
    Then a turma "Introdução a Programação" deve aparecer na lista de turmas

  Scenario: Criar turma e matricular aluno
    Given que existe um aluno com nome "Maria Santos" e CPF "529.982.247-25"
    When o professor cria a turma "Estruturas de Dados" no ano 2024 semestre 2
    And matricula "Maria Santos" nessa turma
    Then a turma deve exibir "Maria Santos" na sua lista de alunos

  Scenario: Visualizar turma com avaliações
    Given que a turma "Algoritmos" tem o aluno "Pedro Costa" com avaliação "MA" na meta "Requisitos"
    When o professor acessa os dados da turma "Algoritmos"
    Then deve ver "Pedro Costa" com conceito "MA" na coluna "Requisitos"

  Scenario: Editar dados de uma turma
    Given que existe a turma "Banco de Dados" no ano 2024 semestre 1
    When o professor altera o tópico da turma "Banco de Dados" para "Banco de Dados Avançado"
    Then a turma "Banco de Dados Avançado" deve aparecer na lista de turmas

  Scenario: Remover turma existente
    Given que existe a turma "Redes" no ano 2024 semestre 1
    When o professor remove a turma "Redes"
    Then "Redes" não deve aparecer na lista de turmas
