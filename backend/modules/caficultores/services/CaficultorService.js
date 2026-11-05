import BaseService from '../../baseService.js';
import { DomainError } from '../../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../../utils/errorCatalog.js';
import { ensureUsuarioSistema } from '../../../utils/ensureUsuarioSistema.js';
import { sequelize } from '../../../config/database.js';

class CaficultorService extends BaseService {
  /**
   * @param {import('../repository/CaficultorRepository.js').default} repository
   */
  constructor(repository) {
    super(repository, 'Caficultor');
  }

  normalizePayload(data = {}, isCreate = false) {
    const nombres =
      data.nombres ||
      [data.primerNombre || data.primer_nombre, data.segundoNombre || data.segundo_nombre]
        .filter(Boolean)
        .join(' ')
        .trim();
    const apellidos =
      data.apellidos ||
      [data.primerApellido || data.primer_apellido, data.segundoApellido || data.segundo_apellido]
        .filter(Boolean)
        .join(' ')
        .trim();
    const numero_documento =
      data.numero_documento ||
      data.numeroIdentificacion ||
      data.numero_identificacion ||
      (isCreate ? `CC-${Date.now()}` : undefined);
    const telefono_movil =
      data.telefono_movil || data.telefono || (isCreate ? '3000000000' : undefined);
    const departamento = data.departamento || (isCreate ? 'Cauca' : undefined);
    const municipio = data.municipio || (isCreate ? 'Popayán' : undefined);
    const tipo_documento = data.tipo_documento || (isCreate ? 'CC' : undefined);
    const observaciones_verificacion =
      data.observaciones_verificacion ?? undefined;

    const normalized = { ...data };
    if (Object.hasOwn(data, 'empresa_exportadora_id')) {
      normalized.empresa_exportadora_id = data.empresa_exportadora_id === ''
        ? null : data.empresa_exportadora_id;
    }
    delete normalized.empresa;
    if (nombres) normalized.nombres = nombres;
    if (apellidos) normalized.apellidos = apellidos;
    if (numero_documento) normalized.numero_documento = String(numero_documento);
    if (telefono_movil) normalized.telefono_movil = String(telefono_movil);
    if (departamento) normalized.departamento = departamento;
    if (municipio) normalized.municipio = municipio;
    if (tipo_documento) normalized.tipo_documento = tipo_documento;
    if (observaciones_verificacion !== undefined) {
      normalized.observaciones_verificacion = observaciones_verificacion;
    }
    delete normalized.id;
    return normalized;
  }

  async create(data, options = {}) {
    const persist = async (transaction) => {
      const txOptions = { ...options, transaction };
      const payload = this.normalizePayload(data, true);
      await this.validarEmpresa(payload, txOptions, true);
      payload.usuario_id = await ensureUsuarioSistema(data, 'CAFICULTOR', txOptions);
      return await super.create(payload, txOptions);
    };
    return options.transaction ? persist(options.transaction) : sequelize.transaction(persist);
  }

  async empresaIdForActor(actor) {
    if (actor.rol_principal !== 'EMPRESA_EXPORTADORA') return null;
    const [rows] = await sequelize.query(
      'SELECT id FROM personas.empresas_exportadoras WHERE usuario_id = :userId LIMIT 1',
      { replacements: { userId: actor.id } }
    );
    if (!rows.length) throw new DomainError(ERROR_CATALOG.NOT_FOUND.code,
      'No existe una empresa asociada a esta sesión', null, 404);
    return rows[0].id;
  }

  async createForActor(actor, data) {
    const empresaId = await this.empresaIdForActor(actor);
    const { empresa_exportadora_id: _ignored, usuario_id: _userId, ...safeData } = data;
    return this.create({ ...safeData, empresa_exportadora_id: empresaId || data.empresa_exportadora_id });
  }

  async listForActor(actor, query) {
    const empresaId = await this.empresaIdForActor(actor);
    if (!empresaId) return this.getAll(query);
    const { page, limit } = query;
    const result = await this.repository.findAll({ page, limit, where: { empresa_exportadora_id: empresaId } });
    return { data: result.rows, meta: result.meta };
  }

  async caficultorForActor(actor, id) {
    const caficultor = await this.getById(id);
    const empresaId = await this.empresaIdForActor(actor);
    if (empresaId && caficultor.empresa_exportadora_id !== empresaId) {
      throw new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code,
        'Este caficultor no pertenece a tu empresa', null, 403);
    }
    return caficultor;
  }

  async updateForActor(actor, id, data) {
    await this.caficultorForActor(actor, id);
    const { empresa_exportadora_id: _ignored, usuario_id: _userId, ...safeData } = data;
    return this.update(id, safeData);
  }

  async update(id, data, options = {}) {
    const payload = this.normalizePayload(data, false);
    await this.validarEmpresa(payload, options);
    return await super.update(id, payload, options);
  }

  async validarEmpresa(payload, options = {}, isCreate = false) {
    const id = payload.empresa_exportadora_id;
    if (id === undefined && !isCreate) return;
    if (!id) {
      throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code,
        'La empresa exportadora es obligatoria', 'empresa_exportadora_id', 422);
    }
    if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code,
        'La empresa debe identificarse mediante un UUID válido', 'empresa_exportadora_id', 422);
    }
    if (!await this.repository.existeEmpresa(id, options)) {
      throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code,
        'La empresa exportadora seleccionada no existe', 'empresa_exportadora_id', 422);
    }
  }

  async getByUsuarioId(usuarioId) {
    const caficultor = await this.repository.findByUsuarioId(usuarioId);
    if (!caficultor) {
      throw new DomainError(
        ERROR_CATALOG.NOT_FOUND.code,
        'Perfil de caficultor no encontrado para este usuario',
        `Usuario ID: ${usuarioId}`,
        404
      );
    }
    return caficultor;
  }

  async updateEstadoVerificacion(id, estadoVerificacion, observaciones = null) {
    const validos = ['PENDIENTE_DOCUMENTOS', 'EN_REVISION', 'APROBADO', 'RECHAZADO'];
    if (!validos.includes(estadoVerificacion)) {
      throw new DomainError(
        ERROR_CATALOG.VALIDATION_ERROR.code,
        `Estado de verificación inválido. Debe ser uno de: ${validos.join(', ')}`,
        null,
        422
      );
    }

    return await this.update(id, {
      estado_verificacion: estadoVerificacion,
      observaciones_verificacion: observaciones
    });
  }
}

export default CaficultorService;
