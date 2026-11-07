import { Router } from 'express';
import PagosPasarelaController from '../controller/PagosPasarelaController.js';
import checkAuth from '../../../middleware/checkAuth.js';
import checkRoles from '../../../middleware/checkRoles.js';
import {
  paymentGatewayLimiter,
  pciDataSanitizer,
  idempotencyShield,
} from '../../../middleware/paymentSecurityShield.js';

const router = Router();
const controller = new PagosPasarelaController();

// 1. Configuración pública de pasarela Payments Way (sin exponer llaves secretas)
router.get('/config', controller.getConfig);

// 2. Creación de sesión firmada de pago + registro/validación de comprador
router.post(
  '/checkout-session',
  paymentGatewayLimiter,
  idempotencyShield,
  controller.crearCheckoutSession
);

// 3. Procesamiento de pago con tarjeta tokenizada (PCI-DSS + HMAC-SHA256 + Idempotencia)
router.post(
  '/procesar-tarjeta',
  paymentGatewayLimiter,
  pciDataSanitizer,
  idempotencyShield,
  controller.procesarTarjeta
);

// 4. Webhook de confirmación desde Payments Way (verificado con HMAC-SHA256 timingSafeEqual)
router.post(
  '/webhook/paymentsway',
  paymentGatewayLimiter,
  controller.webhookPaymentsWay
);

// 5. Consulta de comprobante de transacción por referencia
router.get('/transaccion/:referencia', controller.obtenerComprobante);

// 6. Listado administrativo de transacciones en base de datos
router.get('/', checkAuth, checkRoles('ADMINISTRADOR', 'EMPRESA_EXPORTADORA'), controller.getAll);

export default router;

