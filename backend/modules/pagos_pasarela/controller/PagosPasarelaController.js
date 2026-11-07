import BaseController from '../../baseController.js';
import PaymentsWayService from '../services/PaymentsWayService.js';

class PagosPasarelaController extends BaseController {
  constructor(service = new PaymentsWayService()) {
    super(service);
  }

  getConfig = (_req, res) =>
    this.execute(res, async () => {
      return this.service.getGatewayConfig();
    });

  crearCheckoutSession = (req, res) =>
    this.execute(
      res,
      async () => {
        const clientMeta = {
          ip:
            req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.ip ||
            '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ConexCoffee Client',
        };
        return await this.service.crearIntencionPago(req.body, clientMeta);
      },
      201
    );

  procesarTarjeta = (req, res) =>
    this.execute(res, async () => {
      const clientMeta = {
        ip:
          req.headers['cf-connecting-ip'] ||
          req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
          req.ip ||
          '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'ConexCoffee Client',
      };
      return await this.service.procesarPagoTarjeta(req.body, clientMeta);
    });

  webhookPaymentsWay = (req, res) =>
    this.execute(res, async () => {
      const signature =
        req.headers['x-paymentsway-signature'] ||
        req.headers['x-signature'] ||
        req.body?.signature ||
        '';
      return await this.service.procesarWebhook(req.body, signature);
    });

  obtenerComprobante = (req, res) =>
    this.execute(res, async () => {
      return await this.service.obtenerComprobante(req.params.referencia);
    });
}

export default PagosPasarelaController;

