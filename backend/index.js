import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { connectDB } from './config/database.js';
import './modules/index.js'; // Cargar modelos y asociaciones

// Middlewares perimetrales y de seguridad
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/logger.js';
import sqlShield from './middleware/sqlShield.js';
import ddosShield from './middleware/ddosShield.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { ERROR_CATALOG } from './utils/errorCatalog.js';

// Routers de Módulos ConexCoffee
import CatalogoErrorRouter from './modules/catalogo_errores/router/CatalogoErrorRouter.js';
import UsuarioSistemaRouter from './modules/usuarios_sistema/router/UsuarioSistemaRouter.js';
import WebPushRouter from './modules/webpush-router.js';
import CaficultorRouter from './modules/caficultores/router/CaficultorRouter.js';
import CatadorRouter from './modules/catadores/router/CatadorRouter.js';
import { EmpresaExportadoraRouter } from './modules/empresas_exportadoras/EmpresaExportadora.js';
import { AsistenteTecnicoRouter } from './modules/asistentes_tecnicos/AsistenteTecnico.js';
import { LaboratorioRouter } from './modules/laboratorios/Laboratorio.js';
import { BrokerRouter } from './modules/brokers/Broker.js';
import { CompradorInternacionalRouter } from './modules/compradores_internacionales/CompradorInternacional.js';
import FincaRouter from './modules/fincas/router/FincaRouter.js';
import VariedadCafeRouter from './modules/variedades_cafe/router/VariedadCafeRouter.js';
import LoteCultivoRouter from './modules/lotes_cultivo/router/LoteCultivoRouter.js';
import PreofertaRouter from './modules/preofertas/router/PreofertaRouter.js';
import InspeccionFincaRouter from './modules/inspecciones_finca/router/InspeccionFincaRouter.js';
import EvaluacionFisicaRouter from './modules/evaluaciones_fisicas/router/EvaluacionFisicaRouter.js';
import SesionCatacionRouter from './modules/sesiones_catacion/router/SesionCatacionRouter.js';
import HojaCatacionCvaRouter from './modules/hojas_catacion_cva/router/HojaCatacionCvaRouter.js';
import EvaluacionSensorialCvaRouter from './modules/evaluaciones_sensoriales_cva/router/EvaluacionSensorialCvaRouter.js';
import InventarioPrecintoQrRouter from './modules/inventario_precintos_qr/router/InventarioPrecintoQrRouter.js';
import SacoCafeRouter from './modules/sacos_cafe/router/SacoCafeRouter.js';
import TrazabilidadEscaneoRouter from './modules/trazabilidad_escaneos/router/TrazabilidadEscaneoRouter.js';
import ContenedorVirtualRouter from './modules/contenedores_virtuales/router/ContenedorVirtualRouter.js';
import PedidoInternacionalRouter from './modules/pedidos_internacionales/router/PedidoInternacionalRouter.js';
import PagosPasarelaRouter from './modules/pagos_pasarela/router/PagosPasarelaRouter.js';
import AlertaSeguridadRouter from './modules/alertas_seguridad/router/AlertaSeguridadRouter.js';
import QrRouter from './modules/qr/router/QrRouter.js';

import PublicacionBlogRouter from './modules/publicaciones_blog/PublicacionBlog.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy para leer la IP real del cliente detrás de Nginx / Docker
app.set('trust proxy', 1);

// Función para normalizar orígenes (elimina rutas como /login o slashes finales)
const normalizeOrigin = (rawOrigin) => {
  if (!rawOrigin) return '';
  try {
    const parsed = new URL(rawOrigin);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return rawOrigin.replace(/\/+$/, '');
  }
};

// Configuración CORS restrictiva con soporte integral para desarrollo local
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5174',
  'http://localhost:4173',
  ...(process.env.EXTRA_ALLOWED_ORIGINS ? process.env.EXTRA_ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
].filter(Boolean).map(normalizeOrigin);

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origin (Postman, curl, apps móviles, scripts)
    if (!origin) return callback(null, true);

    const cleanOrigin = normalizeOrigin(origin);
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);
    const isAllowed = allowedOrigins.includes(cleanOrigin) ||
                      allowedOrigins.includes(origin) ||
                      process.env.NODE_ENV === 'development' ||
                      isLocalhost;

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS BLOQUEADO] Origen no permitido: "${origin}". Permitidos:`, allowedOrigins);
      callback(new Error(`Bloqueado por CORS: El origen ${origin} no está autorizado.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma', 'X-Idempotency-Key', 'X-PaymentsWay-Signature', 'X-Signature'],
  optionsSuccessStatus: 200
};

// ==========================================
// Middlewares Globales
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(generalLimiter);
app.use(ddosShield);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sqlShield);
app.use(requestLogger);

// Ruta de diagnóstico del sistema (Health Check)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      servicio: 'ConexCoffee Backend API',
      estado: 'ACTIVO',
      timestamp: new Date().toISOString()
    },
    meta: null,
    error: null
  });
});

// ==========================================
// Rutas de Módulos ConexCoffee
// ==========================================
app.use('/api/publicaciones-blog', PublicacionBlogRouter);
app.use('/api/catalogo-errores', CatalogoErrorRouter);
app.use('/api/usuarios-sistema', UsuarioSistemaRouter);
app.use('/api/web-push', WebPushRouter);
app.use('/api/auth', UsuarioSistemaRouter);
app.use('/api/caficultores', CaficultorRouter);
app.use('/api/catadores', CatadorRouter);
app.use('/api/empresas-exportadoras', EmpresaExportadoraRouter);
app.use('/api/asistentes-tecnicos', AsistenteTecnicoRouter);
app.use('/api/laboratorios', LaboratorioRouter);
app.use('/api/brokers', BrokerRouter);
app.use('/api/compradores-internacionales', CompradorInternacionalRouter);
app.use('/api/fincas', FincaRouter);
app.use('/api/variedades-cafe', VariedadCafeRouter);
app.use('/api/lotes-cultivo', LoteCultivoRouter);
app.use('/api/preofertas', PreofertaRouter);
app.use('/api/inspecciones-finca', InspeccionFincaRouter);
app.use('/api/inspecciones-campo', InspeccionFincaRouter);
app.use('/api/evaluaciones-fisicas', EvaluacionFisicaRouter);
app.use('/api/sesiones-catacion', SesionCatacionRouter);
app.use('/api/hojas-catacion-cva', HojaCatacionCvaRouter);
app.use('/api/hojas-catacion', HojaCatacionCvaRouter);
app.use('/api/evaluaciones-sensoriales-cva', EvaluacionSensorialCvaRouter);
app.use('/api/inventario-precintos-qr', InventarioPrecintoQrRouter);
app.use('/api/sacos-cafe', SacoCafeRouter);
app.use('/api/trazabilidad-escaneos', TrazabilidadEscaneoRouter);
app.use('/api/contenedores-virtuales', ContenedorVirtualRouter);
app.use('/api/contenedores', ContenedorVirtualRouter);
app.use('/api/pedidos-internacionales', PedidoInternacionalRouter);
app.use('/api/pedidos', PedidoInternacionalRouter);
app.use('/api/pagos', PagosPasarelaRouter);
app.use('/api/payments-way', PagosPasarelaRouter);
app.use('/api/alertas-seguridad', AlertaSeguridadRouter);
app.use('/api/qr', QrRouter);

// Manejo de Rutas No Encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    data: null,
    meta: null,
    error: {
      code: ERROR_CATALOG.NOT_FOUND.code,
      message: 'Endpoint no encontrado en el servidor',
      details: `La ruta [${req.method}] ${req.originalUrl} no existe en la API ConexCoffee.`
    }
  });
});

// Middleware Global de Errores Uniforme (CC-XXXX)
app.use(errorHandler);

// Inicialización del Servidor cuando se ejecuta directamente
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`☕ ConexCoffee Backend API ejecutándose en puerto ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Formato REST: Uniforme con Catálogo CC-XXXX`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

import url from 'url';
if (process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  startServer();
}

export default app;
