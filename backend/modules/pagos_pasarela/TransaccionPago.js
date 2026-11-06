import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

class TransaccionPago extends Model {}

TransaccionPago.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    pedido_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tipo_etapa_pago: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: 'ANTICIPO_RESERVA',
    },
    pasarela_nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Payments Way Colombia',
    },
    identificador_transaccion_externo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    monto_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    tasa_cambio_aplicada_cop: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 4150.0,
    },
    monto_equivalente_cop: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    estado_pago: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'EXITOSO',
    },
    fecha_transaccion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'TransaccionPago',
    tableName: 'transacciones_pagos',
    schema: 'finanzas',
    timestamps: false,
  }
);

export default TransaccionPago;
