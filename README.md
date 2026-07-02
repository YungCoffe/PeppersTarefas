# 🌶️ Peppers - Sala do Futuro

Aplicativo para gerenciar atividades da Sala do Futuro (São Paulo).

## 📋 Funcionalidades

1. **Login** com RA e senha da Sala do Futuro
2. **Lista de atividades entregues** com status (Em Correção / Corrigido / Pendente)
3. **Confirmação de correção** — marcar "Sim" ou "Não" nas atividades em correção

## 🚀 Como rodar localmente

```bash
# 1. Clone o repo
git clone <seu-repo>
cd peppers

# 2. Instale dependências
npm install

# 3. Crie o .env.local
cp .env.example .env.local

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 🌐 Deploy no Vercel

### 1. Crie um repositório no GitHub
```bash
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/peppers.git
git push -u origin main
```

### 2. Importe no Vercel
- Acesse [vercel.com](https://vercel.com)
- Clique em "Add New Project"
- Importe o repo `peppers`
- Adicione as variáveis de ambiente (copie do `.env.example`)
- Clique em "Deploy"

## 📁 Estrutura do Projeto

```
peppers/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts         # POST - Faz login na Sala do Futuro
│   │   │   └── validar/route.ts       # POST - Valida token JWT
│   │   ├── atividades/route.ts          # GET - Lista atividades entregues
│   │   ├── atividade/[id]/route.ts      # GET - Detalhe da atividade
│   │   └── agreement/route.ts           # PUT - Envia resposta sim/não
│   ├── login/page.tsx                   # Página de login
│   ├── dashboard/page.tsx               # Lista de atividades
│   ├── atividade/[id]/page.tsx          # Detalhe + confirmação
│   ├── layout.tsx                       # Layout raiz
│   ├── page.tsx                         # Redireciona p/ login
│   └── globals.css                      # Estilos globais
├── lib/
│   └── api.ts                           # Funções de chamada à API
├── types/
│   └── index.ts                         # Tipos TypeScript
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.example
```

## 🔗 APIs Utilizadas

| # | Endpoint | Método | Descrição |
|---|----------|--------|-----------|
| 1 | `/credenciais/api/LoginCompletoToken` | POST | Login com user/senha |
| 2 | `/credenciais/api/ValidarToken` | POST | Valida token JWT |
| 3 | `/tms/answer` | GET | Lista atividades entregues |
| 4 | `/tms/task/{taskId}/answer/{answerId}` | GET | Detalhe da atividade |
| 5 | `/tms/task/{id}/question/{qid}/answer/{aid}/agreement` | PUT | Envia agreement |

## ⚠️ Observações

- O `questionId` é pego **dinamicamente** da API de detalhe da atividade
- O `x-api-key` usado nas APIs do EDUSP é o próprio token JWT do login
- As `publication_target` são geradas automaticamente a partir do `nick` do usuário

## 📝 Licença

MIT
