# 🚀 Guia de Deploy - AIudex Next.js

## 📋 Pré-requisitos

- ✅ Repositório Git configurado
- ✅ Conta no Vercel/Netlify
- ✅ Banco Neon PostgreSQL configurado
- ✅ Variáveis de ambiente prontas

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Next.js
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# API Configuration
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app/api"
```

### 2. Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular dados iniciais
npm run db:seed
```

## 🚀 Deploy no Vercel

### 1. Conectar Repositório

- Acesse [vercel.com](https://vercel.com)
- Conecte seu repositório Git
- Selecione o projeto `nextjs-migration`

### 2. Configurar Variáveis

- Vá em Settings → Environment Variables
- Adicione todas as variáveis do `.env.local`

### 3. Deploy

- Vercel detecta automaticamente Next.js
- Deploy acontece automaticamente no push

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Start (produção)
npm run start

# Database
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## 📁 Estrutura do Projeto

```
nextjs-migration/
├── src/
│   ├── app/           # App Router
│   ├── components/    # Componentes React
│   ├── lib/          # Utilitários
│   └── contexts/     # Contextos React
├── prisma/           # Schema e migrações
├── public/           # Arquivos estáticos
└── vercel.json       # Configuração Vercel
```

## 🔍 Troubleshooting

### Erro de Build

- Verifique se todas as dependências estão instaladas
- Execute `npm run build` localmente

### Erro de Database

- Verifique se `DATABASE_URL` está correto
- Execute `npm run db:generate`

### Erro de JWT

- Verifique se `JWT_SECRET` está definido
- Gere uma chave segura

## 📞 Suporte

Para problemas específicos, verifique:

1. Logs do Vercel
2. Console do navegador
3. Logs do banco Neon
