# UI Redesign — Design Moderno e Coerente

Você vai refatorar o estilo visual do cliente React em `sistema/client/src/index.css` (e qualquer CSS Module existente). O objetivo é um design limpo, inovador e com personalidade — não um template genérico.

## Fase 1: Audit Visual

Antes de escrever qualquer CSS, leia todos os arquivos de estilo existentes e anote:
- Quais classes CSS estão sendo usadas nos componentes (grep em `src/`)
- Quais variáveis CSS já existem em `:root`
- O que está visualmente quebrado ou sem polimento (espaçamentos, cores, tipografia, contraste)

## Fase 2: Referências de Design

Use as seguintes referências como inspiração para tomar decisões — não copie, sintetize:

**Sistemas de design de referência:**
- **Linear** (linear.app) — tipografia precisa, espaçamento generoso, hierarquia clara
- **Vercel Dashboard** — superfícies com bordas sutis, dark/light coerentes, estados de hover limpos
- **Radix Themes** — escala tipográfica rigorosa, componentes com densidade adequada
- **Stripe Dashboard** — tabelas densas mas legíveis, formulários sem ruído visual

**Princípios a aplicar:**
1. **Hierarquia tipográfica clara** — no máximo 3 tamanhos de fonte na interface; headings com peso e tracking adequados
2. **Espaçamento sistemático** — use múltiplos de 4px (0.25rem); não invente valores arbitrários
3. **Paleta restrita e intencional** — 1 cor de acento, tons neutros de cinza, vermelho apenas para destrutivo, verde apenas para sucesso
4. **Superfícies com profundidade** — use background ligeiramente diferente para cards/tabelas, bordas com opacidade baixa
5. **Estados interativos polidos** — hover, focus, disabled e loading com transições de 150ms
6. **Densidade adequada** — tabelas devem ser compactas; formulários com espaço para respirar

## Fase 3: Implementação

Reescreva `index.css` com:

### Tokens (variáveis CSS em `:root`)
```css
/* Cores */
--color-bg           /* fundo principal */
--color-surface      /* cards, tabelas, inputs */
--color-surface-raised /* hover de linha, dropdowns */
--color-border       /* bordas padrão */
--color-border-strong /* bordas de foco */
--color-text         /* texto principal */
--color-text-muted   /* texto secundário, placeholders */
--color-text-subtle  /* labels, cabeçalhos de tabela */
--color-accent       /* cor primária de ação */
--color-accent-hover /* hover do acento */
--color-danger       /* vermelho destrutivo */
--color-success      /* verde de confirmação */

/* Tipografia */
--font-sans
--font-size-xs   /* 11px */
--font-size-sm   /* 13px */
--font-size-base /* 15px */
--font-size-lg   /* 17px */
--font-size-xl   /* 20px */
--font-size-2xl  /* 26px */

/* Espaçamento */
--space-1  /* 4px */
--space-2  /* 8px */
--space-3  /* 12px */
--space-4  /* 16px */
--space-5  /* 20px */
--space-6  /* 24px */
--space-8  /* 32px */
--space-10 /* 40px */

/* Bordas */
--radius-sm  /* 4px */
--radius-md  /* 6px */
--radius-lg  /* 8px */

/* Sombras */
--shadow-sm
--shadow-md
```

### Componentes a estilizar (classes existentes no código)

| Classe | Refinamentos esperados |
|--------|----------------------|
| `.navbar` | Fundo sólido com borda inferior sutil; logo com peso; links com underline animado no hover |
| `.conteudo` | Max-width 1080px, padding lateral responsivo |
| `.pagina-cabecalho` | Alinhamento correto, h1 com tamanho adequado |
| `.tabela` | Header com `var(--color-text-subtle)` e `font-size-xs` uppercase+tracking; linhas com hover suave; padding compacto |
| `button` (primário) | Border-radius consistente, padding generoso, transição de background |
| `.btn-perigo` | Outline style por padrão, fill no hover |
| `.btn-voltar` | Ghost, sem borda colorida |
| `.form-card` | Sem card container — apenas max-width e gap |
| `.form-field label` | `font-size-sm`, `font-weight: 500`, `color: var(--color-text-subtle)` |
| `input`, `select` | Borda sutil, fundo `var(--color-surface)`, focus com outline colorido |
| `.campo-erro` | Inline, `font-size-xs`, vermelho |
| `.matricula-lista` | Chips de checkbox com padding e borda, checked com fundo colorido |
| `.celula-avaliacao select` | Compacto, sem borda no estado idle, bordas aparecem no hover/focus |
| `.celula-sucesso` | Fundo verde com opacidade baixa, transição suave |
| `.celula-erro` | Fundo vermelho com opacidade baixa |
| `.spinner` | Animação fluida, tamanho adequado ao contexto |
| `.lista-vazia` | Centralizado, cor muted, itálico |
| `.erro-mensagem` | Banner com ícone visual implícito (border-left colorida) |

### Regras de qualidade do CSS

- **Sem valores mágicos** — use sempre as variáveis de token
- **Sem `!important`**
- **Mobile-first** — `@media (max-width: 640px)` para ajustes de padding e fonte
- **Sem animações desnecessárias** — apenas hover/focus/feedback têm transição
- **`prefers-reduced-motion`** — respeite preferência do sistema para animações

## Fase 4: Verificação

Depois de escrever o CSS:

1. Verifique se todas as classes usadas nos `.tsx` têm estilo definido (grep `className=` em `src/`)
2. Confirme que não há referência a classes CSS que não existem mais
3. Rode `npm run build` dentro de `sistema/client/` — deve passar sem erros TypeScript
4. Descreva as principais decisões de design tomadas (paleta escolhida, família tipográfica, estilo geral)
