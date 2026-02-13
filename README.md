# Opus

Sistema pessoal de controle financeiro focado em clareza, organizacao e uso diario. Baseado no starter kit React + TS.

## Stack
- React + TypeScript + Vite
- CSS (sem Tailwind por enquanto)
- Supabase (Auth + Postgres + RLS)

## Rodar localmente
```sh
npm install
npm run dev
```

## Ambiente
Crie um `.env.local` com:
```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Na Vercel, cadastre as mesmas variaveis em Environment Variables.

## Estrutura base
- Arquitetura por features (modulos) em `src/features`
- Estilos em camadas em `src/styles` via `src/styles/main.css`

## Notas
- PWA e Capacitor ficam para depois do MVP.
