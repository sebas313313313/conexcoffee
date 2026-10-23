import api from '@/lib/axios';

// ============================================
// Auth API — Endpoints de autenticación
// ============================================
// Todas las llamadas de autenticación pasan por la instancia
// global de Axios (con withCredentials para cookies HttpOnly).
// ============================================

// Credenciales de prueba locales para demostración
const DEMO_USERS = {
  'superadmin@conexcoffee.com': { id: 'usr-1', name: 'SuperAdmin Conex', email: 'superadmin@conexcoffee.com', role: 'superadmin' },
  'empresa@conexcoffee.com': { id: 'usr-2', name: 'Café & Export S.A.S.', email: 'empresa@conexcoffee.com', role: 'empresa' },
  'broker@conexcoffee.com': { id: 'usr-3', name: 'Carlos Broker', email: 'broker@conexcoffee.com', role: 'broker' },
  'caficultor@conexcoffee.com': { id: 'usr-4', name: 'Finca La Esperanza', email: 'caficultor@conexcoffee.com', role: 'caficultor' },
  'productor@conexcoffee.com': { id: 'usr-4', name: 'Finca La Esperanza', email: 'productor@conexcoffee.com', role: 'caficultor' },
  'laboratorio@conexcoffee.com': { id: 'usr-6', name: 'Lab Certificación Calidad', email: 'laboratorio@conexcoffee.com', role: 'laboratorio' },
  'tecnico@conexcoffee.com': { id: 'usr-7', name: 'Ing. Asistente Técnico', email: 'tecnico@conexcoffee.com', role: 'tecnico' },
  'catador@conexcoffee.com': { id: 'usr-8', name: 'Q-Grader Certificado', email: 'catador@conexcoffee.com', role: 'catador' },
  'comprador@conexcoffee.com': { id: 'usr-5', name: 'Coffee Roasters Int.', email: 'comprador@conexcoffee.com', role: 'comprador' },
};

/**
 * Iniciar sesión con email y contraseña.
 * Conecta con el endpoint /api/usuarios-sistema/login del backend ConexCoffee.
 * Incluye fallback a /auth/login y a credenciales demo si el backend no está disponible.
 */
export async function login(credentials) {
  const email = credentials.email || credentials.correo_electronico || '';
  const password = credentials.password || credentials.contrasena || '';

  // Verificación directa de cuentas demo para pruebas locales sin backend
  if (DEMO_USERS[email] && password === '12345678') {
    return {
      user: DEMO_USERS[email],
      token: `demo-token-${Date.now()}`,
      message: 'Sesión demo iniciada exitosamente',
    };
  }

  const payload = {
    correo_electronico: email,
    contrasena: password,
    email,
    password,
  };

  try {
    // Intentar endpoint oficial del backend ConexCoffee
    const response = await api.post('/usuarios-sistema/login', payload);
    const result = response.data;

    // Normalizar formato estándar REST CC-XXXX: { status: 'success', data: { token, usuario } }
    if (result && result.data && result.data.usuario) {
      return {
        user: result.data.usuario,
        token: result.data.token || null,
        message: 'Sesión iniciada correctamente',
      };
    }

    if (result && result.usuario) {
      return {
        user: result.usuario,
        token: result.token || null,
        message: 'Sesión iniciada correctamente',
      };
    }

    return result;
  } catch (error) {
    // Si la ruta específica da 404, probar endpoint alternativo /auth/login
    if (error.response?.status === 404) {
      const altResponse = await api.post('/auth/login', payload);
      return altResponse.data;
    }

    // Si es error de conexión de red y coincide con demo user, permitir acceso demo
    const isNetworkError =
      !error.response || error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED';
    if (isNetworkError && DEMO_USERS[email]) {
      return {
        user: DEMO_USERS[email],
        token: `demo-token-${Date.now()}`,
        message: 'Sesión demo iniciada (modo sin conexión)',
      };
    }

    throw error;
  }
}

/**
 * Registrar un nuevo usuario en el sistema.
 *
 * @param {object} userData - Datos del usuario a registrar
 */
export async function register(userData) {
  const email = userData.email || userData.correo_electronico;
  const password = userData.password || userData.contrasena;

  const payload = {
    correo_electronico: email,
    contrasena: password,
    rol_principal: (userData.role || userData.rol_principal || 'COMPRADOR').toUpperCase(),
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    telefono: userData.telefono,
    ...userData,
  };

  try {
    const { data } = await api.post('/usuarios-sistema', payload);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const { data } = await api.post('/auth/register', userData);
      return data;
    }

    const isNetworkError =
      !error.response || error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED';

    if (isNetworkError) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        message: 'Usuario registrado correctamente (modo demo)',
        user: {
          id: `demo-${Date.now()}`,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          email: userData.email,
          role: userData.role || 'comprador',
        },
      };
    }

    throw error;
  }
}

/**
 * Cerrar sesión.
 * Invalida sesión en el backend si está disponible.
 */
export async function logout() {
  try {
    const { data } = await api.post('/usuarios-sistema/logout');
    return data;
  } catch {
    try {
      const { data } = await api.post('/auth/logout');
      return data;
    } catch {
      return { success: true };
    }
  }
}

/**
 * Obtener el perfil del usuario autenticado actual.
 * Conecta con /api/usuarios-sistema/perfil o /auth/me.
 */
export async function getMe() {
  try {
    const response = await api.get('/usuarios-sistema/perfil');
    const result = response.data;
    if (result && result.data) {
      return { user: result.data };
    }
    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      const { data } = await api.get('/auth/me');
      return data;
    }
    throw error;
  }
}
