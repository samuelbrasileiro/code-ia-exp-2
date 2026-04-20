# Deploy no Render — Sistema Full-Stack

Você está preparando e executando o deploy de um sistema full-stack (backend Node.js + frontend React/estático) no Render. Siga as etapas abaixo na ordem, adaptando os valores ao projeto atual.

## 1. Reconhecimento do Projeto

Antes de qualquer coisa, mapeie:

- **Pasta do servidor**: onde fica o `package.json` do backend (ex: `sistema/server/`)
- **Pasta do cliente**: onde fica o `package.json` do frontend (ex: `sistema/client/`)
- **Build do cliente**: qual o comando e o diretório de saída (`dist/`, `build/`, etc.)
- **Start do servidor**: qual o comando de produção (ex: `node dist/index.js`)
- **Variáveis de ambiente necessárias**: SMTP, portas, segredos, URLs de API

Se o projeto tiver um `render.yaml` existente, leia-o antes de sobrescrever.

## 2. Adaptar o Servidor para Produção

### 2a. Servir o frontend estático pelo backend

Em produção o Render usa um único Web Service. O servidor Express deve servir os arquivos estáticos do build do cliente **e** atuar como API:

```typescript
import path from 'path';

// Após todas as rotas de API:
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});
```

Adicione isso **somente se ainda não existir** e **após** o registro das rotas de API.

### 2b. Porta dinâmica

O Render injeta a porta via `process.env.PORT`. Garanta:

```typescript
const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => { /* ... */ });
```

### 2c. URL da API no frontend

O cliente React deve apontar para a mesma origem em produção (sem URL hardcoded). Use uma variável de ambiente do Vite:

```typescript
// services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? '';
```

No `vite.config.ts`, configure o proxy **somente para dev**:

```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3001',
  },
},
```

Em produção (`VITE_API_URL` ausente), as chamadas vão para a mesma origem — o Express as serve.

## 3. Script de Build Unificado

No `package.json` do servidor, adicione um script que builda os dois projetos em sequência:

```json
{
  "scripts": {
    "build:client": "cd ../client && npm install && npm run build",
    "build": "npm run build:client && tsc",
    "start": "node dist/index.js"
  }
}
```

Verifique se o `tsconfig.json` do servidor tem `"outDir": "./dist"` e `"rootDir": "./src"`.

## 4. Criar o `render.yaml`

Crie na **raiz do repositório** (não dentro de `sistema/`):

```yaml
services:
  - type: web
    name: <nome-do-projeto>
    runtime: node
    rootDir: sistema/server
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        generateValue: false   # Render injeta automaticamente
      # Adicione aqui outras variáveis necessárias:
      # - key: SMTP_HOST
      #   sync: false          # 'sync: false' = valor definido manualmente no dashboard
      # - key: SMTP_USER
      #   sync: false
      # - key: SMTP_PASS
      #   sync: false
    healthCheckPath: /api/health   # opcional, mas recomendado
```

Se o projeto tiver variáveis sensíveis (senhas SMTP, chaves), use `sync: false` — o valor será inserido manualmente no dashboard do Render depois.

## 5. Endpoint de Health Check (opcional, mas recomendado)

Adicione uma rota simples no servidor para que o Render confirme que o serviço subiu:

```typescript
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
```

Registre-a antes das demais rotas.

## 6. Arquivo `.env.example`

Crie (ou atualize) `sistema/server/.env.example` com todas as variáveis necessárias, sem valores reais:

```
PORT=3001
NODE_ENV=development
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Confirme que `.env` está no `.gitignore`.

## 7. Verificação Local de Produção

Antes do push, simule o build de produção localmente:

```bash
cd sistema/server
npm run build        # deve compilar cliente + servidor sem erros
NODE_ENV=production npm start   # servidor deve subir e servir o cliente em /
```

Abra `http://localhost:3001` e valide o golden path da aplicação.

## 8. Commit e Push

```bash
git add render.yaml sistema/server/package.json sistema/server/src/ sistema/client/src/
git commit -m "Preparar deploy no Render: build unificado e servidor estático"
git push origin main
```

## 9. Configurar o Serviço no Render

1. Acesse [render.com](https://render.com) → **New → Web Service**
2. Conecte o repositório GitHub/GitLab
3. Se o `render.yaml` foi detectado, confirme as configurações; senão, preencha manualmente:
   - **Root Directory**: `sistema/server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. Na aba **Environment**, adicione as variáveis com `sync: false` (SMTP etc.)
5. Clique em **Create Web Service**

## 10. Validação Pós-Deploy

Após o deploy completar:

- [ ] URL pública abre o frontend sem erros de console
- [ ] Chamadas de API retornam dados reais (não mock)
- [ ] Criar/editar um registro persiste entre reloads
- [ ] Se houver e-mail: disparar uma avaliação e confirmar que o e-mail chega

## Checklist de Problemas Comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Cannot GET /` | Express não serve estáticos | Adicione `app.use(express.static(...))` |
| API retorna 404 em produção | Prefixo de rota diferente | Confirme que rotas usam `/api/...` |
| Build falha: `tsc` não encontrado | `typescript` não está em `dependencies` | Mova para `dependencies` ou use `npx tsc` |
| Variável de ambiente `undefined` | Não configurada no dashboard | Revise a aba Environment no Render |
| Frontend não atualiza dados | `VITE_API_URL` hardcoded para localhost | Remova o valor ou use origem relativa |
| Crash imediato: porta em uso | `PORT` hardcoded | Use `process.env.PORT ?? 3001` |
