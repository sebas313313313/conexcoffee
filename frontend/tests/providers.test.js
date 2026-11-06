import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoleDataController } from '../src/context/shared/roleDataController.js';
import { readRoleCollection } from '../src/context/shared/readRoleCollection.js';
import { superAdminData } from '../src/context/superadmin/data.js';
import { empresaData } from '../src/context/empresa/data.js';
import { laboratorioData } from '../src/context/laboratorio/data.js';
import { caficultorData } from '../src/context/caficultor/data.js';
import { catadorData } from '../src/context/catador/data.js';
import { compradorData } from '../src/context/comprador/data.js';
import { tecnicoData } from '../src/context/tecnico/data.js';
import { brokerData } from '../src/context/broker/data.js';
import { selectSuperAdminSummary } from '../src/context/superadmin/summary.js';
import { selectEmpresaSummary } from '../src/context/empresa/summary.js';
import { selectLaboratorioSummary } from '../src/context/laboratorio/summary.js';
import { selectCatadorSummary } from '../src/context/catador/summary.js';
import { selectCompradorSummary } from '../src/context/comprador/summary.js';
import { selectTecnicoSummary } from '../src/context/tecnico/summary.js';
import { selectBrokerSummary } from '../src/context/broker/summary.js';

const roles = [
  [superAdminData, selectSuperAdminSummary],
  [empresaData, selectEmpresaSummary],
  [laboratorioData, selectLaboratorioSummary],
  [caficultorData, () => ({})],
  [catadorData, selectCatadorSummary],
  [compradorData, selectCompradorSummary],
  [tecnicoData, selectTecnicoSummary],
  [brokerData, selectBrokerSummary],
];

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const definition = {
  createInitialState: () => ({ items: [], auxiliary: [], preferences: { currency: 'USD' } }),
  endpoints: { items: '/items', auxiliary: '/auxiliary' },
  select: ({ items, auxiliary }) => ({ items, auxiliary }),
};

test('cada pantalla carga únicamente sus endpoints declarados y permite calcular sus resúmenes', async () => {
  for (const [config, summary] of roles) {
    for (const [route, sources] of Object.entries({ ...config.routes, dashboard: config.allSources })) {
      const requested = [];
      const controller = createRoleDataController(config, async (url) => {
        requested.push(url);
        return [];
      });
      assert.equal(new Set(sources).size, sources.length, route);
      for (const source of sources) assert.ok(config.endpoints[source], `${route}: ${source}`);
      await controller.load(route, sources);
      assert.deepEqual(requested.sort(), sources.map((source) => config.endpoints[source]).sort(), route);
      assert.equal(controller.getSnapshot().error, null, route);
      assert.equal(controller.getSnapshot().loading, false, route);
      assert.doesNotThrow(() => summary(controller.getSnapshot().data), route);
    }
  }
});

test('brokers carga tres recursos en vez de quince y blog/configuración no consultan colecciones', async () => {
  const requested = [];
  const request = async (url) => { requested.push(url); return []; };
  const empresa = createRoleDataController(empresaData, request);
  await empresa.load('brokers', empresaData.routes['/empresa/brokers']);
  assert.deepEqual(requested.sort(), ['/brokers', '/pedidos-internacionales', '/usuarios-sistema']);
  const admin = createRoleDataController(superAdminData, request);
  await admin.load('blog', superAdminData.routes['/superadmin/blog']);
  await admin.load('settings', superAdminData.routes['/superadmin/settings']);
  assert.equal(requested.length, 3);
});

test('dos recargas simultáneas de la misma pantalla comparten la petición', async () => {
  const pending = deferred();
  let requests = 0;
  const controller = createRoleDataController(definition, () => { requests += 1; return pending.promise; });
  const first = controller.load('items', ['items']);
  const second = controller.load('items', ['items']);
  assert.equal(first, second);
  pending.resolve([{ id: 1 }]);
  await first;
  assert.equal(requests, 1);
  assert.deepEqual(controller.getSnapshot().data.items, [{ id: 1 }]);
});

test('cambiar de pantalla cancela la petición anterior e ignora respuestas tardías', async () => {
  const first = deferred();
  const second = deferred();
  const signals = [];
  const controller = createRoleDataController(definition, (url, signal) => {
    signals.push(signal);
    return url === '/items' ? first.promise : second.promise;
  });
  const oldLoad = controller.load('old', ['items']);
  const newLoad = controller.load('new', ['auxiliary']);
  assert.equal(signals[0].aborted, true);
  second.resolve([{ id: 'new' }]);
  await newLoad;
  first.resolve([{ id: 'old' }]);
  await oldLoad;
  assert.equal(controller.getSnapshot().scope, 'new');
  assert.deepEqual(controller.getSnapshot().data.auxiliary, [{ id: 'new' }]);
  assert.deepEqual(controller.getSnapshot().data.items, []);
});

test('desmontar impide publicaciones tardías y permite un nuevo montaje', async () => {
  const pending = deferred();
  const controller = createRoleDataController(definition, () => pending.promise);
  let notifications = 0;
  const unsubscribe = controller.subscribe(() => { notifications += 1; });
  const request = controller.load('items', ['items']);
  controller.cancel();
  unsubscribe();
  pending.resolve([{ id: 1 }]);
  await request;
  assert.equal(notifications, 1);
  assert.deepEqual(controller.getSnapshot().data.items, []);
  await controller.load('items', ['items']);
  assert.deepEqual(controller.getSnapshot().data.items, [{ id: 1 }]);
});

test('una carga pendiente no pisa una mutación y sí completa las otras colecciones', async () => {
  const pending = deferred();
  const controller = createRoleDataController(definition, () => pending.promise);
  const request = controller.load('all', ['items', 'auxiliary']);
  controller.setters.setItems((previous) => [...previous, { id: 'saved' }]);
  pending.resolve([{ id: 'server-before-save' }]);
  await request;
  assert.deepEqual(controller.getSnapshot().data.items, [{ id: 'saved' }]);
  assert.deepEqual(controller.getSnapshot().data.auxiliary, [{ id: 'server-before-save' }]);
  assert.equal(controller.getSnapshot().loading, false);
});

test('los errores liberan la carga, conservan el estado y permiten reintentar', async () => {
  let fail = true;
  const controller = createRoleDataController(definition, async () => {
    if (fail) throw new Error('Falló la carga');
    return [{ id: 2 }];
  });
  controller.setters.setItems([{ id: 1 }]);
  await controller.load('items', ['items']);
  assert.equal(controller.getSnapshot().error, 'Falló la carga');
  assert.equal(controller.getSnapshot().loading, false);
  assert.deepEqual(controller.getSnapshot().data.items, [{ id: 1 }]);
  fail = false;
  await controller.load('items', ['items']);
  assert.equal(controller.getSnapshot().error, null);
  assert.deepEqual(controller.getSnapshot().data.items, [{ id: 2 }]);
});

test('cada instancia mantiene su propio estado y preserva configuración al navegar', async () => {
  const first = createRoleDataController(definition, async () => []);
  const second = createRoleDataController(definition, async () => []);
  first.setters.setPreferences({ currency: 'COP' });
  await first.load('items', ['items']);
  assert.deepEqual(first.getSnapshot().data.preferences, { currency: 'COP' });
  assert.deepEqual(second.getSnapshot().data.preferences, { currency: 'USD' });
});

test('las cargas parciales conservan los datos y relaciones que consume cada pantalla', () => {
  const record = {
    id: 1, usuario_id: 1, caficultor_id: 1, finca_id: 1, lote_id: 1, lote_cultivo_id: 1,
    variedad_id: 1, variedad_cafe_id: 1, preoferta_id: 1, laboratorio_id: 1, catador_id: 1,
    contenedor_id: 1, comprador_id: 1, broker_id: 1,
    nombres: 'Ana', apellidos: 'Prueba', nombre_finca: 'Finca Prueba', nombre_variedad: 'Castillo',
    razon_social: 'Empresa Prueba', nombre_comercial: 'Empresa Prueba',
    correo_electronico: 'prueba@example.test', fecha_creacion: '2026-01-01',
  };
  const cases = [
    [superAdminData, '/superadmin/caficultores', ['caficultores', 'empresas']],
    [superAdminData, '/superadmin/catadores', ['catadores']],
    [superAdminData, '/superadmin/empresas', ['empresas']],
    [superAdminData, '/superadmin/tecnicos', ['tecnicos']],
    [superAdminData, '/superadmin/laboratorios', ['laboratorios']],
    [superAdminData, '/superadmin/brokers', ['brokers']],
    [superAdminData, '/superadmin/compradores', ['compradores']],
    [superAdminData, '/superadmin/fincas', ['fincas', 'lotes']],
    [superAdminData, '/superadmin/ofertas', ['ofertas']],
    [superAdminData, '/superadmin/muestras', ['muestras', 'laboratorios']],
    [superAdminData, '/superadmin/contenedores', ['contenedores']],
    [superAdminData, '/superadmin/compras', ['compras']],
    [empresaData, '/empresa/brokers', ['brokers']],
    [empresaData, '/empresa/caficultores', ['caficultores']],
    [empresaData, '/empresa/laboratorios', ['laboratorios']],
    [empresaData, '/empresa/tecnicos', ['tecnicos']],
    [empresaData, '/empresa/pre-ofertas', ['preofertas']],
    [empresaData, '/empresa/ofertas-libres', ['ofertasLibres']],
    [empresaData, '/empresa/ofertas', ['preofertas', 'ofertas', 'tecnicos', 'contenedores']],
    [empresaData, '/empresa/muestras', ['muestras', 'laboratorios']],
    [empresaData, '/empresa/contenedores', ['contenedores', 'ofertas', 'brokers']],
    [empresaData, '/empresa/precintos', ['tecnicos']],
    [tecnicoData, '/tecnico/precintos', ['preofertas']],
    [caficultorData, '/caficultor/fincas', ['fincas']],
    [caficultorData, '/caficultor/lotes', ['lotes', 'fincas', 'variedades']],
    [caficultorData, '/caficultor/pre-ofertas', ['preofertas', 'fincas', 'lotes', 'variedades']],
    [caficultorData, '/caficultor/ofertas', ['ofertas']],
    [laboratorioData, '/laboratorio/catadores', ['catadores']],
    [laboratorioData, '/laboratorio/analisis-fisico', ['analisisFisicos']],
    [laboratorioData, '/laboratorio/muestras', ['muestras']],
    [laboratorioData, '/laboratorio/resultados', ['resultados']],
    [laboratorioData, '/laboratorio/analisis-sensorial', ['analisisSensoriales']],
    [laboratorioData, '/laboratorio/hojas-catacion', ['hojasCatacion']],
    [brokerData, '/broker/contenedores', ['contenedores']],
  ];
  for (const [config, route, fields] of cases) {
    const fullRaw = Object.fromEntries(config.allSources.map((key) => [key, [{ ...record }]]));
    const partialRaw = Object.fromEntries(config.allSources.map((key) => [key,
      config.routes[route].includes(key) ? fullRaw[key] : [],
    ]));
    const initial = config.createInitialState();
    const full = config.select(fullRaw, initial);
    const partial = config.select(partialRaw, initial);
    for (const field of fields) assert.deepEqual(partial[field], full[field], `${route}: ${field}`);
  }
});

test('el catálogo requerido de empresas recorre todas sus páginas con la misma señal', async () => {
  const signal = new AbortController().signal;
  const pages = [];
  const client = { get: async (url, options) => {
    assert.equal(url, '/empresas-exportadoras');
    assert.equal(options.strictResponse, true);
    assert.equal(options.signal, signal);
    pages.push(options.params.page);
    return { data: [{ id: options.params.page }], meta: { totalPages: 3 } };
  } };
  const records = await readRoleCollection(client, superAdminData.endpoints.rawEmpresas, signal);
  assert.deepEqual(pages, [1, 2, 3]);
  assert.deepEqual(records, [{ id: 1 }, { id: 2 }, { id: 3 }]);
});

test('el lector propaga errores de catálogos requeridos y conserva el fallback opcional', async () => {
  const signal = new AbortController().signal;
  const client = { get: async () => { throw new Error('Sin acceso'); } };
  await assert.rejects(readRoleCollection(client, superAdminData.endpoints.rawEmpresas, signal), /Sin acceso/);
  assert.deepEqual(await readRoleCollection(client, '/opcional', signal), []);
});

test('cancelar un catálogo paginado evita solicitar las siguientes páginas', async () => {
  const controller = new AbortController();
  let calls = 0;
  const client = { get: async () => {
    calls += 1;
    controller.abort();
    return { data: [{ id: 1 }], meta: { totalPages: 4 } };
  } };
  await assert.rejects(readRoleCollection(client, superAdminData.endpoints.rawEmpresas, controller.signal), { name: 'AbortError' });
  assert.equal(calls, 1);
});
