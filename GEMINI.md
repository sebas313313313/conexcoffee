# CONEXCOFFEE FRONTEND — REGLAS OBLIGATORIAS DE ARQUITECTURA Y DESARROLLO

Este archivo es de LECTURA OBLIGATORIA para cualquier agente de Inteligencia Artificial o desarrollador que trabaje en este repositorio. Define las restricciones técnicas, stack inmutable, estructura de carpetas y lineamientos de seguridad que DEBEN seguirse en cada modificación o adición de código.

---

## 1. STACK TECNOLÓGICO INMUTABLE Y VERSIONES

Bajo ninguna circunstancia se deben instalar librerías redundantes o modificar las siguientes tecnologías base:

- **Framework**: React 19 (`react` ^19.2, `react-dom` ^19.2).
- **Herramienta de Compilación**: Vite 8 (`vite` ^8.2).
- **Estilos**: Tailwind CSS v4 (`@tailwindcss/vite` ^4.3, `tailwindcss` ^4.3). Configuración en CSS (`src/styles/index.css`), NO crear `tailwind.config.js`.
- **Enrutamiento**: React Router DOM v7 (`react-router-dom` ^7.18) con `createBrowserRouter`.
- **Estado de Servidor y Datos por Dominio**: **React Context API + Providers** (`src/context/` y `src/hooks/`).
- **Estado de Cliente / Sesión**: Zustand v5 (`zustand` ^5.0) en memoria volátil sincronizado con `AuthContext`.
- **Cliente HTTP**: Axios v1.20 (`axios` ^1.20) en `src/lib/axios.js`.
- **Iconografía**: Lucide React (`lucide-react` ^1.41). PROHIBIDO EL USO DE EMOJIS O OTRAS LIBRERÍAS DE ICONOS.
- **Seguridad / Antibot**: Cloudflare Turnstile (`@marsidev/react-turnstile` ^1.6).
- **Sanitización HTML (Anti-XSS)**: DOMPurify (`dompurify` ^3.4).
- **Modales Accesibles**: Headless UI (`@headlessui/react` ^2.2).
- **Notificaciones**: React Hot Toast (`react-hot-toast` ^2.6).
- **Linteo y Limpieza**: Oxlint (`oxlint` ^1.79) y Knip (`knip` ^6.34).

### Fronteras de estado y Context/Providers (NO NEGOCIABLES)

- **Datos del servidor y operaciones CRUD** → Se gestionan mediante **Contexts y Providers** de React en `src/context/` (`AuthContext`, `SuperAdminContext`, `EmpresaContext`, `CaficultorContext`, `LaboratorioContext`, `CatadorContext`, `CompradorContext`, `BrokerContext`, `TecnicoContext`) y se consumen mediante hooks en `src/hooks/` (`useAuth`, `useSuperAdmin`, `useEmpresa`, `useCaficultor`, `useLaboratorio`, `useCatador`, `useComprador`, `useBroker`, `useTecnico`).
- **PROHIBIDO insertar peticiones HTTP (`axios` / `api`) en las vistas/páginas** (`pages/`). Las páginas solo invocan funciones y leen estado desde los Providers mediante sus hooks.
- **PROHIBIDO mantener datos hardcodeados (`INITIAL_*`, `MOCK_*`, carpetas `data/`)**. Todo proviene del backend real (`http://localhost:3001/api`).
- **Estado de sesión y UI** → En memoria volátil (`useAuthStore` + `AuthContext`) respaldado por cookies `HttpOnly` del backend.
- **Estado efímero de UI** (búsqueda, modal abierto, campos de formulario) → `useState` local.

### Arquitectura de datos por capas (Page → Hook → Context Provider → Axios)

```
pages/ y components/   →   src/hooks/use<Rol>.js   →   src/context/<Rol>Context.jsx   →   src/lib/axios.js
```

- **`src/context/`**: Providers que concentran todas las peticiones HTTP, mapeo de datos entre PostgreSQL y la UI, estados de carga y notificaciones toast.
- **`src/hooks/`**: Hooks consumidores (`useContext`) que exponen el contexto a las vistas.
- **`pages/`**: componen hooks y componentes. PROHIBIDO importar `axios` o hacer peticiones en las vistas.
- **`components/`**: presentacionales, reciben datos y callbacks por props.
- Errores: `getErrorMessage(error)` de `src/lib/axios.js`.

### Integración con Backend Real (Cero Mocks)

- `src/lib/env.js` apunta por defecto a `http://localhost:3001/api`.
- Se eliminan los archivos `data/` de mocks y `demoAuth.js`. Todas las operaciones usan la API REST real con cookies `HttpOnly`.

---

## 2. REGLAS ESTRICTAS DE SEGURIDAD (NO NEGOCIABLES)

1. **PROHIBIDO EL USO DE `localStorage` O `sessionStorage` PARA TOKENS**:
   - NUNCA guardar tokens JWT ni datos sensibles en el almacenamiento del navegador.
   - La sesión se gestiona con cookies seguras `HttpOnly` emitidas por el backend.
   - El estado de autenticación del frontend se guarda ÚNICAMENTE en memoria volátil de JavaScript (`src/store/useAuthStore.js` y `src/context/AuthContext.jsx`).
2. **AXIOS CENTRALIZADO E INVERSIÓN DE DEPENDENCIAS**:
   - TODAS las peticiones HTTP deben realizarse a través de la instancia central en `src/lib/axios.js`.
   - La instancia tiene forzado `withCredentials: true` para enviar y recibir cookies automáticamente.
   - **Desacoplamiento de infraestructura**: `src/lib/axios.js` NUNCA debe importar stores de Zustand (`useAuthStore`) ni capas de UI. La captura de 401 y expulsión de sesión se gestiona por inversión de dependencias mediante `setUnauthorizedHandler(fn)` registrado en `src/app/AppProviders.jsx`.
3. **PROTECCIÓN CONTRA XSS**:
   - Todo HTML proveniente del servidor o de inputs debe sanitizarse usando `sanitizeHTML()` o el componente `<SafeHTML />` de `src/lib/sanitize.jsx`.
4. **VERIFICACIÓN ANTIBOT**:
   - Todo formulario crítico (Login, Registro) debe incluir el componente `<Captcha />` de `src/components/ui/Captcha.jsx`.
5. **CONSENTIMIENTO LEGAL OBLIGATORIO**:
   - El registro exige aceptación obligatoria de los Términos (`/terms`), Política de Privacidad (`/privacy`) y Aviso Legal (`/legal`).
6. **SISTEMA ÚNICO DE COLORES (CERO HEX ARBITRARIOS)**:
   - PROHIBIDO el uso de clases arbitrarias de color en Tailwind (`bg-[#AD2E01]`, `text-[#F25433]`, etc.).
   - Todos los colores deben provenir de los tokens semánticos definidos en `src/styles/index.css` (`@theme`) y centralizados en `src/lib/colors.js`.

---

## 3. ARQUITECTURA DE CONTEXTOS, HOOKS Y CARPETAS

```
src/
├── app/                          # Configuración central (App, AppProviders, router)
├── components/                   # Componentes UI reutilizables sin lógica de negocio
├── context/                      # Providers React (Auth, SuperAdmin, Empresa, Caficultor, Laboratorio, Catador, Comprador, Broker, Tecnico)
├── features/                     # Módulos por dominio y rol (pages y components)
├── guards/                       # GuestRoute, ProtectedRoute, RoleGuard
├── hooks/                        # useAuth, useSuperAdmin, useEmpresa, useCaficultor, useLaboratorio, useCatador, useComprador, useBroker, useTecnico
├── layouts/                      # AuthLayout, DashboardLayout, Header, Sidebar
├── lib/                          # axios, sanitize, constants, env
├── store/                        # useAuthStore, useUIStore
└── styles/                       # index.css
```

---

## 4. REGLAS ESTÉTICAS Y DE CÓDIGO

- **CERO EMOJIS**: Usar exclusivamente iconos de `lucide-react`.
- **PREVENCIÓN DE PANTALLAS EN BLANCO**: Cualquier ruta no encontrada debe caer en `NotFoundPage` (`path: '*'`). Excepciones de renderizado contenidas por `ErrorBoundary`.
- **VERIFICACIÓN OBLIGATORIA TRAS CAMBIOS**:
  - `npm run build` debe terminar con código 0 (sin errores).
  - `npm run lint` no debe mostrar nuevos errores.
