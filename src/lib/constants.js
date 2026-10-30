// ============================================
// Constantes Globales — ConexCoffee
// ============================================

/**
 * Roles disponibles en la plataforma.
 * Usados para guards de rutas, sidebar y permisos.
 */
export const ROLES = {
  SUPERADMIN: 'superadmin',
  EMPRESA: 'empresa',
  BROKER: 'broker',
  CAFICULTOR: 'caficultor',
  COMPRADOR: 'comprador',
  LABORATORIO: 'laboratorio',
  TECNICO: 'tecnico',
  CATADOR: 'catador',
};

/**
 * Rutas base del dashboard según el rol del usuario.
 * Se usa para redirigir al usuario después del login.
 */
export const ROLE_DASHBOARD_ROUTES = {
  [ROLES.SUPERADMIN]: '/superadmin/dashboard',
  [ROLES.EMPRESA]: '/empresa/dashboard',
  [ROLES.BROKER]: '/broker/dashboard',
  [ROLES.CAFICULTOR]: '/caficultor/dashboard',
  [ROLES.COMPRADOR]: '/comprador/dashboard',
  [ROLES.LABORATORIO]: '/laboratorio/dashboard',
  [ROLES.TECNICO]: '/tecnico/dashboard',
  [ROLES.CATADOR]: '/catador/dashboard',
};

export { APP_NAME, PAYMENT_PUBLIC_KEY } from './env';

/**
 * Tiempo de inactividad antes de cerrar sesión (en milisegundos).
 * 30 minutos por defecto.
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Configuración de paginación por defecto.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};

/**
 * Diccionario de colores y estilos globales oficiales
 */
export { BRAND_COLORS, PALETTE, COLOR_STYLES } from './colors';

/**
 * Catálogos geográficos y agronómicos para formularios de fincas, lotes y pre-ofertas.
 */
export const COLOMBIA_GEOGRAFIA = {
  Huila: {
    municipios: ['Pitalito', 'San Agustín', 'Acevedo', 'Garzón', 'Gigante', 'La Plata', 'Timaná'],
    veredas: ['El Mirador', 'La Cabaña', 'San Antonio', 'La Palma', 'El Triunfo', 'Bajo Naranjal'],
  },
  Cauca: {
    municipios: ['Popayán', 'Piendamó', 'Santander de Quilichao', 'Timbío', 'Caldono', 'Morales', 'Inzá'],
    veredas: ['La Rejoya', 'San Rafael', 'El Rodeo', 'La Meseta', 'Poblazón', 'Rioblanco'],
  },
  Nariño: {
    municipios: ['Pasto', 'La Unión', 'Sandoná', 'Buesaco', 'Consacá', 'Chachagüí', 'La Florida'],
    veredas: ['La Victoria', 'El Placer', 'San Francisco', 'El Vergel', 'Altamira'],
  },
  Tolima: {
    municipios: ['Planadas', 'Chaparral', 'Ibagué', 'Líbano', 'Fresno', 'Ataco', 'Roncesvalles'],
    veredas: ['Bilbao', 'Gaitania', 'La Marina', 'El Diamante', 'Santa Rosa'],
  },
  Antioquia: {
    municipios: ['Jericó', 'Andes', 'Fredonia', 'Ciudad Bolívar', 'Santa Bárbara', 'Urrao'],
    veredas: ['La Soledad', 'San Bartolo', 'Quebrada Arriba', 'La Cascada'],
  },
  Caldas: {
    municipios: ['Chinchiná', 'Manizales', 'Palestina', 'Villamaría', 'Anserma'],
    veredas: ['El Trébol', 'Bajo Español', 'Guayabal', 'La Floresta'],
  },
  Quindío: {
    municipios: ['Calarcá', 'Armenia', 'Circasia', 'Montenegro', 'Salento', 'Pijao'],
    veredas: ['La Virginia', 'Boquía', 'La Bella', 'San Rafael'],
  },
  Risaralda: {
    municipios: ['Santa Rosa de Cabal', 'Belén de Umbría', 'Pereira', 'Marsella', 'Santuario'],
    veredas: ['El Guayabo', 'La Linda', 'La Cristalina', 'San Andrés'],
  },
  Santander: {
    municipios: ['San Gil', 'Socorro', 'Curití', 'Páramo', 'Piedecuesta'],
    veredas: ['El Carmen', 'San José', 'La Laja', 'El Palmar'],
  },
};

export const VARIEDADES_POR_ESPECIE = {
  Arábica: [
    'Castillo',
    'Caturra',
    'Colombia',
    'Borbón Rosado',
    'Geisha',
    'Típica (Typica)',
    'Tabi',
    'Maragogipe',
    'Pacamara',
    'Cenicafé 1',
    'San Bernardo',
    'Bourbon Rojo',
    'Bourbon Amarillo',
  ],
  Robusta: [
    'Conilón',
    'Robusta Tropical',
    'Kouillou',
    'Robusta Selección Colombia',
  ],
};

export const TIPOS_SECADO = [
  'Mecánico dinámico',
  'Mecánico estático',
  'Mecánico por deshumidificación',
  'Solar',
];

export const PROCESOS_COSECHA = [
  'Honey amarillo',
  'Honey con fermentación',
  'Honey negro',
  'Honey rojo',
  'Lavado con fermentación',
  'Lavado tradicional',
  'Lavado Wet Hulled',
  'Natural con fermentación',
  'Natural',
];

