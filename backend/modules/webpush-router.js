import { Router } from 'express';
import webpush from 'web-push';
import { sequelize } from '../config/database.js';
import checkAuth from '../middleware/checkAuth.js';
import { DomainError } from '../utils/DomainError.js';
import { ERROR_CATALOG } from '../utils/errorCatalog.js';

const router = Router();
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const email = process.env.VAPID_EMAIL;
const configured = Boolean(publicKey && privateKey && email);
if (configured) webpush.setVapidDetails(email, publicKey, privateKey);

const respond = (res, data) => res.json({ status: 'success', data, meta: null, error: null });
const handle = (operation) => async (req, res, next) => {
  try { await operation(req, res); } catch (error) { next(error); }
};
const requireConfigured = (_req, _res, next) => configured
  ? next()
  : next(new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code, 'Web Push no está configurado en el servidor', null, 503));
const validSubscription = (subscription) => {
  try {
    const url = new URL(subscription?.endpoint);
    return url.protocol === 'https:' && subscription.keys?.p256dh && subscription.keys?.auth &&
      subscription.endpoint.length <= 2048 && subscription.keys.p256dh.length <= 512 && subscription.keys.auth.length <= 512;
  } catch { return false; }
};

router.use(checkAuth, requireConfigured);
router.get('/public-key', handle(async (_req, res) => respond(res, { publicKey })));
router.post('/subscription', handle(async (req, res) => {
  const subscription = req.body?.subscription;
  if (!validSubscription(subscription)) {
    throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code, 'Suscripción Web Push inválida', null, 422);
  }
  await sequelize.query(`INSERT INTO acceso.suscripciones_web_push (endpoint, usuario_id, p256dh, auth)
    VALUES (:endpoint, :userId, :p256dh, :auth)
    ON CONFLICT (endpoint) DO UPDATE SET usuario_id = EXCLUDED.usuario_id,
      p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`, {
    replacements: { endpoint: subscription.endpoint, userId: req.user.id,
      p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
  });
  respond(res, { subscribed: true });
}));
router.delete('/subscription', handle(async (req, res) => {
  const endpoint = req.body?.endpoint;
  if (typeof endpoint !== 'string' || !endpoint) {
    throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code, 'Endpoint requerido', null, 422);
  }
  await sequelize.query('DELETE FROM acceso.suscripciones_web_push WHERE usuario_id = :userId AND endpoint = :endpoint', {
    replacements: { userId: req.user.id, endpoint },
  });
  respond(res, { subscribed: false });
}));
router.post('/test', handle(async (req, res) => {
  const [subscriptions] = await sequelize.query(
    'SELECT endpoint, p256dh, auth FROM acceso.suscripciones_web_push WHERE usuario_id = :userId',
    { replacements: { userId: req.user.id } }
  );
  let sent = 0;
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: {
        p256dh: subscription.p256dh, auth: subscription.auth,
      } }, JSON.stringify({ title: 'ConexCoffee', body: 'Las notificaciones están activas.', url: '/' }));
      sent++;
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) {
        await sequelize.query('DELETE FROM acceso.suscripciones_web_push WHERE endpoint = :endpoint', {
          replacements: { endpoint: subscription.endpoint },
        });
      } else throw error;
    }
  }
  respond(res, { sent });
}));
export default router;
