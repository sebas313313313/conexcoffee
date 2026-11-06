self.addEventListener('push', (event) => {
  let message = {};
  try { message = event.data?.json() || {}; } catch { message = { body: event.data?.text() || '' }; }
  const title = typeof message.title === 'string' ? message.title : 'ConexCoffee';
  const body = typeof message.body === 'string' ? message.body : '';
  const url = typeof message.url === 'string' && message.url.startsWith('/') && !message.url.startsWith('//') ? message.url : '/';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/images/logo-sm_conex.png',
    data: { url },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
    const existing = clients.find((client) => client.url === target);
    if (existing) return existing.focus();
    return self.clients.openWindow(target);
  }));
});
