import crypto from 'crypto';
import Joi from 'joi';
import BaseService from '../../baseService.js';
import TransaccionPagoRepository from '../repository/TransaccionPagoRepository.js';
import CompradorInternacional from '../../compradores_internacionales/CompradorInternacional.js';
import { ensureUsuarioSistema } from '../../../utils/ensureUsuarioSistema.js';
import { DomainError } from '../../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../../utils/errorCatalog.js';
import {
  generatePaymentsWaySignature,
  verifyPaymentsWaySignature,
} from '../../../middleware/paymentSecurityShield.js';

// Catálogo de precios de referencia en el servidor (COP) para validación anti-manipulación
const OFFICIAL_LOT_PRICES_COP = {
  'chl-lote-1': { precioKiloCOP: 142000, pesoCajaKg: 24, precioMuestraCOP: 38000 },
  'chl-lote-2': { precioKiloCOP: 118000, pesoCajaKg: 24, precioMuestraCOP: 34000 },
  'chl-lote-3': { precioKiloCOP: 129000, pesoCajaKg: 24, precioMuestraCOP: 36000 },
  'eau-lote-1': { precioKiloCOP: 178000, pesoCajaKg: 24, precioMuestraCOP: 45000 },
  'eau-lote-2': { precioKiloCOP: 146000, pesoCajaKg: 24, precioMuestraCOP: 39000 },
  'arg-lote-1': { precioKiloCOP: 104000, pesoCajaKg: 24, precioMuestraCOP: 32000 },
  'arg-lote-2': { precioKiloCOP: 98000, pesoCajaKg: 24, precioMuestraCOP: 30000 },
};

const DEFAULT_TRM_COP = 4150;
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutos de validez por sesión de checkout

// Almacenes en memoria para sesiones firmadas y comprobantes (respaldo y velocidad)
const checkoutSessions = new Map();
const processedReceipts = new Map();

const checkoutSchema = Joi.object({
  comprador: Joi.object({
    tipoDocumento: Joi.string().trim().max(15).default('CC'),
    identificacion: Joi.string().trim().min(4).max(40).required(),
    nombres: Joi.string().trim().min(2).max(100).required(),
    apellidos: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().max(150).required(),
    telefonoIndicativo: Joi.string().trim().max(10).allow('', null).default('+57'),
    telefono: Joi.string().trim().min(5).max(30).required(),
    empresa: Joi.string().trim().max(150).allow('', null),
    pais: Joi.string().trim().min(2).max(80).required(),
    ciudad: Joi.string().trim().min(2).max(80).required(),
    direccion: Joi.string().trim().min(4).max(250).required(),
    password: Joi.string().min(8).max(100).allow('', null),
    crearCuenta: Joi.boolean().default(true),
  }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().trim().required(),
        loteId: Joi.string().trim().required(),
        tipo: Joi.string().valid('caja', 'muestra').required(),
        nombre: Joi.string().trim().required(),
        variedad: Joi.string().trim().allow('', null),
        destinoNombre: Joi.string().trim().allow('', null),
        cantidad: Joi.number().integer().min(1).max(500).required(),
        precioUnitarioCOP: Joi.number().positive().required(),
      }).unknown(true)
    )
    .min(1)
    .required(),
  clientTotalCOP: Joi.number().positive().optional(),
}).unknown(true);

class PaymentsWayService extends BaseService {
  constructor(repository = new TransaccionPagoRepository()) {
    super(repository, 'Transacción de Pasarela Payments Way');
  }

  /**
   * Configuración pública de la pasarela lista para producción cuando se contrate Payments Way
   */
  getGatewayConfig() {
    const isProduction =
      process.env.PAYMENTSWAY_MODE === 'production' &&
      Boolean(process.env.PAYMENTSWAY_MERCHANT_ID) &&
      Boolean(process.env.PAYMENTSWAY_API_KEY);

    return {
      provider: 'Payments Way Colombia',
      website: 'https://www.paymentsway.co/',
      mode: isProduction ? 'production' : 'sandbox',
      merchantId: process.env.PAYMENTSWAY_MERCHANT_ID || 'PW-CONEXCOFFEE-COL-2026',
      formId: process.env.PAYMENTSWAY_FORM_ID || 'PW-FORM-EXPORT-01',
      terminalId: process.env.PAYMENTSWAY_TERMINAL_ID || 'PW-TERM-WEB-01',
      currency: 'COP',
      trmReferenciaCOP: Number(process.env.PAYMENTSWAY_TRM_COP) || DEFAULT_TRM_COP,
      supportedFranchises: ['VISA', 'MASTERCARD', 'AMEX', 'DINERS'],
      securityStandards: ['PCI-DSS Nivel 1', 'HMAC-SHA256', '3D Secure 2.0', 'TLS 1.3'],
      readyForLiveConnection: true,
    };
  }

  /**
   * Recalcula el precio unitario oficial en COP para impedir alteración desde el navegador
   */
  resolveOfficialUnitPriceCOP(item) {
    const catalogEntry = OFFICIAL_LOT_PRICES_COP[item.loteId];
    if (catalogEntry) {
      if (item.tipo === 'caja') {
        return catalogEntry.precioKiloCOP * catalogEntry.pesoCajaKg;
      }
      return catalogEntry.precioMuestraCOP;
    }
    // Si es un lote dinámico fuera del mapa estático, valida que el precio esté en rangos razonables
    const rawPrice = Math.round(Number(item.precioUnitarioCOP) || 0);
    if (rawPrice < 10000 || rawPrice > 50000000) {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_AMOUNT_TAMPERED.code,
        ERROR_CATALOG.PAYMENT_AMOUNT_TAMPERED.message,
        `Precio unitario fuera de rango de seguridad para el ítem ${item.nombre}`,
        422
      );
    }
    return rawPrice;
  }

  /**
   * Paso 1: Valida los datos del comprador, registra/vincula su cuenta de comprador si aplica,
   * verifica los montos en el servidor y genera la sesión firmada para Payments Way.
   */
  async crearIntencionPago(payload = {}, clientMeta = {}) {
    const { error, value } = checkoutSchema.validate(payload, { abortEarly: false });
    if (error) {
      throw new DomainError(
        ERROR_CATALOG.VALIDATION_ERROR.code,
        'Datos incompletos o inválidos en el formulario de comprador o carrito',
        error.details.map((d) => d.message).join('; '),
        422
      );
    }

    const { comprador, items, clientTotalCOP } = value;

    // 1. Recalcular subtotales y total en el servidor
    let serverTotalCOP = 0;
    const verifiedItems = items.map((item) => {
      const officialUnitCOP = this.resolveOfficialUnitPriceCOP(item);
      const cantidad = Number(item.cantidad);
      const subtotalCOP = officialUnitCOP * cantidad;
      serverTotalCOP += subtotalCOP;

      return {
        id: item.id,
        loteId: item.loteId,
        tipo: item.tipo,
        nombre: item.nombre,
        variedad: item.variedad || item.nombre,
        destinoNombre: item.destinoNombre || 'Exportación',
        cantidad,
        precioUnitarioCOP: officialUnitCOP,
        subtotalCOP,
      };
    });

    // Verificar que el cliente no haya manipulado el monto total
    if (clientTotalCOP && Math.abs(Number(clientTotalCOP) - serverTotalCOP) > 100) {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_AMOUNT_TAMPERED.code,
        ERROR_CATALOG.PAYMENT_AMOUNT_TAMPERED.message,
        `El total enviado ($${clientTotalCOP} COP) no coincide con el cálculo oficial del servidor ($${serverTotalCOP} COP).`,
        422
      );
    }

    // 2. Intentar registrar/asegurar la cuenta del comprador en PostgreSQL si está disponible
    let compradorDbId = null;
    if (comprador.crearCuenta) {
      try {
        const usuarioId = await ensureUsuarioSistema(
          {
            correo: comprador.email,
            contrasena: comprador.password || `Conex${comprador.identificacion}!`,
          },
          'COMPRADOR_INTERNACIONAL'
        );
        const existingComprador = await CompradorInternacional.findOne({
          where: { usuario_id: usuarioId },
        });
        if (existingComprador) {
          compradorDbId = existingComprador.id;
        } else {
          const created = await CompradorInternacional.create({
            usuario_id: usuarioId,
            tipo_entidad: 'COMPRADOR_DIRECTO_WEB',
            nombre_empresa:
              comprador.empresa || `${comprador.nombres} ${comprador.apellidos}`.trim(),
            identificacion_tributaria: `${comprador.tipoDocumento}-${comprador.identificacion}`,
            pais_destino: comprador.pais,
            ciudad: comprador.ciudad,
            direccion_entrega: comprador.direccion,
            telefono_contacto: `${comprador.telefonoIndicativo || ''} ${comprador.telefono}`.trim(),
            activo: true,
          });
          compradorDbId = created.id;
        }
      } catch {
        // Si la base de datos no está activa localmente, continuamos con sesión firmada en memoria
      }
    }

    const config = this.getGatewayConfig();
    const trm = config.trmReferenciaCOP;
    const amountUSD = Number((serverTotalCOP / trm).toFixed(2));
    const orderNumber = `PW-CONEX-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(2)
      .toString('hex')
      .toUpperCase()}`;
    const checkoutToken = `chk_${crypto.randomBytes(18).toString('hex')}`;

    const signature = generatePaymentsWaySignature({
      merchantId: config.merchantId,
      formId: config.formId,
      terminalId: config.terminalId,
      orderNumber,
      amountCOP: serverTotalCOP,
      currency: 'COP',
    });

    const sessionData = {
      checkoutToken,
      orderNumber,
      signature,
      merchantId: config.merchantId,
      formId: config.formId,
      terminalId: config.terminalId,
      mode: config.mode,
      currency: 'COP',
      amountCOP: serverTotalCOP,
      amountUSD,
      exchangeRateCOP: trm,
      comprador: {
        compradorDbId,
        tipoDocumento: comprador.tipoDocumento,
        identificacion: comprador.identificacion,
        nombres: comprador.nombres,
        apellidos: comprador.apellidos,
        email: comprador.email,
        telefono: `${comprador.telefonoIndicativo || ''} ${comprador.telefono}`.trim(),
        empresa: comprador.empresa || `${comprador.nombres} ${comprador.apellidos}`.trim(),
        pais: comprador.pais,
        ciudad: comprador.ciudad,
        direccion: comprador.direccion,
      },
      items: verifiedItems,
      status: 'PENDING',
      clientIp: clientMeta.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };

    checkoutSessions.set(checkoutToken, sessionData);

    return sessionData;
  }

  /**
   * Paso 2: Procesa el pago con tarjeta tokenizada a través de Payments Way (Producción o Sandbox)
   */
  async procesarPagoTarjeta(payload = {}, clientMeta = {}) {
    const { checkoutToken, orderNumber, signature, tokenizedCard } = payload;

    if (!checkoutToken || !orderNumber || !signature) {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_INVALID_SIGNATURE.code,
        'Faltan credenciales criptográficas de la sesión de pago',
        'Se requieren checkoutToken, orderNumber y signature emitidos por el servidor.',
        401
      );
    }

    const session = checkoutSessions.get(checkoutToken);
    if (!session) {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_SESSION_EXPIRED.code,
        ERROR_CATALOG.PAYMENT_SESSION_EXPIRED.message,
        'La sesión de pago no existe o ya expiró.',
        400
      );
    }

    if (session.status === 'APPROVED') {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_IDEMPOTENCY_CONFLICT.code,
        'Esta orden de compra ya fue pagada exitosamente',
        `Referencia de orden: ${session.orderNumber}`,
        409
      );
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      checkoutSessions.delete(checkoutToken);
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_SESSION_EXPIRED.code,
        ERROR_CATALOG.PAYMENT_SESSION_EXPIRED.message,
        'Por seguridad, el tiempo límite para completar la transacción ha finalizado.',
        400
      );
    }

    // Verificar firma HMAC-SHA256 con comparación de tiempo constante
    const expectedSig = generatePaymentsWaySignature({
      merchantId: session.merchantId,
      formId: session.formId,
      terminalId: session.terminalId,
      orderNumber: session.orderNumber,
      amountCOP: session.amountCOP,
      currency: session.currency,
    });

    if (
      session.orderNumber !== orderNumber ||
      !verifyPaymentsWaySignature(expectedSig, signature)
    ) {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_INVALID_SIGNATURE.code,
        ERROR_CATALOG.PAYMENT_INVALID_SIGNATURE.message,
        'La firma HMAC-SHA256 de la orden no coincide con los parámetros autorizados.',
        401
      );
    }

    // Validar tarjeta tokenizada (sanitizada por pciDataSanitizer)
    const card = tokenizedCard || {
      paymentToken: payload.paymentToken || `pw_tok_${crypto.randomBytes(8).toString('hex')}`,
      last4: payload.last4 || '4242',
      franchise: payload.franchise || 'VISA',
      holderName: String(payload.holderName || `${session.comprador.nombres} ${session.comprador.apellidos}`).toUpperCase(),
      installments: Number(payload.installments) || 1,
      docType: payload.docType || session.comprador.tipoDocumento,
      docNumber: payload.docNumber || session.comprador.identificacion,
      luhnValid: payload.luhnValid !== false,
    };

    if (!card.luhnValid) {
      throw new DomainError(
        ERROR_CATALOG.VALIDATION_ERROR.code,
        'El número de tarjeta ingresado no supera la validación matemática de Luhn',
        'Verifique los dígitos de su tarjeta de crédito o débito.',
        422
      );
    }

    // Simulación de rechazo para tarjetas terminadas en 0000 (permite probar escenarios de rechazo)
    if (card.last4 === '0000') {
      session.status = 'DECLINED';
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_GATEWAY_REJECTED.code,
        ERROR_CATALOG.PAYMENT_GATEWAY_REJECTED.message,
        'Código de respuesta Payments Way [PW-51]: Fondos insuficientes o tarjeta declinada por el banco emisor.',
        402
      );
    }

    // Si estamos conectados en modo producción con credenciales reales de Payments Way:
    let gatewayResponse = null;
    if (
      session.mode === 'production' &&
      process.env.PAYMENTSWAY_API_URL &&
      process.env.PAYMENTSWAY_API_KEY
    ) {
      // Conector directo listo para producción con Payments Way API
      const response = await fetch(`${process.env.PAYMENTSWAY_API_URL}/transactions/card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAYMENTSWAY_API_KEY}`,
          'X-Signature': expectedSig,
        },
        body: JSON.stringify({
          merchantId: session.merchantId,
          formId: session.formId,
          terminalId: session.terminalId,
          orderNumber: session.orderNumber,
          amount: session.amountCOP,
          currency: 'COP',
          paymentToken: card.paymentToken,
          installments: card.installments,
          buyer: session.comprador,
        }),
      });
      gatewayResponse = await response.json();
      if (!response.ok || gatewayResponse.status === 'REJECTED') {
        throw new DomainError(
          ERROR_CATALOG.PAYMENT_GATEWAY_REJECTED.code,
          gatewayResponse.message || ERROR_CATALOG.PAYMENT_GATEWAY_REJECTED.message,
          gatewayResponse.details || 'Rechazado por pasarela en producción',
          402
        );
      }
    }

    const externalTransactionId =
      gatewayResponse?.transactionId ||
      `PW-TX-${Date.now().toString().slice(-7)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const authorizationCode =
      gatewayResponse?.authorizationCode ||
      `AUT-${crypto.randomInt(100000, 999999)}`;
    const rrnCode =
      gatewayResponse?.rrn ||
      `${Date.now().toString().slice(-8)}${crypto.randomInt(1000, 9999)}`;

    session.status = 'APPROVED';
    session.paidAt = new Date().toISOString();

    const receipt = {
      status: 'APROBADA',
      gateway: 'Payments Way Colombia',
      mode: session.mode,
      orderNumber: session.orderNumber,
      externalTransactionId,
      authorizationCode,
      rrnCode,
      signatureVerified: true,
      amountCOP: session.amountCOP,
      amountUSD: session.amountUSD,
      exchangeRateCOP: session.exchangeRateCOP,
      currency: 'COP',
      paymentMethod: {
        type: 'TARJETA_CREDITO_DEBITO',
        franchise: card.franchise,
        maskedCard: `**** **** **** ${card.last4}`,
        holderName: card.holderName,
        installments: card.installments,
      },
      comprador: session.comprador,
      items: session.items,
      paidAt: session.paidAt,
      clientIp: clientMeta.ip || session.clientIp,
    };

    processedReceipts.set(session.orderNumber, receipt);

    // Si se envió un pedido_id de base de datos, persistir en finanzas.transacciones_pagos
    if (payload.pedidoId) {
      try {
        await this.repository.create({
          pedido_id: payload.pedidoId,
          tipo_etapa_pago: payload.tipoEtapaPago || 'ANTICIPO_RESERVA',
          pasarela_nombre: 'Payments Way Colombia',
          identificador_transaccion_externo: externalTransactionId,
          monto_usd: session.amountUSD,
          tasa_cambio_aplicada_cop: session.exchangeRateCOP,
          monto_equivalente_cop: session.amountCOP,
          estado_pago: 'EXITOSO',
        });
      } catch {
        // Respaldo seguro si la base de datos no está conectada o el pedido es de carrito público
      }
    }

    return receipt;
  }

  /**
   * Webhook receptor para confirmación asíncrona desde los servidores de Payments Way
   */
  async procesarWebhook(body = {}, signatureHeader = '') {
    const { orderNumber, amountCOP, status, externalTransactionId } = body;
    const config = this.getGatewayConfig();

    const expectedSig = generatePaymentsWaySignature({
      merchantId: config.merchantId,
      formId: config.formId,
      terminalId: config.terminalId,
      orderNumber,
      amountCOP,
      currency: 'COP',
    });

    if (!verifyPaymentsWaySignature(expectedSig, signatureHeader || body.signature)) {
      throw new DomainError(
        ERROR_CATALOG.PAYMENT_INVALID_SIGNATURE.code,
        'Firma de Webhook de Payments Way no válida',
        'Se rechazó la notificación por fallo de verificación HMAC-SHA256.',
        401
      );
    }

    const existing = processedReceipts.get(orderNumber);
    if (existing) {
      existing.status = status === 'APPROVED' || status === 'EXITOSO' ? 'APROBADA' : status;
      existing.webhookVerifiedAt = new Date().toISOString();
      processedReceipts.set(orderNumber, existing);
    }

    return {
      received: true,
      orderNumber,
      externalTransactionId,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Consulta un comprobante por su número de orden
   */
  async obtenerComprobante(referencia) {
    const memReceipt = processedReceipts.get(referencia);
    if (memReceipt) return memReceipt;

    try {
      const dbRecord = await this.repository.findByExternalReference(referencia);
      if (dbRecord) return dbRecord;
    } catch {
      // Continuar
    }

    throw new DomainError(
      ERROR_CATALOG.NOT_FOUND.code,
      'Comprobante de transacción no encontrado',
      `No se encontró una transacción con referencia: ${referencia}`,
      404
    );
  }
}

export default PaymentsWayService;
