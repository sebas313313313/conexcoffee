# Vinculación de caficultores con empresas en conex5

El contrato de creación y edición es `empresa_exportadora_id: UUID | null`.
Se presupone una empresa por caficultor y varios caficultores por empresa.
`null` conserva la opción "Sin asignar". Para varias empresas simultáneas por
productor haría falta una tabla intermedia en lugar de esta columna.

## Orden de preparación

1. Crear/restaurar la estructura base de conex5. El SQL adjunto no crea el resto
   de esquemas o tablas de la aplicación.
2. Ejecutar `001_caficultor_empresa.sql` conectado explícitamente a conex5.
   Ejemplo: `psql -h localhost -U TU_USUARIO -d conex5 -v ON_ERROR_STOP=1 -f migrations/001_caficultor_empresa.sql`
   desde la carpeta backend; también puede ejecutarse desde pgAdmin.
3. Cambiar `DB_NAME=conex5` en el entorno del backend y reiniciar el proceso.
4. Cargar la semilla con `npm run db:seed`. Su inserción de caficultores ahora
   utiliza el ID real de la empresa creada previamente.

La migración está preparada, no se ejecuta automáticamente al arrancar.
No se modificó `.env` ni se ejecutó la semilla durante este cambio.

## Por qué hacen falta estos cambios

- La FK impide guardar empresas inexistentes, incluso al escribir directamente
  en PostgreSQL. La validación del backend permite informar el error antes de
  crear una cuenta de usuario.
- `ON DELETE RESTRICT` evita borrar una empresa que todavía tiene productores;
  primero deben desvincularse o reasignarse explícitamente.
- `ON UPDATE CASCADE` mantiene la referencia si se modifica la PK de la empresa.
- El índice permite buscar productores por empresa sin recorrer toda la tabla.
- No se aplica `UNIQUE` a la FK: una empresa puede tener muchos productores.
- `observaciones_verificacion` deja de representar una empresa. No se convierten
  textos antiguos automáticamente porque los nombres pueden ser ambiguos.
- La creación de usuario y productor usa la misma transacción para evitar cuentas
  huérfanas cuando falla la creación del perfil.

La empresa vinculada al productor y `empresa_aliada_asignada_id` de una preoferta
son relaciones distintas: este cambio no reasigna ofertas existentes.

## Comprobación funcional después de preparar la base

Crear dos empresas, registrar un productor seleccionando una de ellas y comprobar:

```sql
SELECT c.id, c.nombres, c.empresa_exportadora_id, e.razon_social
FROM personas.caficultores c
LEFT JOIN personas.empresas_exportadoras e ON e.id = c.empresa_exportadora_id;
```

Recargar la pantalla, editar a la otra empresa y después seleccionar "Sin asignar".
Un UUID inexistente debe devolver 422; un fallo de guardado debe mantener abierto
el formulario y mostrar el error real. El catálogo recorre todas las páginas de
empresas y ya no agrega nombres ficticios.

Pruebas de servicio sin base: `node --test tests/caficultor-empresa.test.js`.
Estas pruebas no sustituyen la comprobación de la FK sobre conex5.

## Web Push

Ejecutar `002_web_push.sql` sobre la misma base configurada en `backend/.env` antes de activar notificaciones. La migración crea `acceso.suscripciones_web_push`, vinculada a `acceso.usuarios_sistema`, y permite varias suscripciones por usuario (una por navegador/dispositivo). No se ejecuta automáticamente al iniciar el servidor.

Después de aplicar la migración, reiniciar el backend. La campana del encabezado permite activar o desactivar las notificaciones en un navegador compatible. Web Push requiere HTTPS o `localhost` y permiso del navegador. La ruta autenticada `POST /api/web-push/test` envía una notificación de prueba solo al usuario de la sesión actual.

## Brokers vinculados a empresas

Ejecutar `003_broker_empresa.sql` en la base de datos del backend antes de usar el registro de brokers desde el rol empresa. La columna conserva el nombre `empresa_exportadora_is` del SQL entregado. El backend toma la empresa desde el usuario autenticado; el formulario no envía ese ID. Los brokers existentes quedan sin empresa (`NULL`) hasta que se asignen mediante una migración de datos comprobada. La lista del rol empresa muestra solo sus brokers; el administrador conserva la vista general.

## Inventario de precintos QR

La empresa crea de 1 a 500 precintos desde `/empresa/precintos`, imprime los QR externos por páginas de hasta 100 y entrega los seleccionados a un asistente técnico activo de su empresa. No indica un lote de café: `codigo_lote_fabricacion` es una referencia interna de generación obligatoria por el esquema y se asigna automáticamente. La oferta vinculada aparece vacía hasta que el técnico escanea el QR en `/tecnico/precintos` y lo vincula a un saco y una preoferta de la misma empresa. El backend asigna serial, token externo e interno, propietario y estado; el navegador no puede elegir estos valores. Los QR dañados se anulan con motivo y no se pueden reutilizar.

En producción hay que configurar `FRONTEND_URL` con la URL pública absoluta del frontend (por ejemplo, `https://conexcoffee.ejemplo.com`). Los QR nuevos abren `/trazabilidad/:token`; la impresión desde la página de empresa usa el origen actual del frontend también para precintos creados antes de este cambio. Los QR antiguos que apuntan al endpoint JSON redirigen a la página nueva cuando se abren en un navegador. Un visitante sin sesión que escanea un precinto todavía sin saco vuelve a la página principal. Cuando ya está vinculado, la ficha pública muestra datos de café, origen, precio esperado y nombre/correo del productor; el AT y el laboratorio reciben acciones adicionales, comprobadas por el backend. El código de preoferta identifica la oferta comercial; el esquema actual no enlaza directamente una preoferta con un lote de cultivo concreto, por lo que no se muestra un nombre de lote que podría ser incorrecto. Para escanear con cámara se requiere un navegador compatible con `BarcodeDetector` y HTTPS o localhost. Siempre queda disponible el ingreso manual o con lector externo. La tabla `logistica.inventario_precintos_qr` y `logistica.sacos_cafe` deben existir en la base de datos.
