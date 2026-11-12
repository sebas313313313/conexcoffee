import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const ofertas = 'cosechas.ofertas_productores_externos';
const productores = 'personas.productores_externos';
const ficha = 'o.id, o.variedad, o.proceso, o.cantidad_sacos, o.peso_total_kg, o.precio_kg_cop';

const select = (sql, bind = {}, transaction) => sequelize.query(sql, {
  bind, transaction, logging: false, type: QueryTypes.SELECT,
});
const one = async (...args) => (await select(...args))[0];
const execute = (sql, bind, transaction) => sequelize.query(sql, { bind, transaction, logging: false });

export default class OfertasExternasRepository {
  transaction(work) {
    return sequelize.transaction({ logging: false }, work);
  }

  async save({ id, productorId, hash, contacto, variedad, proceso, cantidad_sacos,
    peso_total_kg, precio_kg_cop, condiciones_version }, tx) {
    await execute(`INSERT INTO ${productores}
      (id, correo_electronico, nombres, apellidos, telefono_movil, departamento, municipio)
      VALUES ($productorId, $correo_electronico, $nombres, $apellidos, $telefono_movil, $departamento, $municipio)
      ON CONFLICT (correo_electronico) DO NOTHING`, { ...contacto, productorId }, tx);
    await execute(`INSERT INTO ${ofertas}
      (id, productor_externo_id, variedad, origen_departamento, origen_municipio, proceso, cantidad_sacos, peso_total_kg, precio_kg_cop,
       contacto_declarado, condiciones_version, confirmacion_hash)
      SELECT $id, id, $variedad, $departamento, $municipio, $proceso, $cantidad_sacos, $peso_total_kg, $precio_kg_cop,
       $contacto, $condiciones_version, $hash FROM ${productores} WHERE correo_electronico = $correo`, {
      id, variedad, proceso, cantidad_sacos, peso_total_kg, precio_kg_cop, condiciones_version, hash,
      contacto: JSON.stringify(contacto), correo: contacto.correo_electronico,
      departamento: contacto.departamento, municipio: contacto.municipio,
    }, tx);
  }

  productorForOffer(field, value, tx) {
    // El nombre de columna proviene de llamadas internas con literales.
    return one(`SELECT p.* FROM ${productores} p JOIN ${ofertas} o ON o.productor_externo_id = p.id
      WHERE o.${field} = $value FOR UPDATE OF p`, { value }, tx);
  }

  cuentaExistente(correo, tx) {
    return one(`SELECT id FROM acceso.usuarios_sistema WHERE lower(correo_electronico) = $correo LIMIT 1`,
      { correo }, tx);
  }

  async publish(hash, productorId, tx) {
    const oferta = await one(`UPDATE ${ofertas} o
      SET confirmacion_hash = NULL, publicada_en = now(), vence_en = now() + interval '15 days',
          contacto_declarado = '{}'::jsonb
      FROM ${ofertas} pendiente WHERE o.id = pendiente.id
        AND o.confirmacion_hash = $hash AND o.confirmacion_vence_en > now()
      RETURNING o.id, o.vence_en, pendiente.contacto_declarado`, { hash }, tx);
    if (oferta) {
      // Los datos pendientes solo pasan al perfil externo cuando se demuestra acceso al correo.
      await execute(`UPDATE ${productores} SET nombres = $nombres, apellidos = $apellidos,
        telefono_movil = $telefono_movil, departamento = $departamento, municipio = $municipio
        WHERE id = $productorId`, { ...oferta.contacto_declarado, productorId }, tx);
      return { id: oferta.id, vence_en: oferta.vence_en };
    }
  }

  empresa(usuarioId, tx) {
    return one(`SELECT id, razon_social FROM personas.empresas_exportadoras WHERE usuario_id = $usuarioId`,
      { usuarioId }, tx);
  }

  list(empresaId, offset, tx) {
    return select(`SELECT ${ficha}, o.origen_departamento AS departamento, o.origen_municipio AS municipio, o.vence_en,
      CASE WHEN o.vinculada_en IS NOT NULL AND o.empresa_id = $empresaId
           THEN concat_ws(' ', p.nombres, p.apellidos) END AS productor_vinculado,
      CASE WHEN o.vinculada_en IS NOT NULL THEN 'VINCULADA'
           WHEN o.invitacion_vence_en > now() THEN 'INVITADA' ELSE 'DISPONIBLE' END AS estado
      FROM ${ofertas} o JOIN ${productores} p ON p.id = o.productor_externo_id
      WHERE (o.empresa_id = $empresaId AND (o.vinculada_en IS NOT NULL OR o.invitacion_vence_en > now()))
         OR (p.caficultor_id IS NULL AND o.publicada_en IS NOT NULL AND o.vence_en > now()
             AND NOT EXISTS (SELECT 1 FROM acceso.usuarios_sistema u
                             WHERE lower(u.correo_electronico) = p.correo_electronico)
             AND NOT EXISTS (SELECT 1 FROM ${ofertas} i WHERE i.productor_externo_id = p.id
                             AND i.invitacion_vence_en > now()))
      ORDER BY o.publicada_en DESC, o.id DESC LIMIT 21 OFFSET $offset`, { empresaId, offset }, tx);
  }

  reserve(id, productorId, empresaId, hash, tx) {
    return one(`UPDATE ${ofertas} o SET empresa_id = $empresaId, invitacion_hash = $hash,
        invitacion_vence_en = least(o.vence_en, now() + interval '3 days')
      WHERE o.id = $id AND o.publicada_en IS NOT NULL AND o.vence_en > now()
        AND NOT EXISTS (SELECT 1 FROM ${ofertas} i WHERE i.productor_externo_id = $productorId
                        AND i.invitacion_vence_en > now())
      RETURNING id, invitacion_vence_en`, { id, productorId, empresaId, hash }, tx);
  }

  invitation(hash, tx) {
    return one(`SELECT ${ficha}, o.empresa_id, o.invitacion_vence_en, e.usuario_id AS empresa_usuario_id, e.razon_social
      FROM ${ofertas} o JOIN personas.empresas_exportadoras e ON e.id = o.empresa_id
      WHERE o.invitacion_hash = $hash AND o.invitacion_vence_en > now()`, { hash }, tx);
  }

  async link(id, productorId, caficultorId, tx) {
    await execute(`UPDATE ${productores} SET caficultor_id = $caficultorId WHERE id = $productorId`,
      { productorId, caficultorId }, tx);
    await execute(`UPDATE ${ofertas} SET vinculada_en = now(), invitacion_hash = NULL,
      invitacion_vence_en = NULL WHERE id = $id`, { id }, tx);
  }

  nextExpired(excludedIds, tx) {
    return one(`SELECT o.id, p.correo_electronico FROM ${ofertas} o
      JOIN ${productores} p ON p.id = o.productor_externo_id
      WHERE o.vence_en <= now() AND o.vinculada_en IS NULL AND o.vencimiento_notificado_en IS NULL
        AND p.caficultor_id IS NULL AND NOT (o.id = ANY($excludedIds::uuid[]))
      ORDER BY o.vence_en, o.id LIMIT 1 FOR UPDATE OF o SKIP LOCKED`, { excludedIds }, tx);
  }

  markExpiredNotified(id, tx) {
    return execute(`UPDATE ${ofertas} SET vencimiento_notificado_en = now() WHERE id = $id`, { id }, tx);
  }
}
