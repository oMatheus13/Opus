# React TS Starter Kit

Starter kit minimal focado em estrutura de pastas e arquitetura de CSS. Sem boilerplate: os arquivos ficam intencionalmente vazios para voce conectar sua propria stack.

## O que esta incluido
- Estrutura de pastas escalavel para React/TypeScript
- Arquitetura de estilos com `main.css` em camadas e `index.css` por pasta
- Placeholders para componentes, paginas, layouts, hooks, services, store, types e utils

## Estrutura
- `public/`
- `src/`
  - `assets/`
  - `components/`
  - `features/`
  - `hooks/`
  - `layouts/`
  - `pages/`
  - `services/`
  - `store/`
  - `styles/`
  - `types/`
  - `utils/`
  - `config/`

## Estilos
- `src/styles/main.css` importa: base, theme, utilities, componentes, layouts, pages, vendor.
- Cada pasta tem `index.css` que importa seus arquivos locais.
- `src/styles/base/` inclui `fonts`, `reset`, `variables`, `icons`, `elements`, `forms`, `animations`, `print`.

## Como comecar
1) Escolha sua ferramenta (Vite, CRA, Next, etc).
2) Preencha `package.json`, `tsconfig.json`, `vite.config.js` e `public/index.html`.
3) Construa suas features e paginas dentro de `src/`.

## Como baixar a estrutura
```sh
git clone https://github.com/oMatheus13/react-ts-starter-kit.git
cd react-ts-starter-kit
```

## Notas
- Arquivos vazios sao intencionais. Remova o que nao usar.
- `src/index.tsx` ja importa `src/styles/main.css`.

## Licenca
Adicione sua licenca em `LICENSE`.
