/**
 * Suscripción persistente del navegador, activada por una acción del usuario.
 * Se elimina explícitamente al desactivar notificaciones o cerrar sesión;
 * desmontar un componente no debe cancelar las notificaciones del navegador.
 */
export function createPushActions(api) {
  const getPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration?.pushManager.getSubscription() || null;
  };

  const enablePush = async () => {
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      throw new Error('Este navegador requiere HTTPS o localhost para activar notificaciones.');
    }
    const { data } = await api.get('/web-push/public-key', { strictResponse: true });
    const key = data?.publicKey;
    if (!key) throw new Error('La clave pública de notificaciones no está disponible.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('El navegador no concedió permiso para notificaciones.');
    const registration = await navigator.serviceWorker.register('/push-sw.js');
    const padding = '='.repeat((4 - key.length % 4) % 4);
    const binary = atob((key + padding).replace(/-/g, '+').replace(/_/g, '/'));
    const applicationServerKey = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    try {
      await api.post('/web-push/subscription', { subscription: subscription.toJSON() }, { strictResponse: true });
    } catch (error) {
      if (!existing) await subscription.unsubscribe();
      throw error;
    }
    return subscription;
  };

  const disablePush = async () => {
    const subscription = await getPushSubscription();
    if (!subscription) return;
    await api.delete('/web-push/subscription', {
      data: { endpoint: subscription.endpoint }, strictResponse: true,
    });
    await subscription.unsubscribe();
  };

  return { getPushSubscription, enablePush, disablePush };
}
