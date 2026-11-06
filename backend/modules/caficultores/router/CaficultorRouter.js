import { Router } from 'express';
import CaficultorController from '../controller/CaficultorController.js';
import checkAuth from '../../../middleware/checkAuth.js';
import checkRoles from '../../../middleware/checkRoles.js';

const router = Router();
const controller = new CaficultorController();

// Rutas autenticadas
router.get('/mi-perfil', checkAuth, controller.getByUsuarioId);
router.get('/', checkAuth, (req, res) =>
  controller.execute(res, () => controller.service.listForActor(req.user, req.query)));
router.get('/:id', checkAuth, (req, res) =>
  controller.execute(res, () => controller.service.caficultorForActor(req.user, req.params.id)));
router.post('/', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.createForActor(req.user, req.body), 201));
router.put('/:id', checkAuth, checkRoles('EMPRESA_EXPORTADORA'), (req, res) =>
  controller.execute(res, () => controller.service.updateForActor(req.user, req.params.id, req.body)));
router.delete('/:id', checkAuth, checkRoles('ADMINISTRADOR'), controller.delete);

// Endpoint especializado para actualización de verificación (Empresas aliadas y Admin)
router.patch('/:id/verificacion', checkAuth, checkRoles('ADMINISTRADOR', 'EMPRESA_EXPORTADORA'), controller.updateEstadoVerificacion);

export default router;
