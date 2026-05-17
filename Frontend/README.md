# Frontend SOA

| Command        | Description                        |
|----------------|------------------------------------|
| `npm run dev`  | Start Vite dev server              |
| `npm run build`| Type-check and build for production|
| `npm run lint` | Run ESLint                         |
| `npm run preview` | Preview production build locally |
Klikom na dugme `npm run dev` ili ako samo tu ukucamo u konzolu, pokrece se server na [http://localhost:5173/](http://localhost:5173/)

## Npm paketi:
- `React Router v7` - upravlja navigacijom i zaštićenim rutama po rolama
- `TanStack Query` - upravlja stanjima API poziva (učitavanje, greška, keširanje)
- `Axios` - šalje HTTP zahteve ka bekend-u sa automatskim auth headerima
- `Zustand` - čuva globalno stanje u memoriji (sesija, otključan vault)
- `React Hook Form` - upravlja stanjem forme i slanjem podataka
- `Zod` - validira podatke iz formi i generiše TypeScript tipove
- `Tailwind CSS` - stilizovanje putem utility klasa
- `shadcn/ui` - gotove UI komponente


## Struktura

```
src/
├── pages/
│   ├── LoginPage.tsx
│   └── HomePage.tsx
│
├── components/
│   ├── ui/                     # Komponente - button, lista, textbox
│   ├── molecules/              # grupa button-a (iz komponenata-a), deo forme itd
│   └── layout/                 # Navbar, Toolbar, forma
│       ├── Navbar.tsx
│       └── Sidebar.tsx
│
├── features/                   # Ovde je primer kako bi features izgledao
│   ├── auth/
│   │   ├── components/
│   │   │      └── ProtectedRoute.tsx        # Preko ovoga definisemo da li ce korisnik moci da ide na odrednjene stranice ako nije ulogovan
│   │   ├── hooks/
│   │   └── services/
│   ├── blog/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── tours/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── store/                    # ovo store je ako koristimo Zustand, da nam cuva session token itd
│   └── vaultStore.ts
│
├── lib/
│   ├── api-client.ts
│   └── schemas.ts
│
├── types/      # Modeli podataka
│   ├── blog.ts
│   └── auth.ts
│
├── hooks/
├── utils/
│
├── App.tsx
├── main.tsx
└── index.css
```

### Where files should go

- **Pages** that match a route → `src/pages/`
- **Reusable UI primitives** (buttons, inputs) → `src/components/ui/`
- **Feature-specific code** (auth forms, cert lists) → `src/features/<feature>/`
  - `components/` – feature-specific React components
  - `hooks/` – feature-specific data hooks
  - `services/` – API calls for that feature
- **Shared hooks** → `src/hooks/`
- **Global state (Zustand)** → `src/store/`
- **Shared types** → `src/types/`
- **Config & constants** → `src/config/` and `src/constants/`
- **Route table** → `src/router/`
- **Providers** → `src/providers/`

## Setup

1. Install dependencies:

```bash
npm install
```

If you ever need to reinstall the main libraries manually:

```bash
npm install react-router react-hook-form zod @hookform/resolvers axios @tanstack/react-query zustand class-variance-authority clsx tailwind-merge lucide-react idb-keyval
```

2. Start the development server:

```bash
npm run dev
```

## @ Path Alias

`@` je alias koji mapira na `src/` folder, što omogućava čistije importove bez relativnih putanja.

```ts
// Bez aliasa — relativni import, krhko i ružno
import { cn } from "../../../../lib/utils"

// Sa aliasom — uvek isto, bez obzira gde si u projektu
import { cn } from "@/lib/utils"
```

---

### Konfiguracija

**`vite.config.ts`** — za runtime (Vite bundler):

```ts
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
})
```

**`tsconfig.app.json`** — za TypeScript type checking:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

> ⚠️ Važno: oba fajla moraju biti usklađena. Vite config kontroliše runtime, tsconfig kontroliše TypeScript — ako jedan nedostaje, ili će TypeScript javljati greške ili neće raditi u browseru.

---