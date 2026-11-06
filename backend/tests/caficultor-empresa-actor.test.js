import test from 'node:test';
import assert from 'node:assert/strict';
import CaficultorService from '../modules/caficultores/services/CaficultorService.js';
import { sequelize } from '../config/database.js';
const empresaId = '11111111-1111-4111-8111-111111111111';
const otraEmpresa = '22222222-2222-4222-8222-222222222222';
const actor = { id: '33333333-3333-4333-8333-333333333333', rol_principal: 'EMPRESA_EXPORTADORA' };

test('la creación usa la empresa de la sesión e ignora IDs ajenos', async () => {
  const original = sequelize.query;
  sequelize.query = async () => [[{ id: empresaId }]];
  try {
    const service = new CaficultorService({});
    service.create = async (payload) => payload;
    const result = await service.createForActor(actor, { empresa_exportadora_id: otraEmpresa, usuario_id: otraEmpresa, nombres: 'Ana' });
    assert.equal(result.empresa_exportadora_id, empresaId);
    assert.equal(Object.hasOwn(result, 'usuario_id'), false);
  } finally { sequelize.query = original; }
});

test('la empresa solo lista caficultores vinculados a ella', async () => {
  const original = sequelize.query;
  sequelize.query = async () => [[{ id: empresaId }]];
  try {
    const service = new CaficultorService({ findAll: async ({ where }) => {
      assert.deepEqual(where, { empresa_exportadora_id: empresaId });
      return { rows: [], meta: {} };
    } });
    assert.deepEqual((await service.listForActor(actor, {})).data, []);
  } finally { sequelize.query = original; }
});

test('la empresa no edita caficultores de otra empresa', async () => {
  const original = sequelize.query;
  sequelize.query = async () => [[{ id: empresaId }]];
  try {
    const service = new CaficultorService({ findById: async () => ({ empresa_exportadora_id: otraEmpresa }) });
    await assert.rejects(service.updateForActor(actor, 'caficultor', { nombres: 'Otro' }), (error) => error.statusCode === 403);
  } finally { sequelize.query = original; }
});
