import BaseService from '../../baseService.js';
import { DomainError } from '../../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../../utils/errorCatalog.js';
import { sequelize } from '../../../config/database.js';
import { randomUUID } from 'node:crypto';
import EvaluacionFisica from '../../evaluaciones_fisicas/EvaluacionFisica.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => new DomainError(ERROR_CATALOG.NOT_FOUND.code, 'Precinto no disponible', null, 404);
const invalid = (message) => new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code, message, null, 422);

class TrazabilidadEscaneoService extends BaseService {
  /**
   * @param {import('../repository/TrazabilidadEscaneoRepository.js').default} repository
   */
  constructor(repository) {
    super(repository, 'Escaneo de Trazabilidad QR');
  }

  async obtenerFichaPublica(token) {
    if (!UUID.test(token)) throw notFound();
    const ficha = await this.repository.consultarFichaPublica(token);
    if (!ficha) throw notFound();
    return ficha;
  }

  async obtenerFlujo(token, usuario) {
    if (!UUID.test(token)) throw notFound();
    const rol = usuario.rol_principal;
    if (!['ASISTENTE_TECNICO', 'LABORATORIO'].includes(rol)) throw notFound();
    const [rows] = await sequelize.query(
      `SELECT q.id, q.empresa_id, q.asistente_tecnico_id, q.estado,
              s.preoferta_id, s.peso_neto_kg, s.estado_saco, p.codigo_preoferta
       FROM logistica.inventario_precintos_qr q
       LEFT JOIN logistica.sacos_cafe s ON s.precinto_id = q.id
       LEFT JOIN cosechas.preofertas p ON p.id = s.preoferta_id
       WHERE q.token_qr_externo = :token LIMIT 1`,
      { replacements: { token } }
    );
    const precinto = rows[0];
    if (!precinto || precinto.estado === 'DANADO_ANULADO') throw notFound();
    const tabla = rol === 'ASISTENTE_TECNICO' ? 'asistentes_tecnicos' : 'laboratorios';
    const [perfiles] = await sequelize.query(
      `SELECT id FROM personas.${tabla} WHERE usuario_id = :usuarioId AND empresa_id = :empresaId AND activo = true LIMIT 1`,
      { replacements: { usuarioId: usuario.id, empresaId: precinto.empresa_id } }
    );
    if (!perfiles.length) throw notFound();
    if (rol === 'ASISTENTE_TECNICO' && precinto.asistente_tecnico_id !== perfiles[0].id) throw notFound();
    if (rol === 'LABORATORIO' && !precinto.preoferta_id) throw notFound();
    let analisis = null;
    if (rol === 'LABORATORIO') {
      const [evaluaciones] = await sequelize.query(
        `SELECT id, codigo_analisis, fecha_analisis, es_conforme
         FROM calidad.evaluaciones_fisicas
         WHERE laboratorio_id = :laboratorioId AND preoferta_id = :preofertaId
         ORDER BY fecha_creacion DESC LIMIT 1`,
        { replacements: { laboratorioId: perfiles[0].id, preofertaId: precinto.preoferta_id } }
      );
      analisis = evaluaciones[0] || null;
    }
    return {
      estado: precinto.estado,
      preoferta_id: precinto.preoferta_id,
      codigo_preoferta: precinto.codigo_preoferta,
      peso_neto_kg: precinto.peso_neto_kg,
      estado_saco: precinto.estado_saco,
      analisis,
    };
  }

  async registrarAnalisisDesdeQr(token, usuario, input) {
    if (usuario.rol_principal !== 'LABORATORIO') throw notFound();
    const flujo = await this.obtenerFlujo(token, usuario);
    if (flujo.analisis) throw invalid('Esta oferta ya tiene un análisis físico de tu laboratorio');
    const campos = ['peso_muestra_analizada_gramos', 'humedad_porcentaje', 'densidad_g_l',
      'actividad_agua_aw', 'factor_rendimiento'];
    const valores = Object.fromEntries(campos.map((campo) => [campo, Number(input?.[campo])]));
    const defectosUno = Number(input?.defectos_primer_grupo ?? 0);
    const defectosDos = Number(input?.defectos_segundo_grupo ?? 0);
    if (campos.some((campo) => !Number.isFinite(valores[campo]) || valores[campo] <= 0) ||
        valores.peso_muestra_analizada_gramos >= 10000 || valores.humedad_porcentaje > 100 ||
        valores.densidad_g_l >= 10000 || valores.actividad_agua_aw > 1 ||
        valores.factor_rendimiento >= 1000 ||
        !Number.isInteger(defectosUno) || defectosUno < 0 || !Number.isInteger(defectosDos) || defectosDos < 0 ||
        typeof input?.es_conforme !== 'boolean' || !String(input?.analista_nombre || '').trim()) {
      throw invalid('Completa los valores medidos y el responsable del análisis');
    }
    const [laboratorios] = await sequelize.query(
      `SELECT id FROM personas.laboratorios WHERE usuario_id = :usuarioId AND empresa_id =
       (SELECT empresa_id FROM logistica.inventario_precintos_qr WHERE token_qr_externo = :token)
       AND activo = true LIMIT 1`,
      { replacements: { usuarioId: usuario.id, token } }
    );
    if (!laboratorios.length) throw notFound();
    return EvaluacionFisica.create({
      codigo_analisis: `QR-${randomUUID().replace(/-/g, '').slice(0, 26)}`,
      etapa: 'FASE_1_FINCA_MUESTRA',
      preoferta_id: flujo.preoferta_id,
      laboratorio_id: laboratorios[0].id,
      analista_nombre: String(input.analista_nombre).trim().slice(0, 100),
      fecha_analisis: new Date(),
      ...valores,
      es_conforme: input.es_conforme,
      defectos_primer_grupo: defectosUno,
      defectos_segundo_grupo: defectosDos,
    });
  }

  /**
   * Consulta pública de trazabilidad por consumidor final (sin login)
   */
  async obtenerTrazabilidadPublica(tokenQrExterno, metaInfo = {}) {
    if (!UUID.test(tokenQrExterno)) throw notFound();
    const data = await this.repository.consultarVistaPublica(tokenQrExterno);
    if (!data) {
      throw new DomainError(
        ERROR_CATALOG.NOT_FOUND.code,
        'Código QR de café no encontrado o no registrado',
        `Token: ${tokenQrExterno}`,
        404
      );
    }

    // Registrar el escaneo anónimo en la bitácora inmutable
    const sacoId = await this.repository.findSacoByTokenQrExterno(tokenQrExterno);
    if (sacoId) {
      await this.repository.create({
        saco_id: sacoId,
        tipo_qr: 'QR_EXTERNO',
        usuario_id: null,
        rol_detectado: 'PUBLICO_EXTERNO',
        direccion_ip: metaInfo.ip || null,
        agente_usuario: metaInfo.userAgent || null,
        latitud: metaInfo.latitud || null,
        longitud: metaInfo.longitud || null,
        es_escaneo_valido: true,
        observaciones: 'Escaneo público anónimo desde cafetería / consumidor'
      });
    }

    return data;
  }

}

export default TrazabilidadEscaneoService;
