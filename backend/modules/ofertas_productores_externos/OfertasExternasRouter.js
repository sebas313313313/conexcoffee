import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import checkAuth from '../../middleware/checkAuth.js';
import { DomainError } from '../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../utils/errorCatalog.js';
import OfertasExternasService from './OfertasExternasService.js';

const text = (max) => Joi.string().trim().max(max).required();
const captcha = Joi.string().max(2048).required();
const token = Joi.string().pattern(/^[a-f0-9]{64}$/).required();
const tokenBody = Joi.object({ token });
const submission = Joi.object({
  nombres: text(100), apellidos: text(100),
  correo_electronico: text(150).lowercase().email({ tlds: { allow: false } }),
  telefono_movil: text(20).pattern(/^\+?[0-9 ()-]{7,20}$/),
  departamento: text(50), municipio: text(50), variedad: text(100),
  proceso: Joi.string().valid('LAVADO', 'NATURAL', 'HONEY', 'ANAEROBICO', 'DOBLE_FERMENTACION', 'OTRO').required(),
  cantidad_sacos: Joi.number().integer().min(1).max(2147483647).required(),
  peso_total_kg: Joi.number().precision(2).min(0.01).max(99999999.99).required(),
  precio_kg_cop: Joi.number().precision(2).min(0.01).max(999999999999.99).required(),
  condiciones_version: Joi.string().valid('2026-11-11').required(),
  acepta_condiciones: Joi.boolean().valid(true).required(), captcha,
});
const acceptance = Joi.object({
  token, captcha,
  tipo_documento: Joi.string().valid('CC', 'CE', 'NIT', 'PASAPORTE').required(),
  numero_documento: text(25).uppercase().pattern(/^[A-Z0-9-]+$/),
  genero: Joi.string().valid('Masculino', 'Femenino', 'Otro', 'Prefiero no responder').required(),
  contrasena: Joi.string().min(12).max(72, 'utf8').required(),
});

function validate(schema, input) {
  const { error, value } = schema.validate(input);
  if (error) {
    const field = error.details[0].path[0];
    const message = field === 'contrasena' ? 'Usa una contraseña de al menos 12 caracteres y máximo 72 bytes.'
      : field === 'acepta_condiciones' || field === 'condiciones_version' ? 'Acepta las condiciones vigentes para publicar.'
        : `Revisa el campo ${field?.replaceAll('_', ' ') || 'solicitado'}.`;
    throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code, message, field, 422);
  }
  return value;
}

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof DomainError) return next(error);
    console.error('Error en ofertas de productores externos.', error.original?.code || error.name);
    return next(new DomainError(ERROR_CATALOG.INTERNAL_ERROR.code,
      'No se pudo procesar la solicitud.', null, 500));
  }
};
const reply = (res, data, status = 200, meta = null) => res.status(status).json({ status: 'success', data, meta, error: null });

export const ofertasExternasService = new OfertasExternasService();
const router = Router();
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
  handler: (_req, _res, next) => next(new DomainError(ERROR_CATALOG.RATE_LIMIT_EXCEEDED.code,
    'Demasiados intentos. Vuelve a intentarlo en unos minutos.', null, 429)) });
const companyOnly = [checkAuth, (req, _res, next) => {
  if (req.userRole === 'EMPRESA_EXPORTADORA') return next();
  return next(new DomainError(ERROR_CATALOG.ROLE_UNAUTHORIZED.code,
    'Esta acción está disponible para empresas exportadoras.', null, 403));
}];

router.post('/', publicLimiter, handle(async (req, res) => {
  await ofertasExternasService.submit(validate(submission, req.body), req.ip);
  reply(res, null, 201);
}));
router.post('/confirmar', publicLimiter, handle(async (req, res) => {
  const { token: value } = validate(tokenBody, req.body);
  reply(res, await ofertasExternasService.confirm(value));
}));
router.post('/invitacion', publicLimiter, handle(async (req, res) => {
  const { token: value } = validate(tokenBody, req.body);
  res.set('Cache-Control', 'no-store');
  reply(res, await ofertasExternasService.preview(value));
}));
router.post('/invitacion/aceptar', publicLimiter, handle(async (req, res) => {
  await ofertasExternasService.accept(validate(acceptance, req.body), req.ip);
  reply(res, null, 201);
}));
router.get('/', ...companyOnly, handle(async (req, res) => {
  const { page } = validate(Joi.object({ page: Joi.number().integer().min(1).max(1000000).default(1) }), req.query);
  const result = await ofertasExternasService.list(req.userId, page);
  res.set('Cache-Control', 'no-store');
  reply(res, result.data, 200, result.meta);
}));
router.post('/:id/invitar', ...companyOnly, handle(async (req, res) => {
  const { id } = validate(Joi.object({ id: Joi.string().uuid().required() }), req.params);
  reply(res, await ofertasExternasService.invite(req.userId, id), 201);
}));

export default router;
