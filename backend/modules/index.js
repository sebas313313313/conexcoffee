import CatalogoError from './catalogo_errores/CatalogoError.js';
import UsuarioSistema from './usuarios_sistema/UsuarioSistema.js';
import Caficultor from './caficultores/Caficultor.js';
import Catador from './catadores/Catador.js';
import EmpresaExportadora from './empresas_exportadoras/EmpresaExportadora.js';
import AsistenteTecnico from './asistentes_tecnicos/AsistenteTecnico.js';
import Laboratorio from './laboratorios/Laboratorio.js';
import Broker from './brokers/Broker.js';
import CompradorInternacional from './compradores_internacionales/CompradorInternacional.js';
import Finca from './fincas/Finca.js';
import VariedadCafe from './variedades_cafe/VariedadCafe.js';
import LoteCultivo from './lotes_cultivo/LoteCultivo.js';
import Preoferta from './preofertas/Preoferta.js';
import InspeccionFinca from './inspecciones_finca/InspeccionFinca.js';
import EvaluacionFisica from './evaluaciones_fisicas/EvaluacionFisica.js';
import SesionCatacion from './sesiones_catacion/SesionCatacion.js';
import HojaCatacionCva from './hojas_catacion_cva/HojaCatacionCva.js';
import CvaFase1Descriptiva from './hojas_catacion_cva/models/CvaFase1Descriptiva.js';
import CvaFase2Afectiva from './hojas_catacion_cva/models/CvaFase2Afectiva.js';
import CvaFase3SaborDescriptiva from './hojas_catacion_cva/models/CvaFase3SaborDescriptiva.js';
import CvaFase4SaborAfectiva from './hojas_catacion_cva/models/CvaFase4SaborAfectiva.js';
import CvaFase5Acidez from './hojas_catacion_cva/models/CvaFase5Acidez.js';
import CvaFase6Dulzor from './hojas_catacion_cva/models/CvaFase6Dulzor.js';
import CvaFase7SensacionBoca from './hojas_catacion_cva/models/CvaFase7SensacionBoca.js';
import CvaFase8ImpresionGlobal from './hojas_catacion_cva/models/CvaFase8ImpresionGlobal.js';
import CvaDefectosUniformidad from './hojas_catacion_cva/models/CvaDefectosUniformidad.js';
import InventarioPrecintoQr from './inventario_precintos_qr/InventarioPrecintoQr.js';
import SacoCafe from './sacos_cafe/SacoCafe.js';
import TrazabilidadEscaneo from './trazabilidad_escaneos/TrazabilidadEscaneo.js';
import ContenedorVirtual from './contenedores_virtuales/ContenedorVirtual.js';
import PedidoInternacional from './pedidos_internacionales/PedidoInternacional.js';
import TransaccionPago from './pagos_pasarela/TransaccionPago.js';
import AlertaSeguridad from './alertas_seguridad/AlertaSeguridad.js';

export const models = {
  CatalogoError,
  UsuarioSistema,
  Caficultor,
  Catador,
  Finca,
  VariedadCafe,
  LoteCultivo,
  Preoferta,
  InspeccionFinca,
  EvaluacionFisica,
  SesionCatacion,
  HojaCatacionCva,
  CvaFase1Descriptiva,
  CvaFase2Afectiva,
  CvaFase3SaborDescriptiva,
  CvaFase4SaborAfectiva,
  CvaFase5Acidez,
  CvaFase6Dulzor,
  CvaFase7SensacionBoca,
  CvaFase8ImpresionGlobal,
  CvaDefectosUniformidad,
  InventarioPrecintoQr,
  SacoCafe,
  TrazabilidadEscaneo,
  ContenedorVirtual,
  PedidoInternacional,
  TransaccionPago,
  AlertaSeguridad
};

// ==========================================
// Asociaciones del Modelo ConexCoffee
// ==========================================

// Usuario <-> Caficultor
UsuarioSistema.hasOne(Caficultor, { foreignKey: 'usuario_id', as: 'caficultor' });
Caficultor.belongsTo(UsuarioSistema, { foreignKey: 'usuario_id', as: 'usuario' });

// Usuario <-> Catador
UsuarioSistema.hasOne(Catador, { foreignKey: 'usuario_id', as: 'catador' });
Catador.belongsTo(UsuarioSistema, { foreignKey: 'usuario_id', as: 'usuario' });

// Caficultor <-> Fincas
Caficultor.hasMany(Finca, { foreignKey: 'caficultor_id', as: 'fincas' });
Finca.belongsTo(Caficultor, { foreignKey: 'caficultor_id', as: 'caficultor' });

// Finca <-> Lotes de Cultivo
Finca.hasMany(LoteCultivo, { foreignKey: 'finca_id', as: 'lotes' });
LoteCultivo.belongsTo(Finca, { foreignKey: 'finca_id', as: 'finca' });

// Variedad <-> Lotes de Cultivo
VariedadCafe.hasMany(LoteCultivo, { foreignKey: 'variedad_id', as: 'lotes' });
LoteCultivo.belongsTo(VariedadCafe, { foreignKey: 'variedad_id', as: 'variedad' });

// Preofertas relaciones
Caficultor.hasMany(Preoferta, { foreignKey: 'caficultor_id', as: 'preofertas' });
Preoferta.belongsTo(Caficultor, { foreignKey: 'caficultor_id', as: 'caficultor' });

Finca.hasMany(Preoferta, { foreignKey: 'finca_id', as: 'preofertas' });
Preoferta.belongsTo(Finca, { foreignKey: 'finca_id', as: 'finca' });

Preoferta.hasMany(InspeccionFinca, { foreignKey: 'preoferta_id', as: 'inspecciones' });
InspeccionFinca.belongsTo(Preoferta, { foreignKey: 'preoferta_id', as: 'preoferta' });

Preoferta.hasMany(EvaluacionFisica, { foreignKey: 'preoferta_id', as: 'evaluaciones_fisicas' });
EvaluacionFisica.belongsTo(Preoferta, { foreignKey: 'preoferta_id', as: 'preoferta' });

// Evaluación Física <-> Sesión de Catación
EvaluacionFisica.hasOne(SesionCatacion, { foreignKey: 'evaluacion_fisica_id', as: 'sesion_catacion' });
SesionCatacion.belongsTo(EvaluacionFisica, { foreignKey: 'evaluacion_fisica_id', as: 'evaluacion_fisica' });

// Sesión de Catación <-> Hojas de Catación CVA (1:N)
SesionCatacion.hasMany(HojaCatacionCva, { foreignKey: 'sesion_id', as: 'hojas' });
HojaCatacionCva.belongsTo(SesionCatacion, { foreignKey: 'sesion_id', as: 'sesion' });

// Catador <-> Hojas de Catación CVA (1:N)
Catador.hasMany(HojaCatacionCva, { foreignKey: 'catador_id', as: 'hojas_catacion' });
HojaCatacionCva.belongsTo(Catador, { foreignKey: 'catador_id', as: 'catador' });

// Hoja de Catación <-> 8 Fases CVA y Defectos Normalizados
HojaCatacionCva.hasOne(CvaFase1Descriptiva, { foreignKey: 'hoja_catacion_id', as: 'fase_1_descriptiva' });
CvaFase1Descriptiva.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase2Afectiva, { foreignKey: 'hoja_catacion_id', as: 'fase_2_afectiva' });
CvaFase2Afectiva.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase3SaborDescriptiva, { foreignKey: 'hoja_catacion_id', as: 'fase_3_sabor_descriptiva' });
CvaFase3SaborDescriptiva.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase4SaborAfectiva, { foreignKey: 'hoja_catacion_id', as: 'fase_4_sabor_afectiva' });
CvaFase4SaborAfectiva.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase5Acidez, { foreignKey: 'hoja_catacion_id', as: 'fase_5_acidez' });
CvaFase5Acidez.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase6Dulzor, { foreignKey: 'hoja_catacion_id', as: 'fase_6_dulzor' });
CvaFase6Dulzor.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase7SensacionBoca, { foreignKey: 'hoja_catacion_id', as: 'fase_7_sensacion_boca' });
CvaFase7SensacionBoca.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaFase8ImpresionGlobal, { foreignKey: 'hoja_catacion_id', as: 'fase_8_impresion_global' });
CvaFase8ImpresionGlobal.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

HojaCatacionCva.hasOne(CvaDefectosUniformidad, { foreignKey: 'hoja_catacion_id', as: 'defectos_uniformidad' });
CvaDefectosUniformidad.belongsTo(HojaCatacionCva, { foreignKey: 'hoja_catacion_id', as: 'hoja' });

// Logística
Preoferta.hasMany(SacoCafe, { foreignKey: 'preoferta_id', as: 'sacos' });
SacoCafe.belongsTo(Preoferta, { foreignKey: 'preoferta_id', as: 'preoferta' });

// Precinto <-> Saco
InventarioPrecintoQr.hasOne(SacoCafe, { foreignKey: 'precinto_id', as: 'saco' });
SacoCafe.belongsTo(InventarioPrecintoQr, { foreignKey: 'precinto_id', as: 'precinto' });

// Contenedor <-> Sacos
ContenedorVirtual.hasMany(SacoCafe, { foreignKey: 'contenedor_id', as: 'sacos' });
SacoCafe.belongsTo(ContenedorVirtual, { foreignKey: 'contenedor_id', as: 'contenedor' });

// Saco <-> Escaneos de trazabilidad
SacoCafe.hasMany(TrazabilidadEscaneo, { foreignKey: 'saco_id', as: 'escaneos' });
TrazabilidadEscaneo.belongsTo(SacoCafe, { foreignKey: 'saco_id', as: 'saco' });

// Contenedor <-> Pedidos
ContenedorVirtual.hasMany(PedidoInternacional, { foreignKey: 'contenedor_id', as: 'pedidos' });
PedidoInternacional.belongsTo(ContenedorVirtual, { foreignKey: 'contenedor_id', as: 'contenedor' });

// Preoferta <-> Pedidos
Preoferta.hasMany(PedidoInternacional, { foreignKey: 'preoferta_id', as: 'pedidos' });
PedidoInternacional.belongsTo(Preoferta, { foreignKey: 'preoferta_id', as: 'preoferta' });

// Pedido <-> Transacciones de Pago (Pasarela Payments Way)
PedidoInternacional.hasMany(TransaccionPago, { foreignKey: 'pedido_id', as: 'transacciones_pago' });
TransaccionPago.belongsTo(PedidoInternacional, { foreignKey: 'pedido_id', as: 'pedido' });

export default models;