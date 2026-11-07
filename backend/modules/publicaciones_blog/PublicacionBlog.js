import { DataTypes, Model } from 'sequelize';
import { Router } from 'express';
import Joi from 'joi';
import { sequelize } from '../../config/database.js';
import BaseRepository from '../baseRepository.js';
import BaseService from '../baseService.js';
import BaseController from '../baseController.js';
import checkAuth from '../../middleware/checkAuth.js';
import checkRoles from '../../middleware/checkRoles.js';
import { DomainError } from '../../utils/DomainError.js';

export class PublicacionBlog extends Model {}

PublicacionBlog.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    autor_id: { type: DataTypes.UUID, allowNull: false },
    caficultor_destacado_id: { type: DataTypes.UUID, allowNull: true },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    extracto: { type: DataTypes.TEXT, allowNull: false },
    contenido_markdown: { type: DataTypes.TEXT, allowNull: false },
    imagen_destacada_url: { type: DataTypes.TEXT, allowNull: false },
    url_video_youtube: { type: DataTypes.TEXT, allowNull: true },
    url_evento: { type: DataTypes.TEXT, allowNull: true },
    publicado: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: true },
    fecha_publicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PublicacionBlog',
    tableName: 'publicaciones_blog',
    schema: 'comunicacion',
    timestamps: false,
  }
);

let tableEnsured = false;
async function ensureBlogTable() {
  if (tableEnsured) return;
  try {
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS comunicacion;');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS comunicacion.publicaciones_blog (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        autor_id UUID NOT NULL,
        caficultor_destacado_id UUID NULL,
        titulo VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        extracto TEXT NOT NULL,
        contenido_markdown TEXT NOT NULL,
        imagen_destacada_url TEXT NOT NULL,
        url_video_youtube TEXT NULL,
        url_evento TEXT NULL,
        publicado BOOLEAN DEFAULT true,
        fecha_publicacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sequelize.query(
      'ALTER TABLE comunicacion.publicaciones_blog ADD COLUMN IF NOT EXISTS url_evento TEXT NULL;'
    );
    tableEnsured = true;
  } catch {
    // Continuar con manejo estándar si los permisos de rol no permiten DDL
  }
}

export const publicacionSchema = Joi.object({
  titulo: Joi.string().trim().max(200).required(),
  slug: Joi.string()
    .trim()
    .max(220)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  extracto: Joi.string().trim().required(),
  contenido_markdown: Joi.string().required(),
  imagen_destacada_url: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (value.startsWith('/')) return value;
      try {
        const parsed = new URL(value);
        if (['http:', 'https:'].includes(parsed.protocol)) return value;
      } catch {
        // Ignorar
      }
      return helpers.error('any.invalid');
    })
    .required(),
  url_video_youtube: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow(null, ''),
  url_evento: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow(null, ''),
  urlEvento: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow(null, ''),
  caficultor_destacado_id: Joi.string().guid().allow(null, ''),
  publicado: Joi.boolean().default(true),
  fecha_publicacion: Joi.string().isoDate().optional(),
}).unknown(true);

export function validarPublicacion(data = {}) {
  const normalizedInput = {
    ...data,
    slug:
      data.slug ||
      String(data.titulo || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
  };

  const { error, value } = publicacionSchema.validate(normalizedInput, { abortEarly: false });
  if (error) {
    throw new DomainError(
      'CC-0005',
      error.details.map((d) => d.message).join('; '),
      null,
      422
    );
  }

  return {
    titulo: value.titulo,
    slug: value.slug,
    extracto: value.extracto,
    contenido_markdown: value.contenido_markdown,
    imagen_destacada_url: value.imagen_destacada_url,
    url_video_youtube: value.url_video_youtube || null,
    url_evento: value.url_evento || value.urlEvento || null,
    caficultor_destacado_id: value.caficultor_destacado_id || null,
    publicado: value.publicado ?? true,
    fecha_publicacion: value.fecha_publicacion || new Date().toISOString(),
  };
}

class BlogService extends BaseService {
  constructor() {
    super(new BaseRepository(PublicacionBlog), 'Publicación del blog');
  }

  async resolveAutorId(usuarioId) {
    try {
      const [autores] = await sequelize.query(
        'SELECT id FROM personas.administradores WHERE usuario_id = :uid LIMIT 1',
        { replacements: { uid: usuarioId } }
      );
      if (autores.length > 0) return autores[0].id;

      // Si el usuario SuperAdmin aún no tiene fila en personas.administradores, crearla automáticamente
      const [inserted] = await sequelize.query(
        `INSERT INTO personas.administradores (usuario_id, nombres, apellidos, cargo, departamento)
         VALUES (:uid, 'Administrador', 'ConexCoffee', 'Super Administrador', 'Dirección')
         ON CONFLICT DO NOTHING
         RETURNING id`,
        { replacements: { uid: usuarioId } }
      );
      if (inserted.length > 0) return inserted[0].id;

      const [anyAdmin] = await sequelize.query(
        'SELECT id FROM personas.administradores LIMIT 1'
      );
      if (anyAdmin.length > 0) return anyAdmin[0].id;
    } catch {
      // Si la tabla personas.administradores no está disponible, usar el usuarioId
    }
    return usuarioId;
  }

  async guardar(data, usuarioId, id) {
    await ensureBlogTable();
    const payload = validarPublicacion(data);

    if (payload.caficultor_destacado_id) {
      const [rows] = await sequelize.query(
        'SELECT id FROM personas.caficultores WHERE id = :id',
        { replacements: { id: payload.caficultor_destacado_id } }
      );
      if (!rows.length) {
        payload.caficultor_destacado_id = null;
      }
    }

    if (id) {
      return this.update(id, payload);
    }

    const autor_id = await this.resolveAutorId(usuarioId);
    return this.create({ ...payload, autor_id });
  }
}

const service = new BlogService();
const controller = new BaseController(service);
const router = Router();

export async function listarPublicacionesPublicas(query = {}) {
  await ensureBlogTable();
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const { rows, count } = await PublicacionBlog.findAndCountAll({
    where: { publicado: true },
    attributes: [
      'id',
      'titulo',
      'slug',
      'extracto',
      'contenido_markdown',
      'imagen_destacada_url',
      'url_video_youtube',
      'url_evento',
      'publicado',
      'fecha_publicacion',
    ],
    order: [
      ['fecha_publicacion', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset: (page - 1) * limit,
  });
  return {
    data: rows,
    meta: { page, limit, totalRecords: count, totalPages: Math.max(1, Math.ceil(count / limit)) },
  };
}

router.get('/publicas', (req, res) =>
  controller.execute(res, () => listarPublicacionesPublicas(req.query))
);

router.use(checkAuth, checkRoles('ADMINISTRADOR'));

router.param('id', (req, _res, next, id) => {
  const { error } = Joi.string().guid().validate(id);
  if (error) return next(new DomainError('CC-0005', 'ID de publicación inválido', null, 422));
  next();
});

router.get('/', (req, res) =>
  controller.execute(res, async () => {
    await ensureBlogTable();
    return service.getAll({ page: req.query.page, limit: req.query.limit });
  })
);
router.get('/:id', controller.getById);
router.post('/', (req, res) =>
  controller.execute(res, () => service.guardar(req.body, req.user.id), 201)
);
router.put('/:id', (req, res) =>
  controller.execute(res, () => service.guardar(req.body, req.user.id, req.params.id))
);
router.delete('/:id', controller.delete);

export default router;
