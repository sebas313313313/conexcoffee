import { DataTypes, Model, Op } from 'sequelize';
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
PublicacionBlog.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  autor_id: { type: DataTypes.UUID, allowNull: false },
  caficultor_destacado_id: { type: DataTypes.UUID, allowNull: true },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
  extracto: { type: DataTypes.TEXT, allowNull: false },
  contenido_markdown: { type: DataTypes.TEXT, allowNull: false },
  imagen_destacada_url: { type: DataTypes.TEXT, allowNull: false },
  url_video_youtube: { type: DataTypes.TEXT, allowNull: true },
  publicado: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: true },
  fecha_publicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
}, { sequelize, modelName: 'PublicacionBlog', tableName: 'publicaciones_blog',
  schema: 'comunicacion', timestamps: false });

export const publicacionSchema = Joi.object({
  titulo: Joi.string().trim().max(200).required(),
  slug: Joi.string().trim().max(220).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required(),
  extracto: Joi.string().trim().required(),
  contenido_markdown: Joi.string().required(),
  imagen_destacada_url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  url_video_youtube: Joi.string().uri({ scheme: ['https'] }).custom((value, helpers) => {
    const host = new URL(value).hostname;
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)
      ? value : helpers.error('any.invalid');
  }).allow(null, ''),
  caficultor_destacado_id: Joi.string().guid().allow(null, ''),
  publicado: Joi.boolean().required(),
  fecha_publicacion: Joi.string().isoDate().required(),
});
export function validarPublicacion(data) {
  const { error, value } = publicacionSchema.validate(data, { abortEarly: false });
  if (error) throw new DomainError('CC-0000', error.details.map(d => d.message).join('; '), null, 422);
  return { ...value, caficultor_destacado_id: value.caficultor_destacado_id || null,
    url_video_youtube: value.url_video_youtube || null };
}
class BlogService extends BaseService {
  constructor() { super(new BaseRepository(PublicacionBlog), 'Publicación del blog'); }
  async guardar(data, usuarioId, id) {
    const payload = validarPublicacion(data);
    if (payload.caficultor_destacado_id) {
      const [rows] = await sequelize.query('SELECT id FROM personas.caficultores WHERE id = :id',
        { replacements: { id: payload.caficultor_destacado_id } });
      if (!rows.length) throw new DomainError('CC-0000', 'El caficultor destacado no existe', null, 422);
    }
    if (id) return this.update(id, payload);
    const [autores] = await sequelize.query('SELECT id FROM personas.administradores WHERE usuario_id = :uid LIMIT 1',
      { replacements: { uid: usuarioId } });
    if (!autores.length) throw new DomainError('CC-0000', 'Tu cuenta no tiene un perfil en personas.administradores para firmar la publicación', null, 422);
    return this.create({ ...payload, autor_id: autores[0].id });
  }
}
const service = new BlogService();
const controller = new BaseController(service);
const router = Router();
// Lectura pública: no aceptar filtros del cliente que expongan borradores.
export async function listarPublicacionesPublicas(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const { rows, count } = await PublicacionBlog.findAndCountAll({
    where: { publicado: true, fecha_publicacion: { [Op.lte]: new Date() } },
    attributes: ['id', 'titulo', 'slug', 'extracto', 'contenido_markdown',
      'imagen_destacada_url', 'url_video_youtube', 'fecha_publicacion'],
    order: [['fecha_publicacion', 'DESC'], ['id', 'DESC']], limit, offset: (page - 1) * limit,
  });
  return { data: rows, meta: { page, limit, totalRecords: count, totalPages: Math.ceil(count / limit) } };
}
router.get('/publicas', (req, res) => controller.execute(res, () => listarPublicacionesPublicas(req.query)));
router.use(checkAuth, checkRoles('ADMINISTRADOR'));
router.param('id', (req, res, next, id) => {
  const { error } = Joi.string().guid().validate(id);
  if (error) return next(new DomainError('CC-0000', 'ID de publicación inválido', null, 422));
  next();
});
router.get('/', (req, res) => controller.execute(res, () => service.getAll({ page: req.query.page, limit: req.query.limit })));
router.get('/:id', controller.getById);
router.post('/', (req, res) => controller.execute(res, () => service.guardar(req.body, req.user.id), 201));
router.put('/:id', (req, res) => controller.execute(res, () => service.guardar(req.body, req.user.id, req.params.id)));
router.delete('/:id', controller.delete);
export default router;
