import test from 'node:test';
import assert from 'node:assert/strict';
import { BrokerService } from '../modules/brokers/Broker.js';
import { sequelize } from '../config/database.js';
const companyId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const actor = { id: '33333333-3333-4333-8333-333333333333', rol_principal: 'EMPRESA_EXPORTADORA' };

test('creación vincula la empresa de la sesión e ignora IDs del cliente', async () => {
  const original = sequelize.query;
  sequelize.query = async () => [[{ id: companyId }]];
  try {
    const service = new BrokerService({});
    service.create = async (payload) => payload;
    const result = await service.createForActor(actor, { nombre_empresa: 'Broker A', empresa_exportadora_is: otherId, usuario_id: otherId });
    assert.equal(result.empresa_exportadora_is, companyId);
    assert.equal(Object.hasOwn(result, 'usuario_id'), false);
  } finally { sequelize.query = original; }
});

test('la lista filtra por empresa autenticada', async () => {
  const original = sequelize.query;
  sequelize.query = async () => [[{ id: companyId }]];
  try {
    const service = new BrokerService({ findAll: async ({ where }) => {
      assert.deepEqual(where, { empresa_exportadora_is: companyId });
      return { rows: [], meta: {} };
    } });
    assert.deepEqual((await service.listForActor(actor, {})).data, []);
  } finally { sequelize.query = original; }
});

test('una empresa no edita brokers ajenos', async () => {
  const original = sequelize.query;
  sequelize.query = async () => [[{ id: companyId }]];
  try {
    const service = new BrokerService({ findById: async () => ({ empresa_exportadora_is: otherId }) });
    await assert.rejects(service.updateForActor(actor, 'broker', { nombre_empresa: 'Otro' }), (error) => error.statusCode === 403);
  } finally { sequelize.query = original; }
});
