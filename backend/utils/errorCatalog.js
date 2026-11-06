import { DomainError } from './DomainError.js';

/**
 * Catálogo Maestro de Códigos de Error Institucionales ConexCoffee (CC-XXXX)
 * Sincronizado con la tabla auditoria.catalogo_errores y estándares REST.
 */
export const ERROR_CATALOG = {
  // Códigos del Sistema y API REST
  INTERNAL_ERROR: {
    code: 'CC-0000',
    category: 'SISTEMA',
    message: 'Error interno no controlado en el servidor',
    statusCode: 500
  },
  INVALID_CREDENTIALS: {
    code: 'CC-0001',
    category: 'AUTENTICACION',
    message: 'Credenciales inválidas o cuenta inactiva',
    statusCode: 401
  },
  AUTH_TOKEN_MISSING: {
    code: 'CC-0002',
    category: 'AUTENTICACION',
    message: 'Token de autenticación no proporcionado o formato inválido',
    statusCode: 401
  },
  SESSION_EXPIRED: {
    code: 'CC-0003',
    category: 'AUTENTICACION',
    message: 'La sesión ha expirado o el token ha sido revocado',
    statusCode: 401
  },
  NOT_FOUND: {
    code: 'CC-0004',
    category: 'SISTEMA',
    message: 'El recurso solicitado no fue encontrado',
    statusCode: 404
  },
  VALIDATION_ERROR: {
    code: 'CC-0005',
    category: 'VALIDACION',
    message: 'Los datos enviados no superaron la validación de esquema',
    statusCode: 422
  },
  DUPLICATE_RESOURCE: {
    code: 'CC-0006',
    category: 'CONFLICO',
    message: 'Ya existe un registro con los mismos identificadores únicos',
    statusCode: 409
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'CC-0007',
    category: 'SEGURIDAD',
    message: 'Demasiadas solicitudes. Límite de tasa excedido temporalmente.',
    statusCode: 429
  },
  CORS_FORBIDDEN: {
    code: 'CC-0008',
    category: 'SEGURIDAD',
    message: 'El origen de la petición no está autorizado por la política CORS',
    statusCode: 403
  },

  // Códigos de Negocio y Dominio (DDL ConexCoffee)
  ROLE_UNAUTHORIZED: {
    code: 'CC-0A10',
    category: 'PERMISOS',
    message: 'El rol actual no tiene autorización para ejecutar esta acción',
    statusCode: 403
  },
  QR_DUPLICATE_OR_CLAIMED: {
    code: 'CC-0E15',
    category: 'SEGURIDAD_QR',
    message: 'Intento de registro o escaneo de código QR duplicado o ya canjeado',
    statusCode: 400
  },
  QR_INTERNAL_PREMATURE_OPEN: {
    code: 'CC-0E16',
    category: 'SEGURIDAD_QR',
    message: 'Apertura de QR interno fuera de la etapa de destino (Posible fraude en tránsito)',
    statusCode: 403
  },
  SCA_SCORE_INSUFFICIENT: {
    code: 'CC-0C20',
    category: 'CALIDAD_SCA',
    message: 'El puntaje total SCA es inferior al mínimo requerido de 80.00 puntos',
    statusCode: 422
  },
  HUMIDITY_OUT_OF_RANGE: {
    code: 'CC-0C21',
    category: 'CALIDAD_FISICA',
    message: 'Humedad en pergamino seco fuera de rango permitido (10% - 12%)',
    statusCode: 422
  },
  TRILLA_CRITICAL_DEFECT: {
    code: 'CC-0E24',
    category: 'CALIDAD_TRILLA',
    message: 'Detección de defecto crítico (Fenol, fermento o sobrehumedad > 12.5%) en Evaluación 2',
    statusCode: 422
  },
  SAIL_UNPAID_BALANCE: {
    code: 'CC-0F30',
    category: 'PAGOS',
    message: 'Intento de autorizar zarpe marítimo sin liquidación del saldo restante (70%-75%)',
    statusCode: 400
  },
  CONTAINER_CAPACITY_EXCEEDED: {
    code: 'CC-0L40',
    category: 'LOGISTICA',
    message: 'Capacidad máxima de contenedor virtual excedida',
    statusCode: 400
  },
  PAYMENT_INVALID_SIGNATURE: {
    code: 'CC-0F31',
    category: 'PAGOS_SEGURIDAD',
    message: 'Firma criptográfica de pasarela inválida o alterada',
    statusCode: 401
  },
  PAYMENT_IDEMPOTENCY_CONFLICT: {
    code: 'CC-0F32',
    category: 'PAGOS_SEGURIDAD',
    message: 'Esta transacción ya está siendo procesada o ya fue ejecutada (Idempotencia)',
    statusCode: 409
  },
  PAYMENT_AMOUNT_TAMPERED: {
    code: 'CC-0F33',
    category: 'PAGOS_SEGURIDAD',
    message: 'Discrepancia detectada en los montos del carrito frente al catálogo oficial',
    statusCode: 422
  },
  PAYMENT_GATEWAY_REJECTED: {
    code: 'CC-0F34',
    category: 'PAGOS',
    message: 'La transacción fue rechazada por la pasarela Payments Way o la entidad emisora',
    statusCode: 402
  },
  PAYMENT_SESSION_EXPIRED: {
    code: 'CC-0F35',
    category: 'PAGOS_SEGURIDAD',
    message: 'La sesión de pago ha expirado o ya fue utilizada',
    statusCode: 400
  }
};

/**
 * Función para crear una excepción de dominio rápidamente a partir de una llave del catálogo
 * @param {keyof typeof ERROR_CATALOG} errorKey
 * @param {string} [customDetails=null]
 * @param {string} [customMessage=null]
 * @returns {DomainError}
 */
export const createDomainError = (errorKey, customDetails = null, customMessage = null) => {
  const item = ERROR_CATALOG[errorKey] || ERROR_CATALOG.INTERNAL_ERROR;
  return new DomainError(
    item.code,
    customMessage || item.message,
    customDetails,
    item.statusCode
  );
};
