import { Router } from 'express';
import TrazabilidadEscaneoController from '../controller/TrazabilidadEscaneoController.js';
import checkAuth from '../../../middleware/checkAuth.js';
import { sensitiveLimiter } from '../../../middleware/rateLimiter.js';

const router = Router();
const controller = new TrazabilidadEscaneoController();

router.get('/ficha/:token', (req, res) =>
  controller.execute(res, () => controller.service.obtenerFichaPublica(req.params.token)));
router.get('/flujo/:token', checkAuth, (req, res) =>
  controller.execute(res, () => controller.service.obtenerFlujo(req.params.token, req.user)));
router.post('/laboratorio/:token/analisis', checkAuth, (req, res) =>
  controller.execute(res, () => controller.service.registrarAnalisisDesdeQr(req.params.token, req.user, req.body), 201));

// Compatibilidad con QR impresos antes de introducir la página de trazabilidad.
router.get('/publico/:tokenQrExterno', (req, res, next) => {
  const frontendBase = process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
  if (req.headers.accept?.includes('text/html') && /^https?:\/\//.test(frontendBase)) {
    return res.redirect(302, `${frontendBase.replace(/\/$/, '')}/trazabilidad/${encodeURIComponent(req.params.tokenQrExterno)}`);
  }
  next();
}, controller.obtenerTrazabilidadPublica);

// Alias técnico protegido: devuelve únicamente el flujo autorizado del AT o laboratorio.
router.get('/tecnico/:tokenQrExterno', sensitiveLimiter, checkAuth, controller.obtenerTrazabilidadTecnica);

// Bitácora de escaneos general
router.get('/', checkAuth, controller.getAll);
router.get('/:id', checkAuth, controller.getById);

export default router;
