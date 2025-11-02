# Aurora - Streaming Premium

PWA de streaming mobile inspirado no design do Apple TV, desenvolvido com Next.js, Firebase e Supabase.

## Tecnologias

- **Next.js 15** - Framework React com SSR
- **Firebase** - Autenticação (Google OAuth)
- **Supabase** - Banco de dados PostgreSQL
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Framer Motion** - Animações
- **next-pwa** - PWA Support

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Preencha as variáveis:
- Firebase: Console do Firebase > Project Settings > General
- Supabase: Dashboard do Supabase > Settings > API

### 3. Configurar banco de dados

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute os scripts SQL na pasta `sql/` **EXATAMENTE NESTA ORDEM**:
   - **`00_disable_rls.sql`** ⚡ PRIMEIRO! (Desabilita RLS)
   - `01_users.sql`
   - `02_categories.sql`
   - `03_movies.sql`
   - `04_series.sql`
   - `05_user_interactions.sql`

### 4. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative a autenticação do Google em Authentication > Sign-in method
3. Copie as credenciais para `.env.local`

### 5. Verificar setup (Opcional mas recomendado)

```bash
npm run check
```

Este comando verifica se todas as configurações estão corretas.

### 6. Executar o projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## 📱 Mobile-First

O Aurora foi desenvolvido como um **PWA mobile-first**. Veja detalhes completos em:
- **MOBILE_FIRST.md** - Guia completo das features mobile

### Recursos Mobile
- Bottom Navigation com 5 seções
- Hero Banner otimizado para vertical
- Cards de categorias com gradientes
- Scroll horizontal suave
- Animações nativas (60fps)
- Safe area support (notch/dynamic island)

## ⚠️ Problemas?

Se encontrar algum erro, consulte:
- **SETUP.md** - Guia passo a passo detalhado
- **TROUBLESHOOTING.md** - Soluções para erros comuns
- **MOBILE_FIRST.md** - Detalhes da implementação mobile
- **sql/README.md** - Instruções dos scripts SQL

## Estrutura do Projeto

```
aurora/
├── app/
│   ├── api/          # API Routes
│   ├── home/         # Página principal
│   ├── login/        # Página de login
│   └── layout.tsx    # Layout raiz
├── components/
│   ├── home/         # Componentes da home
│   └── ui/           # Componentes shadcn
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── firebase.ts   # Config Firebase
│   ├── supabase.ts   # Config Supabase
│   └── utils.ts      # Utilitários
├── sql/              # Scripts SQL
└── public/
    └── manifest.json # PWA manifest
```

## Features

- ✅ **PWA Mobile-First** - Otimizado para smartphones
- ✅ **Autenticação Google** - Login via Firebase
- ✅ **Design Apple TV** - Interface elegante e moderna
- ✅ **Bottom Navigation** - Navegação nativa mobile
- ✅ **Animações Fluidas** - 60fps com Framer Motion
- ✅ **Hero Banner Mobile** - Adaptado para telas pequenas
- ✅ **Category Cards** - 8 categorias com ícones coloridos
- ✅ **Safe Area Support** - Compatível com notch/dynamic island
- ✅ **Banco PostgreSQL** - Supabase como backend
- ✅ **SSR Next.js 15** - Server-Side Rendering

## Próximos Passos

- [ ] Implementar busca de conteúdo
- [ ] Sistema de watchlist
- [ ] Player de vídeo
- [ ] Histórico de visualização
- [ ] Sistema de recomendações
- [ ] Perfis de usuário
- [ ] Categorias e filtros

## Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Importe no Vercel
3. Configure as variáveis de ambiente
4. Deploy!

### Outras plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js.

## Licença

MIT
