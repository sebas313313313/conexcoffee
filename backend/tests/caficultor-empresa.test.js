import test from 'node:test';
import assert from 'node:assert/strict';
import CaficultorService from '../modules/caficultores/services/CaficultorService.js';
import Caficultor from '../modules/caficultores/Caficultor.js';
import { sequelize } from '../config/database.js';
import { mapCaficultor } from '../../frontend/src/context/mappers.js';

const empresaId = '11111111-1111-4111-8111-111111111111';
const usuarioId = '22222222-2222-4222-8222-222222222222';

test('la pantalla resuelve la empresa por ID y no por observaciones ni por posición', () => {
  const empresas = [{ id: empresaId, nombre: 'Empresa A' },
    { id: usuarioId, nombre: 'Empresa B' }];
  assert.equal(mapCaficultor({ empresa_exportadora_id: usuarioId,
    observaciones_verificacion: 'Empresa A', empresa: 'Nombre antiguo' }, { empresas }).empresa, 'Empresa B');
  assert.equal(mapCaficultor({ empresa_exportadora_id: null,
    observaciones_verificacion: 'Empresa A' }, { empresas }).empresa, null);
});

test('creación conserva la FK y separa las observaciones de la empresa', async () => {
  const originalQuery = sequelize.query;
  sequelize.query = async () => [[{ rol_principal: 'CAFICULTOR' }]];
  try {
  const transaction = {};
  const service = new CaficultorService({
    existeEmpresa: async (id, options) => {
      assert.equal(id, empresaId);
      assert.equal(options.transaction, transaction);
      return true;
    },
    create: async (payload, options) => {
      assert.equal(options.transaction, transaction);
      return payload;
    },
  });
  const result = await service.create({ usuario_id: usuarioId,
    empresa_exportadora_id: empresaId, empresa: 'Texto antiguo',
    observaciones_verificacion: 'Pendiente documento' }, { transaction });
  assert.equal(result.empresa_exportadora_id, empresaId);
  assert.equal(result.observaciones_verificacion, 'Pendiente documento');
  assert.equal(Object.hasOwn(result, 'empresa'), false);
  } finally { sequelize.query = originalQuery; }
});

test('UUID inválido o empresa inexistente impiden crear el productor', async () => {
  let creates = 0;
  const service = new CaficultorService({
    existeEmpresa: async () => false,
    create: async () => { creates += 1; },
  });
  for (const id of ['Empresa escrita', empresaId, 123]) {
    await assert.rejects(service.create({ empresa_exportadora_id: id }, { transaction: {} }),
      (error) => error.statusCode === 422);
  }
  assert.equal(creates, 0);
});

test('edición permite reasignar u omitir la FK, pero no desvincular una empresa obligatoria', async () => {
  const service = new CaficultorService({
    existeEmpresa: async () => true,
    findById: async () => ({ id: usuarioId }),
    update: async (_id, payload) => payload,
  });
  assert.equal((await service.update(usuarioId, { empresa_exportadora_id: empresaId })).empresa_exportadora_id, empresaId);
  for (const empresa of [null, '']) {
    await assert.rejects(service.update(usuarioId, { empresa_exportadora_id: empresa }),
      (error) => error.statusCode === 422);
  }
  assert.equal(Object.hasOwn(await service.update(usuarioId, { telefono: '3101234567' }), 'empresa_exportadora_id'), false);
});

test('crear sin empresa se rechaza antes de crear la cuenta', async () => {
  const service = new CaficultorService({});
  for (const empresa of [undefined, null, '']) {
    await assert.rejects(service.create({ empresa_exportadora_id: empresa }, { transaction: {} }),
      (error) => error.statusCode === 422);
  }
});

test('el modelo conserva dirección e historia y valida los límites del SQL', async () => {
  const originalQuery = sequelize.query;
  sequelize.query = async () => [[{ rol_principal: 'CAFICULTOR' }]];
  try {
  const payload = {
    usuario_id: usuarioId, empresa_exportadora_id: empresaId, tipo_documento: 'CE',
    numero_documento: '123456', nombres: 'MARÍA ELENA', apellidos: 'PÉREZ LÓPEZ',
    telefono_movil: '3101234567', departamento: 'Huila', municipio: 'Pitalito',
    direccion: 'Vereda El Mirador', historia: 'Productora desde 2010.',
    fecha_nacimiento: '1990-06-15', genero: 'Femenino',
    url_documento_identidad: 'https://example.test/identidad.pdf', url_rut: null,
  };
  const service = new CaficultorService({
    existeEmpresa: async () => true,
    create: async (data) => {
      const record = Caficultor.build(data);
      await record.validate();
      return record.toJSON();
    },
  });
  const stored = await service.create(payload, { transaction: {} });
  const shown = mapCaficultor(stored);
  assert.equal(stored.direccion, payload.direccion);
  assert.equal(stored.historia, payload.historia);
  assert.equal(shown.direccion, payload.direccion);
  assert.equal(shown.historia, payload.historia);
  assert.equal(stored.fecha_nacimiento, payload.fecha_nacimiento);
  assert.equal(stored.genero, payload.genero);
  assert.equal(shown.fecha_nacimiento, payload.fecha_nacimiento);
  assert.equal(shown.genero, payload.genero);
  const defaults = Caficultor.build({ ...payload, fecha_nacimiento: null, genero: undefined });
  await defaults.validate();
  assert.equal(defaults.fecha_nacimiento, null);
  assert.equal(defaults.genero, 'Masculino');
  assert.equal(stored.nombres, payload.nombres);
  assert.equal(stored.apellidos, payload.apellidos);
  await assert.rejects(Caficultor.build({ ...payload, direccion: 'x'.repeat(81) }).validate());
  await assert.rejects(Caficultor.build({ ...payload, historia: 'x'.repeat(801) }).validate());
  await assert.rejects(Caficultor.build({ ...payload, tipo_documento: 'OTRO' }).validate());
  } finally { sequelize.query = originalQuery; }
});

test('el mapper no inventa datos personales cuando faltan en la respuesta', () => {
  const result = mapCaficultor({ direccion: null, historia: null });
  assert.equal(result.direccion, '');
  assert.equal(result.historia, '');
  assert.equal(result.correo, '');
  assert.equal(result.fincasCount, 0);
  assert.equal(Object.hasOwn(result, 'fechaNacimiento'), false);
  assert.equal(result.fecha_nacimiento, null);
  assert.equal(result.genero, '');
});

test('la creación de cuenta comparte transacción y el fallo de perfil se propaga', async () => {
  const originalQuery = sequelize.query;
  const originalTransaction = sequelize.transaction;
  const transaction = {};
  let transactionFailed = false;
  let queries = 0;
  sequelize.transaction = async (callback) => {
    try { return await callback(transaction); }
    catch (error) { transactionFailed = true; throw error; }
  };
  sequelize.query = async (_sql, options) => {
    assert.equal(options.transaction, transaction);
    queries += 1;
    return queries === 1 ? [[], {}] : [[{ id: usuarioId }], {}];
  };
  try {
    const service = new CaficultorService({
      existeEmpresa: async () => true,
      create: async (_payload, options) => {
        assert.equal(options.transaction, transaction);
        throw new Error('Perfil rechazado');
      },
    });
    await assert.rejects(service.create({ empresa_exportadora_id: empresaId,
      correo: 'productor@example.test', password: 'test-password' }), /Perfil rechazado/);
    assert.equal(queries, 2);
    assert.equal(transactionFailed, true);
  } finally {
    sequelize.query = originalQuery;
    sequelize.transaction = originalTransaction;
  }
});
