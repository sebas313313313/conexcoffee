import BaseService from '../../baseService.js';
import { sequelize } from '../../../config/database.js';

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class LoteCultivoService extends BaseService {
  /**
   * @param {import('../repository/LoteCultivoRepository.js').default} repository
   */
  constructor(repository) {
    super(repository, 'Lote de Cultivo');
  }

  async resolveFincaId(data = {}) {
    const candidate = data.finca_id || data.fincaId;
    if (candidate && IS_UUID.test(String(candidate))) return candidate;
    const fincaName = data.fincaNombre || data.finca;
    if (fincaName) {
      const [rows] = await sequelize.query(
        `SELECT id FROM agronomia.fincas WHERE nombre_finca ILIKE :q LIMIT 1`,
        { replacements: { q: `%${fincaName}%` } }
      );
      if (rows?.[0]?.id) return rows[0].id;
    }
    const [first] = await sequelize.query(`SELECT id FROM agronomia.fincas LIMIT 1`);
    return first?.[0]?.id || null;
  }

  async resolveVariedadId(data = {}) {
    if (data.variedad_id && !isNaN(Number(data.variedad_id))) return Number(data.variedad_id);
    const varName = data.variedad || data.variedadCafe;
    if (varName) {
      const [rows] = await sequelize.query(
        `SELECT id FROM agronomia.variedades_cafe WHERE nombre ILIKE :q LIMIT 1`,
        { replacements: { q: `%${varName}%` } }
      );
      if (rows?.[0]?.id) return rows[0].id;
    }
    const [first] = await sequelize.query(`SELECT id FROM agronomia.variedades_cafe LIMIT 1`);
    return first?.[0]?.id || 1;
  }

  normalize(data = {}, isCreate = false) {
    const nombre_identificador =
      data.nombre_identificador || data.nombreLote || data.nombre || (isCreate ? 'Lote Principal' : undefined);
    const rawArboles = data.numero_arboles ?? data.numeroArboles;
    const numero_arboles =
      rawArboles !== undefined ? parseInt(rawArboles, 10) || 2500 : isCreate ? 2500 : undefined;
    const validSombras = ['TOTAL', 'PARCIAL', 'A_LIBRE_EXPOSICION'];
    const tipo_sombra = validSombras.includes(data.tipo_sombra)
      ? data.tipo_sombra
      : isCreate
        ? 'PARCIAL'
        : undefined;

    const payload = { ...data };
    if (nombre_identificador) payload.nombre_identificador = nombre_identificador;
    if (numero_arboles !== undefined) payload.numero_arboles = numero_arboles;
    if (tipo_sombra) payload.tipo_sombra = tipo_sombra;
    delete payload.id;
    return payload;
  }

  async create(data, options = {}) {
    const [finca_id, variedad_id] = await Promise.all([
      this.resolveFincaId(data),
      this.resolveVariedadId(data)
    ]);
    const payload = this.normalize({ ...data, finca_id, variedad_id }, true);
    return await super.create(payload, options);
  }

  async update(id, data, options = {}) {
    const payload = this.normalize(data, false);
    if (data.variedad || data.variedadCafe) {
      payload.variedad_id = await this.resolveVariedadId(data);
    }
    return await super.update(id, payload, options);
  }

  async getLotesByFinca(fincaId) {
    return await this.repository.findByFincaId(fincaId);
  }
}

export default LoteCultivoService;
