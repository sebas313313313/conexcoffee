import { sequelize } from '../config/database.js';

/** Crea la persistencia necesaria para asignar sesiones mediante QR. */
async function migrate() {
  await sequelize.transaction(async (transaction) => {
    await sequelize.query('ALTER TABLE calidad.sesiones_catacion ADD COLUMN IF NOT EXISTS empresa_creadora_id uuid NULL', { transaction });
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS calidad.asignaciones_sesiones_catacion (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        sesion_id uuid NOT NULL REFERENCES calidad.sesiones_catacion(id) ON DELETE CASCADE,
        catador_id uuid NOT NULL REFERENCES personas.catadores(id),
        estado varchar(30) NOT NULL DEFAULT 'PENDIENTE',
        fecha_asignacion timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT asignacion_sesion_catador_unica UNIQUE (sesion_id, catador_id)
      )
    `, { transaction });
  });
  console.log('Migración QR de sesiones de catación completada.');
}

migrate().catch((error) => {
  console.error('No se pudo aplicar la migración QR:', error);
  process.exitCode = 1;
}).finally(() => sequelize.close());
