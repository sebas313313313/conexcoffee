import test from 'node:test';
import assert from 'node:assert/strict';
import { sequelize } from '../config/database.js';
import TrazabilidadEscaneoRepository from '../modules/trazabilidad_escaneos/repository/TrazabilidadEscaneoRepository.js';
import TrazabilidadEscaneoService from '../modules/trazabilidad_escaneos/services/TrazabilidadEscaneoService.js';
import EvaluacionFisica from '../modules/evaluaciones_fisicas/EvaluacionFisica.js';

const token = '11111111-1111-4111-8111-111111111111';
const empresaId = '22222222-2222-4222-8222-222222222222';
const tecnicoId = '33333333-3333-4333-8333-333333333333';

test('la ficha pública solo existe después de vincular un saco', async () => {
  const originalQuery = sequelize.query;
  let vinculada = false;
  sequelize.query = async (sql) => {
    assert.match(sql, /JOIN logistica\.sacos_cafe/);
    assert.match(sql, /q\.estado = 'VINCULADO_A_SACO'/);
    assert.doesNotMatch(sql, /SELECT \*|hash_contrasena|telefono_movil/);
    return [vinculada ? [{ serial: 'PX-1', variedad: 'Caturra' }] : []];
  };
  try {
    const service = new TrazabilidadEscaneoService(new TrazabilidadEscaneoRepository());
    await assert.rejects(service.obtenerFichaPublica(token), (error) => error.statusCode === 404);
    vinculada = true;
    assert.equal((await service.obtenerFichaPublica(token)).variedad, 'Caturra');
  } finally { sequelize.query = originalQuery; }
});

test('un AT solo accede al flujo de los precintos bajo su custodia', async () => {
  const originalQuery = sequelize.query;
  sequelize.query = async (sql) => sql.includes('FROM logistica.inventario_precintos_qr q')
    ? [[{ id: token, empresa_id: empresaId, asistente_tecnico_id: token, estado: 'EN_CUSTODIA_TECNICO' }]]
    : [[{ id: tecnicoId }]];
  try {
    const service = new TrazabilidadEscaneoService({});
    await assert.rejects(service.obtenerFlujo(token, { id: tecnicoId, rol_principal: 'ASISTENTE_TECNICO' }),
      (error) => error.statusCode === 404);
  } finally { sequelize.query = originalQuery; }
});

test('el laboratorio registra el análisis con su identidad y la oferta del QR', async () => {
  const originalQuery = sequelize.query;
  const originalCreate = EvaluacionFisica.create;
  const labId = '44444444-4444-4444-8444-444444444444';
  const preofertaId = '55555555-5555-4555-8555-555555555555';
  sequelize.query = async (sql) => {
    if (sql.includes('FROM logistica.inventario_precintos_qr q')) return [[{
      id: token, empresa_id: empresaId, estado: 'VINCULADO_A_SACO', preoferta_id: preofertaId,
    }]];
    if (sql.includes('FROM calidad.evaluaciones_fisicas')) return [[]];
    return [[{ id: labId }]];
  };
  let guardado;
  EvaluacionFisica.create = async (data) => { guardado = data; return data; };
  try {
    const service = new TrazabilidadEscaneoService({});
    await service.registrarAnalisisDesdeQr(token, { id: labId, rol_principal: 'LABORATORIO' }, {
      laboratorio_id: token, preoferta_id: token,
      analista_nombre: 'Ana', peso_muestra_analizada_gramos: 350,
      humedad_porcentaje: 11, densidad_g_l: 705, actividad_agua_aw: 0.62,
      factor_rendimiento: 89, es_conforme: true,
    });
    assert.equal(guardado.laboratorio_id, labId);
    assert.equal(guardado.preoferta_id, preofertaId);
    assert.equal(guardado.codigo_analisis.length <= 30, true);
  } finally { sequelize.query = originalQuery; EvaluacionFisica.create = originalCreate; }
});
