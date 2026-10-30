# CONEXCOFFEE FRONTEND — AGENTS CONTEXT & ARCHITECTURE RULES

This file is automatically loaded by AI coding assistants, agents, and subagents operating in this workspace. It serves as the single source of truth for architectural constraints, technology stack, and engineering rules. `GEMINI.md` mirrors these rules in Spanish; when changing one, update the other.

---

## MANDATORY RULES FOR ALL AI AGENTS

### 1. Stack Inmutability
Do NOT install new styling libraries, client-state managers, or routers. Approved stack:
   - React 19 + Vite 8
   - Tailwind CSS v4 (configured in `src/styles/index.css`, no `tailwind.config.js`)
   - React Router DOM v7 (`createBrowserRouter`)
   - **React Context API + Providers (`src/context/` & `src/hooks/`)** — Centralizes all server data fetching, CRUD operations, and state management per role/module.
   - **Zustand v5 — CLIENT session & UI state** (`src/store/useAuthStore.js`, `src/store/useUIStore.js`). In-memory, never persisted.
   - Axios v1.20 with central instance at `src/lib/axios.js`
   - Lucide React (strictly ZERO emojis)
   - Cloudflare Turnstile (`@marsidev/react-turnstile`)
   - DOMPurify (`src/lib/sanitize.jsx`)
   - Headless UI, React Hot Toast, Oxlint, Knip

   Adding any other dependency requires explicit user approval and an update to this file.

### 2. State Management & Context/Provider Architecture (NON-NEGOTIABLE)
   - **Server data & CRUD operations** → Encapsulated inside React **Contexts & Providers** in `src/context/` (`AuthContext`, `SuperAdminContext`, `EmpresaContext`, `CaficultorContext`, `LaboratorioContext`, `CatadorContext`, `CompradorContext`, `BrokerContext`, `TecnicoContext`) and consumed via custom hooks in `src/hooks/` (`useAuth`, `useSuperAdmin`, `useEmpresa`, `useCaficultor`, `useLaboratorio`, `useCatador`, `useComprador`, `useBroker`, `useTecnico`).
   - **NEVER insert HTTP requests (`axios` / `api`) directly inside pages/views** (`pages/`). Pages only call functions and read state exposed by Providers via hooks.
   - **NEVER keep hardcoded mock arrays (`INITIAL_*`, `MOCK_*`, `data/` seeds)** in pages or services. All data comes from the real backend (`http://localhost:3001/api`).
   - **Client/session/UI state** (user, role, sidebar, open modal) → Synchronized in memory (`useAuthStore` + `AuthContext`) and backed by `HttpOnly` cookies from the backend.
   - Local, ephemeral UI state (search term, open modal, form fields) → `useState` inside the component.
   - `clearAuth()` clears authentication state on logout / 401. Never bypass it.

### 3. Layered Data Architecture (Page → Hook → Context Provider → Axios)
Dependencies flow in ONE direction:

```
pages/ & components/   →   src/hooks/use<Role>.js   →   src/context/<Role>Context.jsx   →   src/lib/axios.js
```

   - **`src/context/`** (Providers): centralize all API requests (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), data mapping between PostgreSQL schemas and UI fields, loading states, and toast notifications.
   - **`src/hooks/`** (Consumer hooks): wrap `useContext(<Role>Context)` with validation.
   - **`pages/`**: compose hooks + components. NEVER import `axios` or perform HTTP calls directly.
   - **`components/`**: presentational. Receive data and callbacks via props.
   - Errors: use `getErrorMessage(error)` from `src/lib/axios.js`.

### 4. Real Backend Integration (Zero Mocks)
   - `src/lib/env.js` reads `VITE_API_BASE_URL` (defaults to `http://localhost:3001/api`).
   - Hardcoded mock files (`data/`) and `demoAuth.js` are eliminated in favor of real PostgreSQL persistence via the backend REST API (`/api/usuarios-sistema`, `/api/caficultores`, `/api/catadores`, `/api/empresas-exportadoras`, `/api/asistentes-tecnicos`, `/api/laboratorios`, `/api/brokers`, `/api/compradores-internacionales`, `/api/fincas`, `/api/variedades-cafe`, `/api/lotes-cultivo`, `/api/preofertas`, `/api/inspecciones-finca`, `/api/evaluaciones-fisicas`, `/api/sesiones-catacion`, `/api/hojas-catacion-cva`, `/api/contenedores-virtuales`, `/api/pedidos-internacionales`).

### 5. Security & Network Compliance
   - NEVER store JWT tokens or session credentials in `localStorage` or `sessionStorage`.
   - All HTTP communication must use `src/lib/axios.js` (`withCredentials: true` for HttpOnly cookies). No `fetch`, no other axios instance.
   - **Infrastructure Decoupling (Dependency Inversion):** `src/lib/axios.js` must NEVER import `store/` or UI layers. 401 unauthorization handling is injected via `setUnauthorizedHandler(fn)` registered in `src/app/AppProviders.jsx`.
   - Requests where a 401 is expected (e.g. `getMe`, health pings) must pass `skipAuthRedirect: true`.
   - Any sensitive form (login, register) must include `src/components/ui/Captcha.jsx`.
   - Route guards are UX only. Real authorization is enforced by the backend; never rely on hiding UI for security.
   - HTML from the server or users must go through `sanitizeHTML()` / `<SafeHTML />`.
   - Never log tokens, payment data, or personal data with `console.*`.

### 6. Centralized Color & Design System (ZERO Arbitrary Hex)
   - PROHIBITED: Hardcoded hex classes in Tailwind (e.g. `bg-[#AD2E01]`, `text-[#F25433]`, `border-[#...]`).
   - ALL colors must use semantic design tokens defined in `src/styles/index.css` (`@theme`) and configured in `src/lib/colors.js`:
     - Primary Terracota: `bg-brand-terracota`, `text-brand-terracota`, `border-brand-terracota` (with hover `bg-brand-terracota-dark` or `bg-brand-orange`)
     - Light Tint: `bg-brand-tint` (`#FFF5F2`)
     - Accents: `brand-amber`, `brand-gold`, `brand-teal`
     - Coffee Roast Palette: `--color-roast-1` to `--color-roast-12`
   - Any re-branding or palette modifications MUST be performed strictly in `src/styles/index.css` and `src/lib/colors.js`.

### 7. Feature-Based Architecture
   - New pages or modules for any role (`superadmin`, `empresa`, `broker`, `caficultor`, `laboratorio`, `tecnico`, `catador`, `comprador`) must be placed in `src/features/<role>/` and connected to `src/context/<Role>Context.jsx` and `src/hooks/use<Role>.js`.
   - Export pages through `src/features/<role>/index.js`.
   - Register the route in `src/app/router.jsx` wrapped by the role's Context Provider.
   - Add the sidebar link in `src/layouts/components/Sidebar.jsx` using a Lucide React icon.

### 8. Size & Quality Limits
   - Keep pages clean and declarative by keeping data fetching and mutation logic inside Context Providers (`src/context/`).
   - Keep routes unique: no duplicate paths pointing to the same page (use `<Navigate>` redirects).

### 9. Zero White Screens
   - Global 404 catch-all is handled by `src/features/auth/pages/NotFoundPage.jsx`.
   - Route groups use `errorElement={<RouteError />}` (`src/components/feedback/RouteError.jsx`).
   - Fatal exceptions are caught by `src/components/feedback/ErrorBoundary.jsx`.

### 10. Build Verification
   - Always run `npm run build` to verify clean compilation before concluding changes.
   - `npm run lint` must not show new errors.
