Feature: Gerenciamento de Alunos

  Scenario: Cadastrar aluno com dados válidos
    Given que não existe aluno com CPF "123.456.789-09"
    When o professor cadastra um aluno com nome "Ana Lima", CPF "123.456.789-09" e email "ana@email.com"
    Then o aluno "Ana Lima" deve aparecer na lista de alunos

  Scenario: Rejeitar CPF inválido
    When o professor tenta cadastrar um aluno com CPF "000.000.000-00"
    Then o sistema deve retornar erro de validação

  Scenario: Rejeitar e-mail com formato inválido
    When o professor tenta cadastrar um aluno com email "nao-e-um-email"
    Then o sistema deve retornar erro de validação

  Scenario: Editar dados de aluno existente
    Given que existe um aluno com nome "Bruna Costa" e CPF "987.654.321-00"
    When o professor altera o nome de "Bruna Costa" para "Bruna Oliveira"
    Then o aluno "Bruna Oliveira" deve aparecer na lista de alunos
    And "Bruna Costa" não deve aparecer na lista de alunos

  Scenario: Remover aluno existente
    Given que existe um aluno com nome "João Silva" e CPF "111.444.777-35"
    When o professor remove o aluno "João Silva"
    Then "João Silva" não deve aparecer na lista de alunos

  Scenario: Listar todos os alunos cadastrados
    Given que existe um aluno com nome "Maria Santos" e CPF "529.982.247-25"
    When o professor consulta a lista de alunos
    Then o aluno "Maria Santos" deve aparecer na lista de alunos
