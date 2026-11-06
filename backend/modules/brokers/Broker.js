import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';
import BaseRepository from '../baseRepository.js';
import BaseService from '../baseService.js';
import BaseController from '../baseController.js';
import { Router } from 'express';
import checkAuth from '../../middleware/checkAuth.js';
import { ensureUsuarioSistema } from '../../utils/ensureUsuarioSistema.js';
import { DomainError } from '../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../utils/errorCatalog.js';
import checkRoles from '../../middleware/checkRoles.js';

class Broker extends Model {}

Broker.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    usuario_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    empresa_exportadora_is: { type: DataTypes.UUID, allowNull: true },
    nombre_empresa: { type: DataTypes.STRING(150), allowNull: false },
    identificacion_fiscal_pais: { type: DataTypes.STRING(50), allowNull: false },
    pais_operacion: { type: DataTypes.STRING(60), allowNull: false },
    ciudad: { type: DataTypes.STRING(60), allowNull: false },
    direccion_bodega: { type: DataTypes.TEXT, allowNull: true },
    telefono_contacto: { type: DataTypes.STRING(30), allowNull: true },
    porcentaje_comision_split: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5.0 },
    datos_bancarios_internacionales: { type: DataTypes.JSONB, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Broker',
    tableName: 'brokers',
    schema: 'personas',
    timestamps: false,
  }
);

class BrokerRepository extends BaseRepository {
  constructor() {
    super(Broker);
  }
}

export class BrokerService extends BaseService {
  constructor(repo = new BrokerRepository()) {
    super(repo, 'Broker Internacional');
  }

  normalize(data = {}, isCreate = false) {
    const fullName = [
      data.primerNombre || data.primer_nombre || data.nombres,
      data.segundoNombre || data.segundo_nombre,
      data.primerApellido || data.primer_apellido || data.apellidos,
      data.segundoApellido || data.segundo_apellido,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const nombre_empresa = data.nombre_empresa || fullName || (isCreate ? 'Broker Internacional' : undefined);
    const identificacion_fiscal_pais =
      data.identificacion_fiscal_pais ||
      data.numeroIdentificacion ||
      data.numero_identificacion ||
      (isCreate ? `EIN-${Date.now()}` : undefined);
    const pais_operacion =
      data.pais_operacion || data.pais || data.departamento || (isCreate ? 'Estados Unidos' : undefined);
    const ciudad = data.ciudad || data.municipio || (isCreate ? 'Miami' : undefined);
    const direccion_bodega = data.direccion_bodega || data.direccion || (isCreate ? 'Bodega Principal' : undefined);
    const telefono_contacto = data.telefono_contacto || data.telefono || undefined;

    const payload = { ...data };
    if (nombre_empresa) payload.nombre_empresa = nombre_empresa;
    if (identificacion_fiscal_pais) payload.identificacion_fiscal_pais = String(identificacion_fiscal_pais);
    if (pais_operacion) payload.pais_operacion = pais_operacion;
    if (ciudad) payload.ciudad = ciudad;
    if (direccion_bodega !== undefined) payload.direccion_bodega = direccion_bodega;
    if (telefono_contacto) payload.telefono_contacto = String(telefono_contacto);
    delete payload.id;
    return payload;
  }

  async create(data, options = {}) {
    const persist = async (transaction) => {
      const txOptions = { ...options, transaction };
      const usuario_id = await ensureUsuarioSistema(data, 'BROKER', txOptions);
      const payload = this.normalize({ ...data, usuario_id }, true);
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
    if (!rows.length) throw new DomainError(ERROR_CATALOG.NOT_FOUND.code, 'No existe una empresa asociada a esta sesión', null, 404);
    return rows[0].id;
  }

  async createForActor(actor, data) {
    const empresaId = await this.empresaIdForActor(actor);
    const { empresa_exportadora_is: _ignored, usuario_id: _userId, ...safeData } = data;
    return this.create({ ...safeData, empresa_exportadora_is: empresaId });
  }

  async listForActor(actor, query) {
    const empresaId = await this.empresaIdForActor(actor);
    if (!empresaId) return this.getAll(query);
    const { page, limit } = query;
    const result = await this.repository.findAll({ page, limit, where: { empresa_exportadora_is: empresaId } });
    return { data: result.rows, meta: result.meta };
  }

  async brokerForActor(actor, id) {
    const broker = await this.getById(id);
    const empresaId = await this.empresaIdForActor(actor);
    if (empresaId && broker.empresa_exportadora_is !== empresaId) {
      throw new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code, 'Este broker no pertenece a tu empresa', null, 403);
    }
    return broker;
  }

  async updateForActor(actor, id, data) {
    await this.brokerForActor(actor, id);
    const { empresa_exportadora_is: _ignored, usuario_id: _userId, ...safeData } = data;
    return this.update(id, safeData);
  }

  async update(id, data, options = {}) {
    const payload = this.normalize(data, false);
    return await super.update(id, payload, options);
  }
}

class BrokerController extends BaseController {
  constructor(service = new BrokerService()) {
    super(service);
  }
}

export const BrokerRouter = Router();
const controller = new BrokerController();
BrokerRouter.get('/', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) => controller.execute(res, () => controller.service.listForActor(req.user, req.query)));
BrokerRouter.get('/:id', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) => controller.execute(res, () => controller.service.brokerForActor(req.user, req.params.id)));
BrokerRouter.post('/', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.createForActor(req.user, req.body), 201));
BrokerRouter.put('/:id', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.updateForActor(req.user, req.params.id, req.body)));
BrokerRouter.delete('/:id', checkAuth, checkRoles('ADMINISTRADOR'), controller.delete);

export default Broker;
