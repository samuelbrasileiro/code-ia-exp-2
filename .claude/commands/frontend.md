# Boas Práticas — Frontend React + TypeScript

Você está revisando ou implementando código no cliente React + TypeScript do sistema de gerenciamento de alunos e avaliações (`sistema/client/`). Aplique as práticas abaixo em tudo que tocar.

## Estrutura de Arquivos

```
client/src/
  pages/          # uma pasta por página (Alunos, Turmas, Avaliações)
  components/     # componentes reutilizáveis entre páginas
  services/       # funções de acesso à API REST (fetch/axios)
  types/          # interfaces e tipos compartilhados
  hooks/          # custom hooks (ex: useAlunos, useTurmas)
```

Cada página tem seu próprio diretório. Componentes usados em mais de uma página vivem em `components/`.

## TypeScript

- `strict: true` sempre habilitado — sem `any` implícito nem explícito
- Defina interfaces para todos os dados do domínio em `types/`:
  - `Aluno { id, nome, cpf, email }`
  - `Turma { id, topico, ano, semestre, alunosIds }`
  - `Avaliacao { alunoId, turmaId, meta, conceito: 'MANA' | 'MPA' | 'MA' }`
- Use union types para conceitos: `type Conceito = 'MANA' | 'MPA' | 'MA'`
- Prefira `interface` para formas de objetos, `type` para unions e aliases

## Componentes

- Funcionais com hooks — sem class components
- Um componente por arquivo, nome igual ao arquivo (`AlunoForm.tsx`)
- Props tipadas com interface local ou importada: `interface Props { aluno: Aluno; onSave: (a: Aluno) => void }`
- Separe lógica de dados (em hooks/services) da lógica de renderização
- Mantenha componentes pequenos: se passar de ~150 linhas, extraia sub-componentes

## Gerenciamento de Estado e Dados

- Use `useState` + `useEffect` para dados locais; evite libs externas sem justificativa
- Encapsule chamadas à API em custom hooks (`useAlunos`, `useTurmas`, `useAvaliacoes`)
- O hook retorna `{ data, loading, error, refetch }` — o componente não faz fetch direto
- Trate estados de carregamento e erro explicitamente na UI (ex: spinner, mensagem de erro)

## Formulários e Validação

- Valide CPF no frontend antes de submeter (formato `###.###.###-##`)
- Valide e-mail com regex simples antes de submeter
- Desabilite o botão de submit enquanto o form está inválido ou carregando
- Mostre erros inline (ao lado do campo), não só em alert

## Tabela de Avaliações

- A tabela mostra alunos nas linhas e metas nas colunas
- Células editáveis via `<select>` com as opções `MANA`, `MPA`, `MA` e opção vazia (sem avaliação)
- Ao alterar uma célula, dispare o PUT/POST imediatamente (sem botão "salvar tabela")
- Mostre feedback visual (ex: borda verde por 1s) ao salvar com sucesso

## Roteamento

- Use React Router com rotas nomeadas:
  - `/alunos` — listagem e CRUD de alunos
  - `/turmas` — listagem e CRUD de turmas
  - `/turmas/:id` — turma individual com sua tabela de avaliações
- Navegação via `<Link>` e `useNavigate`, nunca `window.location`

## Qualidade

- Sem `console.log` em código commitado
- Sem CSS inline; use classes (CSS Modules ou Tailwind, conforme projeto)
- Extraia strings de texto para constantes se usadas em mais de um lugar
- Após cada implementação, rode `/simplify` para revisar qualidade
