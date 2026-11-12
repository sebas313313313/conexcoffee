# ☕ ConexCoffee – Backend API

API REST transaccional y de trazabilidad inmutable para comercio exterior de café especial colombiano (SCA >= 80). Construida bajo arquitectura orientada a objetos (POO), multiesquema en PostgreSQL, estándares de diseño REST uniformes y catálogo institucional de errores (`CC-XXXX`).

---

## 🏛️ 1. Arquitectura y Estructura POO por Módulos

El proyecto está organizado de manera modular en la carpeta [`modules/`](file:///c:/Users/Usuario/Documents/conexCofee/backend/modules). Cada módulo representa una entidad/tabla de la base de datos y contiene una estructura de 4 capas:

```
modules/
├── baseRepository.js       # Repositorio genérico con paginación y metadatos
├── baseService.js          # Servicio genérico con validaciones y DomainError
├── baseController.js       # Controlador genérico con formato REST uniforme
├── index.js                # Registro y asociaciones entre modelos Sequelize
│
├── [nombre_tabla]/
│   ├── [NombreTabla].js    # Modelo Sequelize con mapeo al esquema PostgreSQL
│   ├── repository/         # Operaciones de persistencia y consultas SQL avanzadas
│   ├── services/           # Lógica de negocio, reglas de dominio y errores CC-XXXX
│   ├── controller/         # Orquestación HTTP, deserialización y respuestas uniformes
│   └── router/             # Definición de endpoints REST y middlewares
```

### Módulos Implementados

| Módulo | Esquema DB | Tabla | Descripción |
| :--- | :--- | :--- | :--- |
| **`catalogo_errores`** | `auditoria` | `catalogo_errores` | Consulta y gestión del catálogo institucional de errores CC-XXXX. |
| **`usuarios_sistema`** | `acceso` | `usuarios_sistema` | Autenticación JWT, registro, login, roles y seguridad perimetral. |
| **`caficultores`** | `personas` | `caficultores` | Perfil de productores, verificación documental y billetera COP. |
| **`fincas`** | `agronomia` | `fincas` | Fincas georreferenciadas, perfil agroecológico y altitud. |
| **`variedades_cafe`** | `agronomia` | `variedades_cafe` | Catálogo botánico (Castillo, Geisha, Borbón Rosado, etc.). |
| **`lotes_cultivo`** | `agronomia` | `lotes_cultivo` | Lotes de cultivo por finca, variedad y tipo de sombra. |
| **`preofertas`** | `cosechas` | `preofertas` | Preofertas de café, modalidades directa/bolsa libre y conversión kg/cargas. |
| **`inspecciones_finca`** | `cosechas` | `inspecciones_finca` | Inspección técnica offline/online con control de humedad (10%-12%). |
| **`evaluaciones_fisicas`**| `calidad` | `evaluaciones_fisicas` | Análisis físico de laboratorio (humedad, densidad, aw, factor rendimiento). |
| **`evaluaciones_sensoriales_cva`** | `calidad` | `evaluaciones_sensoriales_cva` | Catación SCA bajo protocolo CVA (8 fases) y exportación JSON compilada. |
| **`inventario_precintos_qr`** | `logistica` | `inventario_precintos_qr` | Control de precintos preexistentes con doble token (QR interno/externo). |
| **`sacos_cafe`** | `logistica` | `sacos_cafe` | Custodia individual por saco, sellado y quema de QR interno en destino. |
| **`trazabilidad_escaneos`** | `logistica` | `trazabilidad_escaneos` | Vistas públicas (consumidor) y técnicas (actores autenticados) con GPS e IP. |
| **`contenedores_virtuales`**| `logistica` | `contenedores_virtuales` | Contenedores marítimos y control de zarpe blindado al 100% de pago. |
| **`pedidos_internacionales`**| `finanzas` | `pedidos_internacionales` | Pedidos en USD con esquema de pagos 30% anticipo / 70% saldo. |
| **`alertas_seguridad`** | `auditoria` | `alertas_seguridad` | Bitácora inmutable de alertas de fraude e integridad perimetral. |

---

## 📡 2. Estándares de Diseño REST

### Formato Uniforme de Respuesta Exitosa (HTTP 200 / 201)
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalRecords": 100,
    "totalPages": 5
  },
  "error": null
}
```

### Estructura Uniforme de Errores y Códigos de Dominio (`CC-XXXX`)
```json
{
  "status": "error",
  "data": null,
  "meta": null,
  "error": {
    "code": "CC-0E15",
    "message": "El código QR escaneado ya se encuentra vinculado a otro lote.",
    "details": "Lote ID #104 verificado en Finca La Esperanza."
  }
}
```

---

## 🛡️ 3. Catálogo Institucional de Errores (`CC-XXXX`)

| Código | Categoría | Descripción | HTTP |
| :--- | :--- | :--- | :--- |
| **`CC-0000`** | `SISTEMA` | Error interno no controlado del servidor | 500 |
| **`CC-0001`** | `AUTENTICACION` | Credenciales inválidas o cuenta inactiva | 401 |
| **`CC-0002`** | `AUTENTICACION` | Token de autenticación ausente o formato inválido | 401 |
| **`CC-0003`** | `AUTENTICACION` | Sesión expirada o revocada | 401 |
| **`CC-0004`** | `SISTEMA` | Recurso no encontrado (404) | 404 |
| **`CC-0005`** | `VALIDACION` | Error de validación de campos / esquema | 422 |
| **`CC-0006`** | `CONFLICTO` | Registro duplicado o clave única ya existente | 409 |
| **`CC-0007`** | `SEGURIDAD` | Límite de tasa excedido temporalmente (Rate Limit) | 429 |
| **`CC-0008`** | `SEGURIDAD` | Origen no permitido por la política CORS | 403 |
| **`CC-0A10`** | `PERMISOS` | El rol actual no tiene autorización para esta acción | 403 |
| **`CC-0E15`** | `SEGURIDAD_QR` | Intento de registro o escaneo de código QR duplicado o ya canjeado | 400 |
| **`CC-0E16`** | `SEGURIDAD_QR` | Apertura de QR interno fuera de destino (Posible fraude en tránsito) | 403 |
| **`CC-0C20`** | `CALIDAD_SCA` | El puntaje total SCA es inferior al mínimo requerido de 80.00 puntos | 422 |
| **`CC-0C21`** | `CALIDAD_FISICA` | Humedad en pergamino seco fuera de rango permitido (10% - 12%) | 422 |
| **`CC-0E24`** | `CALIDAD_TRILLA` | Defecto crítico (sobrehumedad > 12.5% o fenol) en Evaluación 2 | 422 |
| **`CC-0F30`** | `PAGOS` | Intento de autorizar zarpe marítimo sin liquidación del saldo 70%-75% | 400 |
| **`CC-0L40`** | `LOGISTICA` | Capacidad máxima del contenedor virtual excedida | 400 |

---

## 🔒 4. Seguridad Perimetral

1. **Desinfección de Cabeceras (`helmet`):** Protección contra clickjacking, MIME sniffing y vulnerabilidades XSS.
2. **Validación CORS Restrictiva:** Restricción estricta de orígenes autorizados leídos dinámicamente desde el entorno (`allowedOrigins`).
3. **Rate Limiting Multicapa (`express-rate-limit`):**
   - **General:** 100 peticiones cada 15 minutos en toda la API.
   - **Sensible:** 20 peticiones cada 15 minutos en autenticación (`/login`, `/register`), quema de códigos QR (`/canjear-qr-interno`), pedidos y autorización de zarpe.
4. **Protección DDoS y SQL Injection:** Middlewares [`ddosShield.js`](file:///c:/Users/Usuario/Documents/conexCofee/backend/middleware/ddosShield.js) y [`sqlShield.js`](file:///c:/Users/Usuario/Documents/conexCofee/backend/middleware/sqlShield.js).

---

## 🚀 5. Puesta en Marcha

### Prerrequisitos
- Node.js 18+ (Recomendado v20+)
- PostgreSQL 14+ con la base de datos `conex3` (o `conexcoffee`) restaurada.

### Configuración `.env`
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=conex3
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_jwt_secret
```

### Ejecución
```bash
# Modo desarrollo con nodemon
npm run dev

# Ejecutar tests de integración automatizados
node scripts/test-api.js
```
## Ofertas de productores sin cuenta

En `backend`, ejecuta `npm run db:migrate:ofertas-externas` sobre la base configurada antes de usar el formulario `/agregar-producto` y el listado `/empresa/ofertas-libres`. La migración agrega `personas.productores_externos` y `cosechas.ofertas_productores_externos`.

Los enlaces de confirmación y de invitación se envían por Resend. Configura `RESEND`, `EMAIL_FROM` (remitente verificado) y `FRONTEND_URL` (origen del frontend). En producción configura `TURNSTILE_SECRET_KEY` en el backend y `VITE_TURNSTILE_SITE_KEY` en el frontend.

El productor dispone de 24 horas para confirmar su publicación. Las ofertas confirmadas duran 15 días. Una empresa puede reservar al productor mediante una invitación de hasta tres días, limitada por la vigencia de la oferta. Al aceptar, se crean la cuenta y el perfil dentro de la misma transacción. Las demás ofertas de ese productor quedan registradas y salen del listado para nuevas vinculaciones. El backend revisa cada diez minutos las ofertas vencidas para avisar por correo.

## Demostración con Dev Tunnels

1. Inicia el backend con `npm run dev` desde `backend` y el frontend con `npm run dev` desde `frontend`.
2. Reenvía el puerto de Vite (normalmente `5173`) en Dev Tunnels. En `frontend/.env`, configura `DEV_TUNNEL_HOST` con el hostname exacto de ese túnel, sin `https://`, y `VITE_API_BASE_URL=/api`.
3. En `backend/.env`, añade la URL HTTPS completa del túnel a `EXTRA_ALLOWED_ORIGINS`, separada por comas si ya hay otros orígenes. Para enviar enlaces que funcionen fuera de tu máquina, configura `FRONTEND_URL` con esa misma URL pública.
4. Reinicia ambos procesos. Abre `/api/health` desde el dominio del frontend para comprobar que Vite reenvía las peticiones al backend.

El proxy usa `http://127.0.0.1:3001` por defecto. Si el backend escucha en otro puerto, ajusta `API_PROXY_TARGET` en `frontend/.env`. Comparte el túnel de Vite y mantén PostgreSQL (`5432`) en local. Para un despliegue que sirva archivos estáticos, configura `VITE_API_BASE_URL` con la URL de su API o configura el proxy `/api` en el servidor de ese despliegue.
