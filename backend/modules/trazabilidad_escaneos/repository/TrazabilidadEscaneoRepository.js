import BaseRepository from '../../baseRepository.js';
import TrazabilidadEscaneo from '../TrazabilidadEscaneo.js';
import { sequelize } from '../../../config/database.js';

class TrazabilidadEscaneoRepository extends BaseRepository {
  constructor() {
    super(TrazabilidadEscaneo);
  }

  async consultarVistaPublica(tokenQrExterno) {
    return this.consultarFichaPublica(tokenQrExterno);
  }

  async consultarFichaPublica(token) {
    const [rows] = await sequelize.query(
      `SELECT q.codigo_suncho_precinto AS serial, s.numero_saco_consecutivo,
              s.peso_neto_kg, s.estado_saco, p.codigo_preoferta,
              p.proceso, p.secado, p.precio_esperado_cop,
              v.nombre AS variedad, v.especie,
              f.nombre_finca, f.departamento, f.municipio, f.vereda, f.altitud_msnm,
              concat_ws(' ', c.nombres, c.apellidos) AS productor_nombre,
              u.correo_electronico AS productor_correo
       FROM logistica.inventario_precintos_qr q
       JOIN logistica.sacos_cafe s ON s.precinto_id = q.id
       JOIN cosechas.preofertas p ON p.id = s.preoferta_id
       JOIN agronomia.fincas f ON f.id = p.finca_id
       JOIN personas.caficultores c ON c.id = p.caficultor_id
       JOIN acceso.usuarios_sistema u ON u.id = c.usuario_id
       JOIN agronomia.variedades_cafe v ON v.id = p.variedad_id
       WHERE q.token_qr_externo = :token AND q.estado = 'VINCULADO_A_SACO'
       LIMIT 1`,
      { replacements: { token } }
    );
    return rows[0] || null;
  }

  async findSacoByTokenQrExterno(tokenQrExterno) {
    const [results] = await sequelize.query(
      `SELECT s.id 
       FROM logistica.sacos_cafe s
       JOIN logistica.inventario_precintos_qr p ON s.precinto_id = p.id
       WHERE p.token_qr_externo = :token LIMIT 1`,
      {
        replacements: { token: tokenQrExterno }
      }
    );
    return results?.[0]?.id || null;
  }
}

export default TrazabilidadEscaneoRepository;
