import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

class SesionCatacion extends Model {}

SesionCatacion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    codigo_sesion: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    objetivo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    evaluacion_fisica_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    empresa_creadora_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    total_muestras: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    puntuacion_sca_global: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    estado_estandar: {
      type: DataTypes.STRING(50),
      defaultValue: 'EN_EVALUACION'
    },
    aprobado_para_exportacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_sesion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'SesionCatacion',
    tableName: 'sesiones_catacion',
    schema: 'calidad',
    timestamps: false
  }
);

export default SesionCatacion;
