# Providers por rol

Los ocho Providers de rol conservan su interfaz pública para los hooks existentes.
Cada Provider compone tres responsabilidades dentro de su propia carpeta:

- `data.js`: estado inicial, endpoints, dependencias por pantalla y transformación de respuestas.
- `actions.js`: operaciones y actualizaciones de las colecciones mediante setters funcionales.
- `summary.js`: indicadores derivados del estado, cuando el rol los necesita.

Los cálculos y el valor del contexto se memoizan en el Provider. Las peticiones
siguen pasando por la instancia central de Axios; no se realizan en páginas.
Auth y Landing mantienen sus Providers independientes.

## Carga por pantalla

`shared/useRoleData.js` conecta el Provider con su ruta actual y con una instancia
privada de `roleDataController`. `routes` declara los recursos necesarios para
listar registros **y** completar los formularios y relaciones de esa pantalla.
Una lista vacía significa que la pantalla no necesita colecciones remotas.
Las rutas sin declaración usan `allSources`, como los dashboards generales.

Al agregar una ruta o consumir otra colección en una pantalla, revisar su lista
en `data.js`. Los mappers reciben arrays vacíos para recursos no solicitados.
Las colecciones que no se usan en la pantalla no deben interpretarse como una
caché global: se vuelven a cargar al entrar en una pantalla que las requiera.

El controlador agrupa los cambios de carga en un único snapshot, comparte
recargas simultáneas de la misma pantalla y cancela solicitudes al cambiar de
grupo o desmontar. Ignora respuestas anteriores aunque el cliente HTTP resuelva
una solicitud cancelada. Una revisión por colección impide sobrescribir una
mutación que terminó durante una carga, sin interrumpir las demás colecciones.
El estado se mantiene dentro de cada Provider, sin caché compartida entre roles.

Este refactor conserva los contratos existentes de Axios y los datos locales
de Broker; no cambia los endpoints ni introduce otra biblioteca de estado.

## Verificación

Desde `frontend`:

```sh
node --test tests/providers.test.js
npm run lint
npm run build
npm run doctor
```

Las pruebas verifican dependencias por pantalla, equivalencia de las relaciones
con una carga completa, aislamiento, recargas, cancelación y mutaciones durante
una petición pendiente.
