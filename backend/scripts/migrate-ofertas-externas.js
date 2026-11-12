import { readFile } from 'node:fs/promises';
import { sequelize } from '../config/database.js';

try {
  const sql = await readFile(new URL('../migrations/004_ofertas_productores_externos.sql', import.meta.url), 'utf8');
  // Sequelize gestiona el rollback si alguna sentencia de la migración falla.
  const statements = sql.replace(/^BEGIN;/, '').replace(/COMMIT;\s*$/, '');
  await sequelize.transaction({ logging: false }, (transaction) => sequelize.query(statements, { transaction, logging: false }));
  console.log('Migración de ofertas de productores externos aplicada.');
} catch (error) {
  console.error('No se pudo aplicar la migración:', error.original?.message || error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
