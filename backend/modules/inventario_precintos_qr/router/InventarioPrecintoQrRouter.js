import { Router } from 'express';
import InventarioPrecintoQrController from '../controller/InventarioPrecintoQrController.js';
import checkAuth from '../../../middleware/checkAuth.js';
import checkRoles from '../../../middleware/checkRoles.js';

const router = Router();
const controller = new InventarioPrecintoQrController();

router.get('/', checkAuth, (req, res) =>
  controller.execute(res, () => controller.service.listar(req.user, req.query)));
router.post('/lotes', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.crearLote(req.user, req.body), 201));
router.post('/entregas', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.entregarLote(req.user, req.body)));
router.post('/vincular-saco', checkAuth, checkRoles('ASISTENTE_TECNICO'), (req, res) =>
  controller.execute(res, () => controller.service.vincularSaco(req.user, req.body), 201));
router.patch('/vinculos/:token', checkAuth, checkRoles('ASISTENTE_TECNICO'), (req, res) =>
  controller.execute(res, () => controller.service.corregirVinculo(req.user, req.params.token, req.body)));
router.patch('/:id/anular', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.anular(req.user, req.params.id, req.body?.motivo)));
router.delete('/:id', checkAuth, checkRoles('ADMINISTRADOR'), controller.delete);

export default router;
