import { Router } from 'express';
import SesionCatacionController from '../controller/SesionCatacionController.js';
import checkAuth from '../../../middleware/checkAuth.js';
import checkRoles from '../../../middleware/checkRoles.js';

const router = Router();
const controller = new SesionCatacionController();

router.get('/', checkAuth, controller.getAll);
router.get('/codigo/:codigo/qr', checkAuth, checkRoles('CATADOR'), controller.getQrPreview);
router.post('/codigo/:codigo/asignar-qr', checkAuth, checkRoles('CATADOR'), controller.assignFromQr);
router.get('/codigo/:codigo', checkAuth, controller.getByCodigo);
router.get('/:id/qr', checkAuth, checkRoles('ADMINISTRADOR', 'EMPRESA_EXPORTADORA', 'LABORATORIO'), controller.getQrPayload);
router.get('/:id', checkAuth, controller.getById);
router.get('/:id/detalles', checkAuth, controller.getWithDetails);

router.post('/', checkAuth, checkRoles('ADMINISTRADOR', 'CATADOR', 'LABORATORIO', 'EMPRESA_EXPORTADORA'), controller.create);
router.put('/:id', checkAuth, checkRoles('ADMINISTRADOR', 'CATADOR', 'LABORATORIO'), controller.update);
router.delete('/:id', checkAuth, checkRoles('ADMINISTRADOR'), controller.delete);

export default router;
