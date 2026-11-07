import BaseService from '../../baseService.js';
import { DomainError } from '../../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../../utils/errorCatalog.js';
import Catador from '../../catadores/Catador.js';
import EmpresaExportadora from '../../empresas_exportadoras/EmpresaExportadora.js';
import AsignacionSesionCatacion from '../AsignacionSesionCatacion.js';
import HojaCatacionCva from '../../hojas_catacion_cva/HojaCatacionCva.js';
import { Op } from 'sequelize';

class SesionCatacionService extends BaseService {
  /**
   * @param {import('../repository/SesionCatacionRepository.js').default} repository
   */
  constructor(repository) {
    super(repository, 'Sesión de Catación Sensorial');
  }

  async create(data, options = {}) {
    if (!data.codigo_sesion) {
      throw new DomainError(
        ERROR_CATALOG.VALIDATION_ERROR.code,
        'El código de la sesión de catación es obligatorio',
        'Campo requerido: codigo_sesion (ej. EVAL-P01)',
        400
      );
    }

    if (!data.evaluacion_fisica_id) {
      throw new DomainError(
        ERROR_CATALOG.VALIDATION_ERROR.code,
        'La evaluación física asociada es obligatoria para abrir una sesión de catación',
        'Campo requerido: evaluacion_fisica_id',
        400
      );
    }

    const existing = await this.repository.findByCodigo(data.codigo_sesion);
    if (existing) {
      throw new DomainError(
        ERROR_CATALOG.DUPLICATE_ENTRY.code,
        'Ya existe una sesión de catación con este código',
        `Código de sesión: ${data.codigo_sesion}`,
        409
      );
    }

    return await super.create(data, options);
  }

  async createForUser(data, usuario) {
    let empresa_creadora_id = data.empresa_creadora_id;
    if (usuario?.rol_principal === 'EMPRESA_EXPORTADORA') {
      const empresa = await EmpresaExportadora.findOne({ where: { usuario_id: usuario.id } });
      if (!empresa) {
        throw new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code, 'La cuenta no tiene una empresa exportadora asociada', null, 403);
      }
      empresa_creadora_id = empresa.id;
    }
    return this.create({ ...data, empresa_creadora_id });
  }

  async getAllForUser(query, usuario) {
    if (usuario?.rol_principal !== 'CATADOR') return this.getAll(query);
    const catador = await Catador.findOne({ where: { usuario_id: usuario.id, activo: true } });
    if (!catador) return { data: [], meta: { page: 1, limit: 20, totalRecords: 0, totalPages: 0 } };

    const [asignaciones, hojas] = await Promise.all([
      AsignacionSesionCatacion.findAll({ where: { catador_id: catador.id }, attributes: ['sesion_id'] }),
      HojaCatacionCva.findAll({ where: { catador_id: catador.id }, attributes: ['sesion_id'] })
    ]);
    const ids = [...new Set([...asignaciones, ...hojas].map((row) => row.sesion_id))];
    if (!ids.length) return { data: [], meta: { page: 1, limit: 20, totalRecords: 0, totalPages: 0 } };
    const { page, limit, sort, ...filters } = query;
    const result = await this.repository.findAll({ page, limit, where: { ...filters, id: { [Op.in]: ids } } });
    return { data: result.rows, meta: result.meta };
  }

  async getQrPreview(codigo) {
    const sesion = await this.repository.findByCodigoWithQrDetails(codigo);
    if (!sesion) {
      throw new DomainError(ERROR_CATALOG.NOT_FOUND.code, 'No se encontró la evaluación vinculada al código QR', `Código: ${codigo}`, 404);
    }
    return sesion;
  }

  async assignFromQr(codigo, usuarioId) {
    const [sesion, catador] = await Promise.all([
      this.repository.findByCodigoWithQrDetails(codigo),
      Catador.findOne({ where: { usuario_id: usuarioId, activo: true } })
    ]);
    if (!sesion) {
      throw new DomainError(ERROR_CATALOG.NOT_FOUND.code, 'No se encontró la evaluación vinculada al código QR', `Código: ${codigo}`, 404);
    }
    if (!catador) {
      throw new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code, 'Tu cuenta no tiene un perfil de catador activo', null, 403);
    }

    const [asignacion, creada] = await AsignacionSesionCatacion.findOrCreate({
      where: { sesion_id: sesion.id, catador_id: catador.id },
      defaults: { estado: 'PENDIENTE' }
    });
    return { sesion, asignacion, ya_asignada: !creada };
  }

  async createQrPayload(id, usuario) {
    const sesion = await this.repository.findById(id);
    if (!sesion) {
      throw new DomainError(ERROR_CATALOG.NOT_FOUND.code, 'No se encontró la sesión de catación solicitada', `Sesión ID: ${id}`, 404);
    }
    if (usuario.rol_principal === 'EMPRESA_EXPORTADORA') {
      const empresa = await EmpresaExportadora.findOne({ where: { usuario_id: usuario.id } });
      if (!empresa || sesion.empresa_creadora_id !== empresa.id) {
        throw new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code, 'No tienes permiso para generar el QR de esta evaluación', null, 403);
      }
    }
    return {
      tipo: 'CONEXCOFFEE_EVALUACION',
      codigo: sesion.codigo_sesion,
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/catador/evaluacion?qr=${encodeURIComponent(sesion.codigo_sesion)}`
    };
  }

  async getWithDetails(id) {
    const sesion = await this.repository.findWithDetails(id);
    if (!sesion) {
      throw new DomainError(
        ERROR_CATALOG.NOT_FOUND.code,
        'No se encontró la sesión de catación solicitada',
        `Sesión ID: ${id}`,
        404
      );
    }
    return sesion;
  }
}

export default SesionCatacionService;
