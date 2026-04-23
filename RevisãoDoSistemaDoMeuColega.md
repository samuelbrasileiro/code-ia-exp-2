# Revisão do Sistema do Colega

**Autor da revisão:** Samuel Brasileiro dos Santos Neto
**Autor do sistema:** Alisson Gabriel Assunção de Oliveira  
**Data:** 22/04/2026

## Revisão do Sistema

### 1. O sistema está funcionando com as funcionalidades solicitadas?

O sistema implementa todas as cinco funcionalidades obrigatórias do enunciado:

| Funcionalidade | Status |
|---|---|
| CRUD de alunos (nome, CPF, e-mail) com página de listagem | Completo |
| Tabela de avaliações por meta (MANA/MPA/MA) | Completo |
| Persistência via arquivos JSON | Completo |
| CRUD de turmas com alunos matriculados e avaliações por turma | Completo |
| E-mail diário consolidado (máximo um por dia por aluno) | Completo |

#### Pontos de destaque:

- A lógica de envio de e-mail foi implementada no backend de maneira bem organizada: ao registrar a primeira mudança de avaliação do dia, cria um e-mail pendente; mudanças subsequentes do mesmo dia agregam-se ao mesmo e-mail. Se um e-mail já foi despachado naquele dia, a próxima mudança agenda automaticamente para o dia seguinte, um detalhe sutil do requisito que foi tratado com cuidado.
- Os testes são bem completos.
- A página de detalhes da turma exibe a tabela de avaliações daquela turma de forma independente das demais.
- O backend segue a hierarquia rotas -> controllers -> services -> repositories de forma consistente. A lógica de negócio está em serviços, não em rotas; os repositórios são a única camada que toca os arquivos JSON. Isso torna o código fácil de navegar e de testar.

#### Problemas e oportunidades de melhoria

- Quando cria uma nova meta, aparece uma tabela para adicionar notas aos alunos. Essa tabela ficou meio solta, porque é independente, não afeta as tabelas das avaliações de turma, como uma avaliação global.

- O serviço verifica apenas se o CPF tem 11 dígitos após remover não-numéricos, mas não valida se é um cpf valido, assim, CPFs como `00000000000` ou `12345678901` passam na validação, uma inconsistência em sistemas reais. Além disso, essa verificação de 11 digitos é feita somente depois de chamar API. Ela poderia ser feita real-time para melhorar a experiência.

- Em um servidor Node com múltiplas requisições concorrentes tocando o mesmo arquivo JSON, duas requisições podem ler o mesmo estado, modificar separadamente, e a segunda sobrescrever a primeira. Uma fila de operações por arquivo ou um lock simples resolveria.

- Arquivo que nunca é usado `ComingSoonPage.tsx`.

### 3. Comparação com o meu sistema

- Os dois sistemas implementam as cinco funcionalidades requisitadas.

- O sistema de Alisson tem uma cobertura de testes Cucumber muito maior — 490 linhas de cenários versus 100 linhas no meu. A diferença reflete uma abordagem mais sistemática de especificação comportamental.

- O sistema de Alisson tem uma separação de camadas mais rígida e explícita, a divisão routes, controllers, repositories é mais limpa do que a mistura routes+services que adotei, talvez o skill que construí poderia ter sido focado em uma arquitetura mais organizada e clean.

- O tratamento de erros centralizado via classes de erro e middleware é também mais robusto do que minha abordagem.

- Os dois usam React + TypeScript + Vite. O sistema de Alisson usa Radix UI + Tailwind para os componentes, ficando uma interface mais polida. Meu sistema usa componentes mais simples sem uma biblioteca de UI.

- Os dois sistemas implementam a consolidação diária e o "próximo dia" se o e-mail do dia já foi despachado, apesar de que a de alisson é mais separada porque eu adicionei um botão para enviar manualmente se o usuário desejar, principalmente para facilitar os testes.


## Revisão do Histórico do Experimento

Alisson usou Claude Opus 4.7 via Claude Code.

### 1. Estratégias de interação utilizadas

A estratégia foi incremental por funcionalidade, com um investimento inicial relevante em configuração do agente antes de escrever qualquer código de produto. A sequência foi: gerar CLAUDE.md -> adicionar skills -> criar scaffold -> implementar alunos -> avaliações -> turmas -> e-mail -> refinar frontend -> documentação.

O primeiro prompt foi inteiramente dedicado a gerar o CLAUDE.md, com contexto detalhado de stack, estrutura de pastas e escopo. Acho que é uma boa prática porque o agente recebe instruções persistentes antes de tocar no código. Ele fez um esquema de interação feature by feature com a IA.

### 2. Situações em que o agente funcionou melhor ou pior

Funcionou bem:
- Geração do CLAUDE.md com estrutura de pastas e responsabilidades detalhadas. O agente produziu um documento bem organizado a partir de um prompt com muito contexto.
- Implementação do módulo de turmas, o agente criou os endpoints com a lógica correta para matrícula e remoção de alunos sem precisar de correções.
- Retomada de trabalho interrompido ("Continue de onde você parou") — o agente conseguiu continuar a implementação do frontend de alunos após a interrupção pelo limite diário.

Funcionou com limitações:
- Quando pedido para adicionar skills ao CLAUDE.md sem indicar onde encontrá-las, o agente inventou skills aleatórias em vez de procurar no skills lock. Foi necessário um segundo prompt especificando o arquivo e o caminho exato para obter o resultado correto.
- Módulo de alunos (primeira feature grande): Avaliado como "Resposta péssima". O agente criou endpoints genéricos sem sistema de roteamento, sem estilização e sem organização modular do frontend. Além disso, nomeou variáveis com apenas a primeira letra da palavra de domínio. Alisson registrou frustração com o resultado, especialmente por estar usando o Opus.
- O prompt de refatoração do frontend atingiu o limite diário do Claude Opus 4.7, interrompendo a execução no meio. O resultado parcial foi de baixa qualidade.
- O job agendado foi criado, mas disparava e-mails todos os dias ao final do expediente independentemente de haver mudanças, em vez de disparar apenas quando existissem e-mails pendentes. Além disso, não implementou nenhum esquema SMTP real.
- Para resolver um conflito de tipo em duas linhas o agente levou 5 minutos e consumiu muito mais tokens do que o necessário para uma correção trivial.

### 3. Tipos de problemas observados

- Alucinação Quando não encontra o que precisa no contexto, o agente inventa (skills aleatórias no CLAUDE.md) em vez de indicar que não encontrou.
- Configuração desatualizada: O agente precisou de uma busca na internet para encontrar a configuração correta.
- Endpoints desnecessários: Em dois módulos distintos, o agente criou endpoints que não eram utilizados por nenhuma parte do sistema.
- Nomeação de variáveis ruim: Abreviações de uma letra (s, c, a) em lugar dos nomes completos do domínio, prejudicando a legibilidade.
- Bug na lógica de negócios: O job de e-mail implementado disparava incondicionalmente, sem verificar se havia e-mails pendentes. O código funcionava sem erros mas o comportamento estava errado.
- Resíduo de iteração: ComingSoonPage.tsx criado como placeholder e nunca removido.

### 4. Avaliação geral da utilidade do agente no desenvolvimento

O agente foi produtivo nos passos estruturais do desenvolvimento — geração de CLAUDE.md, scaffold, testes Gherkin e boilerplate de controllers/repositories. Onde ele se mostrou menos confiável foi em regras de negócio sutis (lógica do job de e-mail), e convenções de código (nomes de variáveis) e de ambiente.

O resultado final é um sistema funcional e bem arquitetado, o que demonstra que o agente foi realmente um multiplicador de produtividade real. Porém, a planilha registra vários momentos de frustração ("estou muito frustrado", "resposta péssima"), indicando que o custo cognitivo de revisar, corrigir e redirecionar o agente foi alto em algumas features.

O ganho de produtividade existe, mas não é incondicional, depende do esforço do desenvolvedor em guiar e revisar o agente a cada passo.

### 5. Comparação com a minha experiência de uso do agente

Nós dois usamos Claude Code com CLAUDE.md como instrução persistente. Ele usou a abordagem feature by feature e fiz stack by stack.

Eu fiz todos os prompts em português, resultando em um código também portugues-based. Não senti que a performance/qualidade foi diminuída por tal fato.

Alisson usou Claude Opus 4.7, eu usei Claude Sonnet 4.6. Interessante que a planilha dele registra mais momentos de insatisfação do que eu experienciei com o Sonnet o modelo mais avançado não necessariamente entrega melhores resultados em todas as situações, e tem o gasto bem maior de tokens. Pela experiência e comparação com a minha, eu manteria utilizando o Sonnet 4.6.

O problema de lógica de negócio incorreta no job de e-mail (disparar incondicionalmente) é parecido com as situações que tambem lidei: o agente entende o requisito de forma literal e incompleta quando a regra tem uma condição implícita que o desenvolvedor considera óbvia mas não está tão explícita no prompt. 

Então acho que aprendemos a lição: quanto mais específico o prompt sobre a condição de negócio, menor a chance de o agente gerar código funcionalmente plausível mas comportamentalmente errado. Mas cuidado que um prompt com muita coisa pode também ignorar alguns requisitos. No fim, saber equilibrar.
