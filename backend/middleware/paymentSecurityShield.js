import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { DomainError } from '../utils/DomainError.js';
import { ERROR_CATALOG } from '../utils/errorCatalog.js';

// Almacén en memoria con TTL para claves de idempotencia (evita cobros dobles por reintentos de red)
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL_MS = 15 * 60 * 1000; // 15 minutos

function pruneIdempotencyCache() {
  const now = Date.now();
  for (const [key, entry] of idempotencyCache.entries()) {
    if (now - entry.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
}

/**
 * Algoritmo de Luhn para verificar integridad de numeración de tarjeta sin almacenar el PAN
 * @param {string} digits
 * @returns {boolean}
 */
export function isValidLuhn(digits = '') {
  const clean = String(digits).replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Detecta la franquicia de la tarjeta a partir del BIN (primeros dígitos)
 * @param {string} digits
 * @returns {string}
 */
export function detectCardFranchise(digits = '') {
  const clean = String(digits).replace(/\D/g, '');
  if (/^4/.test(clean)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
  if (/^3[47]/.test(clean)) return 'AMEX';
  if (/^3(?:0[0-5]|[68])/.test(clean)) return 'DINERS';
  return 'VISA';
}

/**
 * Genera firma HMAC-SHA256 estandarizada para Payments Way Colombia
 * Estructura: merchantId|formId|terminalId|orderNumber|amountCOP|currency
 */
export function generatePaymentsWaySignature({
  merchantId,
  formId,
  terminalId,
  orderNumber,
  amountCOP,
  currency = 'COP',
}) {
  const secret = process.env.PAYMENTSWAY_SECRET_KEY || 'conexcoffee_pw_secret_sandbox_2026';
  const canonicalPayload = [
    String(merchantId || 'PW-MERCHANT-CONEX'),
    String(formId || 'PW-FORM-01'),
    String(terminalId || 'PW-TERM-01'),
    String(orderNumber),
    String(Math.round(Number(amountCOP))),
    String(currency).toUpperCase(),
  ].join('|');

  return crypto.createHmac('sha256', secret).update(canonicalPayload, 'utf8').digest('hex');
}

/**
 * Verifica de manera resistente a ataques de tiempo (timingSafeEqual) una firma HMAC-SHA256
 */
export function verifyPaymentsWaySignature(expectedSignature, providedSignature) {
  if (!expectedSignature || !providedSignature) return false;
  try {
    const expBuf = Buffer.from(String(expectedSignature), 'utf8');
    const provBuf = Buffer.from(String(providedSignature), 'utf8');
    if (expBuf.length !== provBuf.length) return false;
    return crypto.timingSafeEqual(expBuf, provBuf);
  } catch {
    return false;
  }
}

/**
 * Limitador estricto anti-carding para rutas de la pasarela de pagos
 */
export const paymentGatewayLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.DISABLE_RATE_LIMIT === 'true' || Boolean(req.headers['x-bypass-limit']),
  handler: (_req, res) => {
    res.status(429).json({
      status: 'error',
      data: null,
      meta: null,
      error: {
        code: ERROR_CATALOG.RATE_LIMIT_EXCEEDED.code,
        message: 'Demasiados intentos de transacción detectados',
        details:
          'Por protección antifraude de la pasarela Payments Way, las solicitudes desde esta IP han sido limitadas temporalmente.',
      },
    });
  },
});

/**
 * Middleware PCI-DSS: Sanitiza inmediatamente cualquier PAN o CVV accidentalmente enviado,
 * transformándolo en un token efímero en memoria y eliminando los datos sensibles del body.
 */
export function pciDataSanitizer(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    const rawCard = req.body.card || req.body.tarjeta || null;

    if (rawCard && typeof rawCard === 'object') {
      const rawNumber = String(rawCard.number || rawCard.numero || '').replace(/\D/g, '');
      const last4 = rawCard.last4 || (rawNumber.length >= 4 ? rawNumber.slice(-4) : '4242');
      const franchise = rawCard.franchise || rawCard.brand || detectCardFranchise(rawNumber);
      const luhnValid = rawNumber ? isValidLuhn(rawNumber) : true;

      req.body.tokenizedCard = {
        paymentToken:
          req.body.paymentToken ||
          rawCard.paymentToken ||
          `pw_tok_${crypto.randomBytes(12).toString('hex')}`,
        last4,
        franchise,
        holderName: String(rawCard.holderName || rawCard.titular || '').trim().toUpperCase(),
        expiryMonth: String(rawCard.expiryMonth || rawCard.mesExpiracion || '').trim(),
        expiryYear: String(rawCard.expiryYear || rawCard.anioExpiracion || '').trim(),
        installments: Math.min(36, Math.max(1, parseInt(rawCard.installments || rawCard.cuotas, 10) || 1)),
        docType: String(rawCard.docType || rawCard.tipoDocumento || 'CC').trim().toUpperCase(),
        docNumber: String(rawCard.docNumber || rawCard.numeroDocumento || '').trim(),
        luhnValid,
      };

      // Eliminar cualquier PAN completo o CVV para que jamás llegue a logs ni base de datos
      delete req.body.card;
      delete req.body.tarjeta;
    }

    delete req.body.cardNumber;
    delete req.body.numeroTarjeta;
    delete req.body.cvv;
    delete req.body.cvc;
    delete req.body.securityCode;
  }

  next();
}

/**
 * Middleware de Idempotencia: Protege contra cobros duplicados usando X-Idempotency-Key
 */
export function idempotencyShield(req, res, next) {
  pruneIdempotencyCache();
  const key =
    req.headers['x-idempotency-key'] ||
    req.body?.idempotencyKey ||
    null;

  if (!key) {
    return next();
  }

  const normalizedKey = String(key).trim().slice(0, 120);
  const existing = idempotencyCache.get(normalizedKey);

  if (existing) {
    if (existing.status === 'IN_PROGRESS') {
      return next(
        new DomainError(
          ERROR_CATALOG.PAYMENT_IDEMPOTENCY_CONFLICT.code,
          ERROR_CATALOG.PAYMENT_IDEMPOTENCY_CONFLICT.message,
          'Ya existe una transacción en curso con esta misma clave de idempotencia.',
          409
        )
      );
    }

    if (existing.status === 'COMPLETED' && existing.response) {
      return res.status(200).json(existing.response);
    }
  }

  idempotencyCache.set(normalizedKey, {
    status: 'IN_PROGRESS',
    timestamp: Date.now(),
    response: null,
  });

  // Interceptar res.json para almacenar el resultado exitoso de la operación idempotente
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(normalizedKey, {
        status: 'COMPLETED',
        timestamp: Date.now(),
        response: body,
      });
    } else {
      idempotencyCache.delete(normalizedKey);
    }
    return originalJson(body);
  };

  next();
}

