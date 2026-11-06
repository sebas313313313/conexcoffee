import test from 'node:test';
import assert from 'node:assert/strict';
import { createPushActions } from '../src/context/auth/push.js';

function browser(t, { existing = false, fail = false } = {}) {
  const calls = [];
  const subscription = {
    endpoint: 'https://push.example.test/subscription',
    toJSON: () => ({ endpoint: 'https://push.example.test/subscription' }),
    unsubscribe: async () => { calls.push('unsubscribe'); },
  };
  const registration = { pushManager: {
    getSubscription: async () => existing ? subscription : null,
    subscribe: async () => { calls.push('subscribe'); return subscription; },
  } };
  const notification = { requestPermission: async () => 'granted' };
  const globals = {
    window: { isSecureContext: true, PushManager: {}, Notification: notification },
    navigator: { serviceWorker: {
      register: async () => registration,
      getRegistration: async () => registration,
    } },
    Notification: notification,
  };
  for (const [key, value] of Object.entries(globals)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const api = {
    get: async () => ({ data: { publicKey: 'dGVzdA' } }),
    post: async () => { calls.push('post'); if (fail) throw new Error('Sin conexión'); },
    delete: async () => { calls.push('delete'); },
  };
  return { actions: createPushActions(api), calls, subscription };
}

test('activar push conserva la suscripción persistente tras registrarla en el servidor', async (t) => {
  const { actions, calls, subscription } = browser(t);
  assert.equal(await actions.enablePush(), subscription);
  assert.deepEqual(calls, ['subscribe', 'post']);
});

test('si el registro falla sólo deshace la suscripción recién creada', async (t) => {
  const { actions, calls } = browser(t, { fail: true });
  await assert.rejects(actions.enablePush(), /Sin conexión/);
  assert.deepEqual(calls, ['subscribe', 'post', 'unsubscribe']);
});

test('un fallo de registro no elimina una suscripción preexistente', async (t) => {
  const { actions, calls } = browser(t, { existing: true, fail: true });
  await assert.rejects(actions.enablePush(), /Sin conexión/);
  assert.deepEqual(calls, ['post']);
});

test('desactivar push elimina el registro del servidor y la suscripción del navegador', async (t) => {
  const { actions, calls } = browser(t, { existing: true });
  await actions.disablePush();
  assert.deepEqual(calls, ['delete', 'unsubscribe']);
});
