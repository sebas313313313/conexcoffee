import { randomUUID } from 'node:crypto';
import BaseService from '../../baseService.js';
import { sequelize } from '../../../config/database.js';
import { DomainError } from '../../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../../utils/errorCatalog.js';
import Preoferta from '../../preofertas/Preoferta.js';
import SacoCafe from '../../sacos_cafe/SacoCafe.js';

const invalid = (message) => new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code, message, null, 422);
const forbidden = (message) => new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code, message, null, 403);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InventarioPrecintoQrService extends BaseService {
  constructor(repository) { super(repository, 'Precinto con Doble QR'); }

  async empresaDe(actor, transaction) {
    if (actor.rol_principal !== 'EMPRESA_EXPORTADORA') throw forbidden('Se requiere una empresa exportadora');
    const [rows] = await sequelize.query(
      'SELECT id FROM personas.empresas_exportadoras WHERE usuario_id = :userId LIMIT 1',
      { replacements: { userId: actor.id }, transaction }
    );
    if (!rows.length) throw invalid('La sesión no tiene una empresa asociada');
    return rows[0].id;
  }

  async tecnicoDe(actor, transaction) {
    if (actor.rol_principal !== 'ASISTENTE_TECNICO') throw forbidden('Se requiere un asistente técnico');
    const [rows] = await sequelize.query(
      'SELECT id, empresa_id FROM personas.asistentes_tecnicos WHERE usuario_id = :userId AND activo = true LIMIT 1',
      { replacements: { userId: actor.id }, transaction }
    );
    if (!rows.length) throw forbidden('No hay un técnico activo asociado a la sesión');
    return rows[0];
  }

  async crearLote(actor, input) {
    const cantidad = Number(input?.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 500) throw invalid('La cantidad debe estar entre 1 y 500');
    // Referencia interna de generación; no representa un lote de café.
    const codigo = `GEN-${randomUUID()}`;
    const frontendBase = (process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173')).replace(/\/$/, '');
    if (!/^https?:\/\//.test(frontendBase)) throw invalid('Configura FRONTEND_URL para generar URLs públicas de trazabilidad');
    return sequelize.transaction(async (transaction) => {
      const empresaId = await this.empresaDe(actor, transaction);
      const items = Array.from({ length: cantidad }, () => {
        const externo = randomUUID();
        return {
          empresa_id: empresaId,
          codigo_lote_fabricacion: codigo,
          codigo_suncho_precinto: `PX-${randomUUID()}`,
          token_qr_externo: externo,
          token_qr_interno: randomUUID(),
          url_publica_trazabilidad: `${frontendBase}/trazabilidad/${externo}`,
          estado: 'EN_BODEGA_EMPRESA',
        };
      });
      const created = await this.repository.model.bulkCreate(items, { transaction, returning: true });
      return { cantidad: created.length, codigo_lote_fabricacion: codigo };
    });
  }

  async listar(actor, query = {}) {
    let where;
    if (actor.rol_principal === 'EMPRESA_EXPORTADORA') {
      where = { empresa_id: await this.empresaDe(actor) };
    } else if (actor.rol_principal === 'ASISTENTE_TECNICO') {
      const tecnico = await this.tecnicoDe(actor);
      where = { asistente_tecnico_id: tecnico.id, empresa_id: tecnico.empresa_id };
    } else if (actor.rol_principal === 'ADMINISTRADOR') {
      where = {};
    } else throw forbidden('No tienes acceso al inventario de precintos');
    const result = await this.repository.findAll({ page: query.page, limit: query.limit, where,
      attributes: { exclude: ['token_qr_interno'] } });
    const rows = result.rows.map((row) => row.toJSON ? row.toJSON() : row);
    const ids = rows.map((row) => row.id);
    if (!ids.length) return { data: rows, meta: result.meta };
    const [vinculos] = await sequelize.query(
      `SELECT s.precinto_id, p.codigo_preoferta
       FROM logistica.sacos_cafe s
       JOIN cosechas.preofertas p ON p.id = s.preoferta_id
       WHERE s.precinto_id IN (:ids)`,
      { replacements: { ids } }
    );
    const ofertas = new Map(vinculos.map((v) => [v.precinto_id, v.codigo_preoferta]));
    return { data: rows.map((row) => ({ ...row, codigo_oferta: ofertas.get(row.id) || null })), meta: result.meta };
  }

  async entregarLote(actor, input) {
    const ids = input?.precinto_ids;
    const tecnicoId = input?.asistente_tecnico_id;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 500 || new Set(ids).size !== ids.length ||
        ids.some((id) => !UUID.test(String(id))) || !UUID.test(String(tecnicoId))) {
      throw invalid('Selecciona entre 1 y 500 precintos únicos y un técnico válido');
    }
    return sequelize.transaction(async (transaction) => {
      const empresaId = await this.empresaDe(actor, transaction);
      const [tecnicos] = await sequelize.query(
        'SELECT id FROM personas.asistentes_tecnicos WHERE id = :tecnicoId AND empresa_id = :empresaId AND activo = true LIMIT 1',
        { replacements: { tecnicoId, empresaId }, transaction }
      );
      if (!tecnicos.length) throw invalid('El técnico no pertenece a tu empresa o está inactivo');
      const precintos = await this.repository.model.findAll({
        where: { id: ids, empresa_id: empresaId }, transaction, lock: transaction.LOCK.UPDATE,
      });
      if (precintos.length !== ids.length || precintos.some((p) => p.estado !== 'EN_BODEGA_EMPRESA')) {
        throw invalid('Todos los precintos deben estar disponibles en la bodega de tu empresa');
      }
      await this.repository.model.update({ asistente_tecnico_id: tecnicoId,
        estado: 'EN_CUSTODIA_TECNICO', fecha_entrega_tecnico: new Date() },
      { where: { id: ids, empresa_id: empresaId, estado: 'EN_BODEGA_EMPRESA' }, transaction });
      return { entregados: ids.length, asistente_tecnico_id: tecnicoId };
    });
  }

  async anular(actor, id, motivo) {
    if (!UUID.test(String(id)) || !String(motivo || '').trim()) throw invalid('Indica un precinto y motivo de anulación');
    return sequelize.transaction(async (transaction) => {
      const empresaId = await this.empresaDe(actor, transaction);
      const precinto = await this.repository.model.findOne({ where: { id, empresa_id: empresaId }, transaction, lock: transaction.LOCK.UPDATE });
      if (!precinto || !['EN_BODEGA_EMPRESA', 'EN_CUSTODIA_TECNICO'].includes(precinto.estado)) {
        throw invalid('Solo se pueden anular precintos sin vincular a un saco');
      }
      await precinto.update({ estado: 'DANADO_ANULADO', motivo_anulacion: motivo.trim() }, { transaction });
      return { id, estado: 'DANADO_ANULADO' };
    });
  }

  async vincularSaco(actor, input) {
    const token = String(input?.token_qr_externo || '').trim().split('/').pop();
    const preofertaId = input?.preoferta_id;
    const peso = Number(input?.peso_neto_kg);
    if (!UUID.test(token) || !UUID.test(String(preofertaId)) || !Number.isFinite(peso) ||
        peso <= 0 || peso > 999.99 || Math.abs(peso * 100 - Math.round(peso * 100)) > 0.000001) {
      throw invalid('Indica un QR, una preoferta y un peso válido de hasta 999,99 kg');
    }
    return sequelize.transaction(async (transaction) => {
      const tecnico = await this.tecnicoDe(actor, transaction);
      const precinto = await this.repository.model.findOne({
        where: { token_qr_externo: token, empresa_id: tecnico.empresa_id,
          asistente_tecnico_id: tecnico.id }, transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!precinto || precinto.estado !== 'EN_CUSTODIA_TECNICO') {
        throw invalid('El QR no está disponible bajo tu custodia');
      }
      const preoferta = await Preoferta.findOne({ where: { id: preofertaId,
        empresa_aliada_asignada_id: tecnico.empresa_id }, transaction, lock: transaction.LOCK.UPDATE });
      if (!preoferta) throw invalid('La preoferta no pertenece a la empresa del técnico');
      const consecutivo = Number(await SacoCafe.max('numero_saco_consecutivo', {
        where: { preoferta_id: preofertaId }, transaction,
      }) || 0) + 1;
      const saco = await SacoCafe.create({ preoferta_id: preofertaId, precinto_id: precinto.id,
        asistente_tecnico_vinculo_id: tecnico.id, numero_saco_consecutivo: consecutivo,
        peso_neto_kg: peso, estado_saco: 'SELLADO_EN_FINCA' }, { transaction });
      await precinto.update({ estado: 'VINCULADO_A_SACO' }, { transaction });
      return { saco_id: saco.id, precinto_id: precinto.id, numero_saco_consecutivo: consecutivo };
    });
  }

  async corregirVinculo(actor, token, input) {
    const preofertaId = input?.preoferta_id;
    const peso = Number(input?.peso_neto_kg);
    if (!UUID.test(String(token)) || !UUID.test(String(preofertaId)) || !Number.isFinite(peso) ||
        peso <= 0 || peso > 999.99 || Math.abs(peso * 100 - Math.round(peso * 100)) > 0.000001) {
      throw invalid('Indica una preoferta y un peso válido de hasta 999,99 kg');
    }
    return sequelize.transaction(async (transaction) => {
      const tecnico = await this.tecnicoDe(actor, transaction);
      const precinto = await this.repository.model.findOne({
        where: { token_qr_externo: token, empresa_id: tecnico.empresa_id,
          asistente_tecnico_id: tecnico.id, estado: 'VINCULADO_A_SACO' },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!precinto) throw forbidden('El precinto no está vinculado bajo tu custodia');
      const preoferta = await Preoferta.findOne({
        where: { id: preofertaId, empresa_aliada_asignada_id: tecnico.empresa_id },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!preoferta) throw invalid('La preoferta no pertenece a la empresa del técnico');
      const saco = await SacoCafe.findOne({ where: { precinto_id: precinto.id }, transaction, lock: transaction.LOCK.UPDATE });
      if (!saco) throw invalid('No se encontró el saco de este precinto');
      if (saco.estado_saco !== 'SELLADO_EN_FINCA') throw invalid('Solo se puede corregir el saco mientras permanece sellado en finca');
      if (saco.preoferta_id !== preofertaId) {
        const consecutivo = Number(await SacoCafe.max('numero_saco_consecutivo', {
          where: { preoferta_id: preofertaId }, transaction,
        }) || 0) + 1;
        await saco.update({ preoferta_id: preofertaId, numero_saco_consecutivo: consecutivo,
          peso_neto_kg: peso }, { transaction });
      } else {
        await saco.update({ peso_neto_kg: peso }, { transaction });
      }
      return { saco_id: saco.id, preoferta_id: preofertaId, peso_neto_kg: peso };
    });
  }
}
export default InventarioPrecintoQrService;
