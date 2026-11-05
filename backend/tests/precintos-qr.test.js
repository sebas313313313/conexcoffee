import test from 'node:test';
import assert from 'node:assert/strict';
import { InventarioPrecintoQrService } from '../modules/inventario_precintos_qr/services/InventarioPrecintoQrService.js';
import { sequelize } from '../config/database.js';
import Preoferta from '../modules/preofertas/Preoferta.js';
import SacoCafe from '../modules/sacos_cafe/SacoCafe.js';
const empresaId = '11111111-1111-4111-8111-111111111111';
const tecnicoId = '22222222-2222-4222-8222-222222222222';
const actor = { id: '33333333-3333-4333-8333-333333333333', rol_principal: 'EMPRESA_EXPORTADORA' };

test('genera 500 precintos propios con tokens y seriales únicos', async () => {
  const originalTx = sequelize.transaction;
  const originalQuery = sequelize.query;
  const originalUrl = process.env.FRONTEND_URL;
  sequelize.transaction = async (fn) => fn({});
  sequelize.query = async () => [[{ id: empresaId }]];
  process.env.FRONTEND_URL = 'https://example.test';
  try {
    const service = new InventarioPrecintoQrService({ model: { bulkCreate: async (items) => {
      assert.equal(items.length, 500);
      assert.equal(new Set(items.map((p) => p.codigo_suncho_precinto)).size, 500);
      assert.equal(new Set(items.map((p) => p.token_qr_externo)).size, 500);
      assert.equal(new Set(items.map((p) => p.token_qr_interno)).size, 500);
      assert.ok(items.every((p) => /^GEN-[0-9a-f-]{36}$/.test(p.codigo_lote_fabricacion)));
      assert.equal(new Set(items.map((p) => p.codigo_lote_fabricacion)).size, 1);
      assert.ok(items.every((p) => p.empresa_id === empresaId && p.estado === 'EN_BODEGA_EMPRESA'));
      assert.ok(items.every((p) => p.url_publica_trazabilidad === `https://example.test/trazabilidad/${p.token_qr_externo}`));
      return items;
    } } });
    assert.equal((await service.crearLote(actor, { cantidad: 500 })).cantidad, 500);
    await assert.rejects(service.crearLote(actor, { cantidad: 501 }), (error) => error.statusCode === 422);
  } finally {
    sequelize.transaction = originalTx;
    sequelize.query = originalQuery;
    if (originalUrl === undefined) delete process.env.FRONTEND_URL; else process.env.FRONTEND_URL = originalUrl;
  }
});

test('la oferta aparece vacía hasta que el técnico vincula el saco', async () => {
  const originalQuery = sequelize.query;
  let vinculos = [];
  sequelize.query = async (sql) => sql.includes('personas.empresas_exportadoras')
    ? [[{ id: empresaId }]] : [vinculos];
  const service = new InventarioPrecintoQrService({
    findAll: async () => ({ rows: [{ id: 'precinto-1', estado: 'EN_CUSTODIA_TECNICO' }], meta: {} }),
  });
  try {
    assert.equal((await service.listar(actor)).data[0].codigo_oferta, null);
    vinculos = [{ precinto_id: 'precinto-1', codigo_preoferta: 'OF-123' }];
    assert.equal((await service.listar(actor)).data[0].codigo_oferta, 'OF-123');
  } finally { sequelize.query = originalQuery; }
});

test('no entrega precintos a técnicos de otra empresa', async () => {
  const originalTx = sequelize.transaction;
  const originalQuery = sequelize.query;
  sequelize.transaction = async (fn) => fn({ LOCK: { UPDATE: 'UPDATE' } });
  let calls = 0;
  sequelize.query = async () => (++calls === 1 ? [[{ id: empresaId }]] : [[]]);
  try {
    const service = new InventarioPrecintoQrService({ model: { findAll: async () => { throw Error('No debe leer precintos'); } } });
    await assert.rejects(service.entregarLote(actor, { precinto_ids: [empresaId], asistente_tecnico_id: tecnicoId }), (error) => error.statusCode === 422);
  } finally { sequelize.transaction = originalTx; sequelize.query = originalQuery; }
});

test('un técnico no vincula un precinto sin custodia', async () => {
  const originalTx = sequelize.transaction;
  sequelize.transaction = async (fn) => fn({ LOCK: { UPDATE: 'UPDATE' } });
  try {
    const service = new InventarioPrecintoQrService({ model: { findOne: async () => null } });
    service.tecnicoDe = async () => ({ id: tecnicoId, empresa_id: empresaId });
    await assert.rejects(service.vincularSaco({ rol_principal: 'ASISTENTE_TECNICO' }, {
      token_qr_externo: empresaId, preoferta_id: tecnicoId, peso_neto_kg: 70,
    }), (error) => error.statusCode === 422);
  } finally { sequelize.transaction = originalTx; }
});


test('el escaneo vincula una sola vez el precinto al saco de la preoferta', async () => {
  const oldTx = sequelize.transaction;
  const oldPreoferta = Preoferta.findOne;
  const oldMax = SacoCafe.max;
  const oldCreate = SacoCafe.create;
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };
  sequelize.transaction = async (callback) => callback(transaction);
  let estado = 'EN_CUSTODIA_TECNICO';
  let guardado;
  Preoferta.findOne = async ({ where }) => {
    assert.equal(where.empresa_aliada_asignada_id, empresaId);
    return { id: tecnicoId };
  };
  SacoCafe.max = async () => '2';
  SacoCafe.create = async (payload) => { guardado = payload; return { id: 'saco-3' }; };
  try {
    const service = new InventarioPrecintoQrService({ model: { findOne: async () =>
      ({ id: 'precinto-1', estado, update: async ({ estado: nuevo }) => { estado = nuevo; } }) } });
    service.tecnicoDe = async () => ({ id: tecnicoId, empresa_id: empresaId });
    const result = await service.vincularSaco({ rol_principal: 'ASISTENTE_TECNICO' }, {
      token_qr_externo: empresaId, preoferta_id: tecnicoId, peso_neto_kg: 70,
    });
    assert.equal(result.numero_saco_consecutivo, 3);
    assert.equal(guardado.precinto_id, 'precinto-1');
    assert.equal(estado, 'VINCULADO_A_SACO');
    await assert.rejects(service.vincularSaco({ rol_principal: 'ASISTENTE_TECNICO' }, {
      token_qr_externo: empresaId, preoferta_id: tecnicoId, peso_neto_kg: 70,
    }), (error) => error.statusCode === 422);
  } finally {
    sequelize.transaction = oldTx;
    Preoferta.findOne = oldPreoferta;
    SacoCafe.max = oldMax;
    SacoCafe.create = oldCreate;
  }
});
