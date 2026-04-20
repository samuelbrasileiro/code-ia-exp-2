Feature: Envio de e-mail consolidado

  Scenario: Registrar mudanças na fila ao alterar avaliações em múltiplas turmas
    Given que "Lucas Ferreira" está matriculado nas turmas "Redes" e "SO" com email "lucas@email.com"
    When o professor altera a avaliação de "Lucas Ferreira" em "Redes" na meta "Requisitos" para "MA"
    And o professor altera a avaliação de "Lucas Ferreira" em "SO" na meta "Testes" para "MPA"
    Then deve haver exatamente 1 entrada na fila de email para "Lucas Ferreira" hoje
    And essa entrada deve conter 2 mudanças

  Scenario: Não criar segunda entrada na fila no mesmo dia
    Given que "Lucas Ferreira" está matriculado na turma "Redes" com email "lucas@email.com"
    And já existe uma entrada na fila de email marcada como enviada para "Lucas Ferreira" hoje
    When o professor altera a avaliação de "Lucas Ferreira" em "Redes" na meta "Testes" para "MA"
    Then deve haver exatamente 1 entrada na fila de email para "Lucas Ferreira" hoje

  Scenario: Atualizar mudança existente na fila ao reeditar a mesma meta
    Given que "Lucas Ferreira" está matriculado na turma "Redes" com email "lucas@email.com"
    When o professor altera a avaliação de "Lucas Ferreira" em "Redes" na meta "Requisitos" para "MANA"
    And o professor altera a avaliação de "Lucas Ferreira" em "Redes" na meta "Requisitos" para "MA"
    Then deve haver exatamente 1 entrada na fila de email para "Lucas Ferreira" hoje
    And essa entrada deve conter 1 mudança
