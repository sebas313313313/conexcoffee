import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Registro de la reserva de una sesión por un catador.
 *
 * Una hoja CVA es el resultado de una evaluación terminada; no debe usarse
 * como señal de asignación porque una evaluación recién escaneada sigue
 * pendiente. Esta entidad conserva esa diferencia.
 */
class AsignacionSesionCatacion extends Model {}

AsignacionSesionCatacion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sesion_id: { type: DataTypes.UUID, allowNull: false },
    catador_id: { type: DataTypes.UUID, allowNull: false },
    estado: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'PENDIENTE' },
    fecha_asignacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'AsignacionSesionCatacion',
    tableName: 'asignaciones_sesiones_catacion',
    schema: 'calidad',
    timestamps: false,
    indexes: [{ unique: true, fields: ['sesion_id', 'catador_id'] }],
  }
);

export default AsignacionSesionCatacion;
