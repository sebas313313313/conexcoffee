import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import BaseService from '../../baseService.js';
import { DomainError } from '../../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../../utils/errorCatalog.js';
import { sequelize } from '../../../config/database.js';

const ROLE_TO_FRONTEND = {
  ADMINISTRADOR: 'superadmin',
  EMPRESA_EXPORTADORA: 'empresa',
  ASISTENTE_TECNICO: 'tecnico',
  CAFICULTOR: 'caficultor',
  LABORATORIO: 'laboratorio',
  CATADOR: 'catador',
  BROKER: 'broker',
  COMPRADOR_INTERNACIONAL: 'comprador',
};

const FRONTEND_TO_ROLE = {
  superadmin: 'ADMINISTRADOR',
  empresa: 'EMPRESA_EXPORTADORA',
  tecnico: 'ASISTENTE_TECNICO',
  caficultor: 'CAFICULTOR',
  laboratorio: 'LABORATORIO',
  catador: 'CATADOR',
  broker: 'BROKER',
  comprador: 'COMPRADOR_INTERNACIONAL',
};
const PUBLIC_ROLES = new Set([
  'ASISTENTE_TECNICO', 'CAFICULTOR', 'LABORATORIO', 'CATADOR',
  'BROKER', 'COMPRADOR_INTERNACIONAL',
]);
const ALL_ROLES = new Set(Object.keys(ROLE_TO_FRONTEND));

class UsuarioSistemaService extends BaseService {
  /**
   * @param {import('../repository/UsuarioSistemaRepository.js').default} repository
   */
  constructor(repository) {
    super(repository, 'Usuario del Sistema');
  }

  /**
   * Enriquece el objeto usuario con su perfil especializado en esquema `personas`
   */
  async enrichUser(userRecord) {
    const userObj = userRecord?.toJSON ? userRecord.toJSON() : { ...userRecord };
    delete userObj.hash_contrasena;

    const frontendRole = ROLE_TO_FRONTEND[userObj.rol_principal] || 'comprador';
    let nombre = userObj.correo_electronico?.split('@')[0] || 'Usuario';
    let actorInfo = {};

    try {
      const uid = userObj.id;
      if (userObj.rol_principal === 'ADMINISTRADOR') {
        const [rows] = await sequelize.query(
          `SELECT id, nombres, apellidos, cargo, departamento FROM personas.administradores WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = `${rows[0].nombres} ${rows[0].apellidos}`.trim();
          actorInfo = { administrador_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'EMPRESA_EXPORTADORA') {
        const [rows] = await sequelize.query(
          `SELECT id, nit, razon_social, nombre_comercial, representante_legal, telefono_contacto FROM personas.empresas_exportadoras WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = rows[0].nombre_comercial || rows[0].razon_social;
          actorInfo = { empresa_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'ASISTENTE_TECNICO') {
        const [rows] = await sequelize.query(
          `SELECT id, empresa_id, nombres, apellidos, profesion, tarjeta_profesional, telefono_movil FROM personas.asistentes_tecnicos WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = `${rows[0].nombres} ${rows[0].apellidos}`.trim();
          actorInfo = { tecnico_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'CAFICULTOR') {
        const [rows] = await sequelize.query(
          `SELECT id, numero_documento, nombres, apellidos, telefono_movil, departamento, municipio, billetera_saldo_cop FROM personas.caficultores WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = `${rows[0].nombres} ${rows[0].apellidos}`.trim();
          actorInfo = { caficultor_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'LABORATORIO') {
        const [rows] = await sequelize.query(
          `SELECT id, empresa_id, nit, nombre_laboratorio, responsable_tecnico, municipio, departamento FROM personas.laboratorios WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = rows[0].nombre_laboratorio;
          actorInfo = { laboratorio_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'CATADOR') {
        const [rows] = await sequelize.query(
          `SELECT id, empresa_id, laboratorio_id, nombres, apellidos, codigo_certificado_q_grader, telefono_movil FROM personas.catadores WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = `${rows[0].nombres} ${rows[0].apellidos}`.trim();
          actorInfo = { catador_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'BROKER') {
        const [rows] = await sequelize.query(
          `SELECT id, nombre_empresa, pais_operacion, ciudad, telefono_contacto FROM personas.brokers WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = rows[0].nombre_empresa;
          actorInfo = { broker_id: rows[0].id, ...rows[0] };
        }
      } else if (userObj.rol_principal === 'COMPRADOR_INTERNACIONAL') {
        const [rows] = await sequelize.query(
          `SELECT id, nombre_empresa, tipo_entidad, pais_destino, ciudad, telefono_contacto FROM personas.compradores_internacionales WHERE usuario_id = :uid LIMIT 1`,
          { replacements: { uid } }
        );
        if (rows[0]) {
          nombre = rows[0].nombre_empresa;
          actorInfo = { comprador_id: rows[0].id, ...rows[0] };
        }
      }
    } catch (_) {
      // Continuar con datos base si alguna consulta opcional falla
    }

    return {
      ...actorInfo,
      ...userObj,
      email: userObj.correo_electronico,
      role: frontendRole,
      name: nombre,
      nombre,
    };
  }

  /**
   * Registro de nuevo usuario
   */
  async register(payload, { publicRegistration = true } = {}) {
    const rawEmail = payload.correo_electronico || payload.email || '';
    const rawPass = payload.contrasena || payload.password || 'Password123!';
    const rawRol = payload.rol_principal || FRONTEND_TO_ROLE[payload.role] || 'COMPRADOR_INTERNACIONAL';
    if ((payload.role && !FRONTEND_TO_ROLE[payload.role]) ||
        !ALL_ROLES.has(rawRol) || (publicRegistration && !PUBLIC_ROLES.has(rawRol)) ||
        (payload.rol_principal && payload.role && FRONTEND_TO_ROLE[payload.role] !== rawRol)) {
      throw new DomainError(
        ERROR_CATALOG.ROLE_UNAUTHORIZED.code,
        'El rol solicitado no está permitido para este registro',
        null,
        403
      );
    }
    const creado_por_usuario_id = payload.creado_por_usuario_id || null;

    const email = rawEmail.toLowerCase().trim();
    const existing = await this.repository.findByEmail(email);
    if (existing) {
      throw new DomainError(
        ERROR_CATALOG.DUPLICATE_RESOURCE.code,
        'El correo electrónico ya se encuentra registrado en ConexCoffee',
        `Email: ${email}`,
        409
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hash_contrasena = await bcrypt.hash(rawPass, salt);

    const newUser = await this.repository.create({
      correo_electronico: email,
      hash_contrasena,
      rol_principal: rawRol,
      creado_por_usuario_id,
      esta_activo: true,
      correo_verificado: true,
    });

    // Si es un comprador registrado desde el formulario público, crear su registro en personas.compradores_internacionales
    if (rawRol === 'COMPRADOR_INTERNACIONAL' && (payload.company || payload.firstName || payload.nombre_empresa)) {
      try {
        const nombreEmpresa =
          payload.nombre_empresa ||
          payload.company ||
          `${payload.firstName || ''} ${payload.lastName || ''}`.trim() ||
          'Comprador Internacional';
        await sequelize.query(
          `INSERT INTO personas.compradores_internacionales
            (usuario_id, tipo_entidad, nombre_empresa, identificacion_tributaria, pais_destino, ciudad, direccion_entrega, telefono_contacto, activo)
           VALUES (:uid, :tipo, :empresa, :taxId, :pais, :ciudad, :dir, :tel, true)
           ON CONFLICT DO NOTHING`,
          {
            replacements: {
              uid: newUser.id,
              tipo: payload.tipo_entidad || 'TOSTADOR_ARTESANAL',
              empresa: nombreEmpresa,
              taxId: payload.identificacion_tributaria || payload.taxId || `TAX-${Date.now()}`,
              pais: payload.pais_destino || payload.country || 'Estados Unidos',
              ciudad: payload.ciudad || payload.city || 'Miami',
              dir: payload.direccion_entrega || payload.address || 'Dirección Principal',
              tel: payload.telefono_contacto || payload.phone || '+1000000000',
            },
          }
        );
      } catch (_) {}
    }

    const enriched = await this.enrichUser(newUser);
    return {
      user: enriched,
      usuario: enriched,
      message: 'Usuario registrado exitosamente',
    };
  }

  /**
   * Autenticación de usuario con emisión de JWT
   */
  async login(correo_electronico, contrasena) {
    const email = (correo_electronico || '').toLowerCase().trim();
    const user = await this.repository.findByEmail(email);

    if (!user || !user.esta_activo) {
      throw new DomainError(
        ERROR_CATALOG.INVALID_CREDENTIALS.code,
        'Credenciales inválidas o cuenta inactiva',
        'Verificar correo y contraseña o activar la cuenta.',
        401
      );
    }

    const isMatch = await bcrypt.compare(contrasena || '', user.hash_contrasena);
    if (!isMatch) {
      await user.increment('intentos_fallidos');
      throw new DomainError(
        ERROR_CATALOG.INVALID_CREDENTIALS.code,
        'Credenciales inválidas o cuenta inactiva',
        'Verificar correo y contraseña o activar la cuenta.',
        401
      );
    }

    await user.update({
      intentos_fallidos: 0,
      ultimo_acceso: new Date()
    });

    const token = jwt.sign(
      {
        id: user.id,
        correo_electronico: user.correo_electronico,
        rol_principal: user.rol_principal
      },
      process.env.JWT_SECRET || 'conexcoffee_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const enriched = await this.enrichUser(user);

    return {
      token,
      usuario: enriched,
      user: enriched,
    };
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId) {
    const user = await this.getById(userId);
    const enriched = await this.enrichUser(user);
    return {
      ...enriched,
      user: enriched,
      usuario: enriched,
    };
  }

  /**
   * Sobrescribe getAll para nunca exponer hash_contrasena
   */
  async getAll(queryParams = {}) {
    const result = await super.getAll(queryParams);
    const cleanRows = await Promise.all(
      (result.data || []).map((u) => this.enrichUser(u))
    );
    return {
      data: cleanRows,
      meta: result.meta,
    };
  }

  /**
   * Sobrescribe create para permitir crear usuarios desde panel SuperAdmin
   */
  async create(data) {
    if (data.contrasena || data.password || !data.hash_contrasena) {
      const reg = await this.register(data, { publicRegistration: false });
      return reg.usuario;
    }
    return await super.create(data);
  }

  async update(id, data, options = {}) {
    const user = await this.getById(id);
    if ((data.rol_principal && data.rol_principal !== user.rol_principal) ||
        (data.role && FRONTEND_TO_ROLE[data.role] !== user.rol_principal)) {
      throw new DomainError(
        ERROR_CATALOG.ROLE_UNAUTHORIZED.code,
        'El rol de un usuario existente no se puede modificar',
        null,
        403
      );
    }
    const { rol_principal: _role, role: _frontendRole, ...safeData } = data;
    return await super.update(id, safeData, options);
  }

  /**
   * Cambio de contraseña
   */
  async changePassword(userId, contrasenaActual, nuevaContrasena) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new DomainError(
        ERROR_CATALOG.NOT_FOUND.code,
        'Usuario no encontrado',
        null,
        404
      );
    }

    const isMatch = await bcrypt.compare(contrasenaActual, user.hash_contrasena);
    if (!isMatch) {
      throw new DomainError(
        ERROR_CATALOG.INVALID_CREDENTIALS.code,
        'La contraseña actual ingresada es incorrecta',
        null,
        400
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hash_contrasena = await bcrypt.hash(nuevaContrasena, salt);
    await user.update({ hash_contrasena });

    return { mensaje: 'Contraseña actualizada exitosamente' };
  }
}

export default UsuarioSistemaService;
