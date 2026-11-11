import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';
import BaseRepository from '../baseRepository.js';
import BaseService from '../baseService.js';
import BaseController from '../baseController.js';
import { Router } from 'express';
import checkAuth from '../../middleware/checkAuth.js';
import { ensureUsuarioSistema } from '../../utils/ensureUsuarioSistema.js';

class AsistenteTecnico extends Model {}

AsistenteTecnico.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    usuario_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    empresa_id: { type: DataTypes.UUID, allowNull: false },
    tipo_documento: { type: DataTypes.STRING(10), defaultValue: 'CC' },
    numero_documento: { type: DataTypes.STRING(25), allowNull: false, unique: true },
    nombres: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(100), allowNull: false },
    tarjeta_profesional: { type: DataTypes.STRING(50), allowNull: true },
    profesion: { type: DataTypes.STRING(100), defaultValue: 'Ingeniero Agrónomo / Técnico Agropecuario' },
    telefono_movil: { type: DataTypes.STRING(25), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    fecha_vinculacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'AsistenteTecnico',
    tableName: 'asistentes_tecnicos',
    schema: 'personas',
    timestamps: false,
  }
);

class AsistenteTecnicoRepository extends BaseRepository {
  constructor() {
    super(AsistenteTecnico);
  }
}

class AsistenteTecnicoService extends BaseService {
  constructor(repo = new AsistenteTecnicoRepository()) {
    super(repo, 'Asistente Técnico');
  }

  async resolveEmpresaId(empresa_id) {
    if (empresa_id) return empresa_id;
    const [rows] = await sequelize.query(`SELECT id FROM personas.empresas_exportadoras LIMIT 1`);
    return rows?.[0]?.id || null;
  }

  normalize(data = {}, isCreate = false) {
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
    const tipo_documento = data.tipo_documento || (isCreate ? 'CC' : undefined);
    const telefono_movil = data.telefono_movil || data.telefono || (isCreate ? '3150000000' : undefined);
    const profesion =
      data.profesion || data.especialidad || (isCreate ? 'Ingeniero Agrónomo / Técnico Agropecuario' : undefined);
    const tarjeta_profesional =
      data.tarjeta_profesional || (isCreate ? null : undefined);

    const payload = { ...data };
    if (tipo_documento) payload.tipo_documento = String(tipo_documento);
    if (nombres) payload.nombres = nombres;
    if (apellidos) payload.apellidos = apellidos;
    if (numero_documento) payload.numero_documento = String(numero_documento);
    if (telefono_movil) payload.telefono_movil = String(telefono_movil);
    if (profesion) payload.profesion = profesion;
    if (tarjeta_profesional !== undefined) payload.tarjeta_profesional = tarjeta_profesional;
    delete payload.id;
    return payload;
  }

  async create(data, options = {}) {
    const usuario_id = await ensureUsuarioSistema(data, 'ASISTENTE_TECNICO');
    const empresa_id = await this.resolveEmpresaId(data.empresa_id);
    const payload = this.normalize({ ...data, usuario_id, empresa_id }, true);
    return await super.create(payload, options);
  }

  async update(id, data, options = {}) {
    const payload = this.normalize(data, false);
    return await super.update(id, payload, options);
  }
}

class AsistenteTecnicoController extends BaseController {
  constructor(service = new AsistenteTecnicoService()) {
    super(service);
  }
}

export const AsistenteTecnicoRouter = Router();
const controller = new AsistenteTecnicoController();
AsistenteTecnicoRouter.get('/', checkAuth, controller.getAll);
AsistenteTecnicoRouter.get('/:id', checkAuth, controller.getById);
AsistenteTecnicoRouter.post('/', checkAuth, controller.create);
AsistenteTecnicoRouter.put('/:id', checkAuth, controller.update);
AsistenteTecnicoRouter.delete('/:id', checkAuth, controller.delete);

export default AsistenteTecnico;
