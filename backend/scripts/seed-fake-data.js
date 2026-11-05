import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

/**
 * Script de Generación y Carga de Datos Falsos ConexCoffee
 * Puebla el ecosistema completo con datos realistas de café especial del Cauca:
 * Usuarios (todos los roles), Caficultores, Fincas, Lotes, Preofertas,
 * Inspecciones, Evaluaciones Físicas y Sensoriales CVA, Precintos Doble QR,
 * Sacos Físicos, Escaneos, Contenedores Marítimos, Pedidos y Alertas.
 */

const SEED_PASSWORD = 'Password123!';

const seedDatabase = async () => {
  console.log('====================================================');
  console.log('🌱 INICIANDO POBLADO DE DATOS DE PRUEBA (CONEXCOFFEE)');
  console.log('====================================================');

  try {
    await sequelize.authenticate();
    console.log(' Conexión a PostgreSQL establecida correctamente.\n');

    // Generar hash de contraseña uniforme para todos los usuarios de prueba
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, salt);

    // ========================================================
    // 1. USUARIOS DEL SISTEMA (acceso.usuarios_sistema)
    // ========================================================
    console.log('👤 [1/10] Creando usuarios del sistema...');

    const usuariosData = [
      { email: 'admin@conexcoffee.com', rol: 'ADMINISTRADOR' },
      { email: 'exportadora@improcafe.com', rol: 'EMPRESA_EXPORTADORA' },
      { email: 'tecnico.carlos@improcafe.com', rol: 'ASISTENTE_TECNICO' },
      { email: 'lab.tecnicafe@laboratorios.com', rol: 'LABORATORIO' },
      { email: 'catador.ana@qgrader.com', rol: 'CATADOR' },
      { email: 'catador.felipe@qgrader.com', rol: 'CATADOR' },
      { email: 'catador.diana@tecnicafe.com', rol: 'CATADOR' },
      { email: 'caficultor.pedro@fincaesperanza.com', rol: 'CAFICULTOR' },
      { email: 'caficultor.martha@fincamirador.com', rol: 'CAFICULTOR' },
      { email: 'caficultor.javier@fincaclarita.com', rol: 'CAFICULTOR' },
      { email: 'broker.john@greenhorizoncoffee.com', rol: 'BROKER' },
      { email: 'comprador.hans@berlinroasters.de', rol: 'COMPRADOR_INTERNACIONAL' }
    ];

    const usuariosMap = {};

    for (const u of usuariosData) {
      const [user] = await sequelize.query(
        `INSERT INTO acceso.usuarios_sistema 
          (correo_electronico, hash_contrasena, rol_principal, esta_activo, correo_verificado)
         VALUES (:email, :hash, :rol, true, true)
         ON CONFLICT (correo_electronico) 
         DO UPDATE SET hash_contrasena = EXCLUDED.hash_contrasena, esta_activo = true
         RETURNING id, correo_electronico, rol_principal`,
        {
          replacements: { email: u.email, hash: passwordHash, rol: u.rol }
        }
      );
      usuariosMap[u.email] = user[0].id;
    }
    console.log(`  ✓ ${Object.keys(usuariosMap).length} usuarios registrados exitosamente.`);

    // ========================================================
    // 2. ESPECIALIZACIÓN POR ROLES (personas.*)
    // ========================================================
    console.log('\n🏢 [2/10] Creando actores especializados de negocio...');

    // A. Administrador
    await sequelize.query(
      `INSERT INTO personas.administradores (usuario_id, nombres, apellidos, cargo, departamento)
       VALUES (:usuario_id, 'Super Admin', 'ConexCoffee', 'Super Administrador', 'Tecnología y Operaciones')
       ON CONFLICT DO NOTHING`,
      { replacements: { usuario_id: usuariosMap['admin@conexcoffee.com'] } }
    );

    // B. Empresa Exportadora (Improcafé)
    const [empresaRes] = await sequelize.query(
      `INSERT INTO personas.empresas_exportadoras 
        (usuario_id, nit, razon_social, nombre_comercial, representante_legal, direccion, telefono_contacto, codigo_exportador_dian, estado_aprobacion)
       VALUES 
        (:usuario_id, '900876543-1', 'Improcafé Colombia S.A.S.', 'Improcafé', 'Mauricio Gómez', 'Calle 10 # 4-50, Popayán, Cauca', '+573101234567', 'EXP-DIAN-2024-99', 'APROBADA')
       ON CONFLICT (nit) DO UPDATE SET razon_social = EXCLUDED.razon_social
       RETURNING id`,
      { replacements: { usuario_id: usuariosMap['exportadora@improcafe.com'] } }
    );
    const empresaId = empresaRes[0].id;

    // C. Asistente Técnico
    const [tecnicoRes] = await sequelize.query(
      `INSERT INTO personas.asistentes_tecnicos 
        (usuario_id, empresa_id, tipo_documento, numero_documento, nombres, apellidos, tarjeta_profesional, profesion, telefono_movil, activo)
       VALUES 
        (:usuario_id, :empresa_id, 'CC', '1061789456', 'Carlos Andrés', 'Mera Rodríguez', 'TP-AGRO-88912', 'Ingeniero Agrónomo', '+573159876543', true)
       ON CONFLICT (numero_documento) DO UPDATE SET nombres = EXCLUDED.nombres
       RETURNING id`,
      { replacements: { usuario_id: usuariosMap['tecnico.carlos@improcafe.com'], empresa_id: empresaId } }
    );
    const tecnicoId = tecnicoRes[0].id;

    // D. Laboratorio Aliado
    const [labRes] = await sequelize.query(
      `INSERT INTO personas.laboratorios 
        (usuario_id, empresa_id, nit, nombre_laboratorio, direccion, departamento, municipio, responsable_tecnico, telefono_contacto, certificaciones, activo)
       VALUES 
        (:usuario_id, :empresa_id, '800987654-2', 'Laboratorio de Calidad Tecnicafé', 'Parque Tecnológico Tecnicafé, Km 5 Vía Panamericana', 'Cauca', 'Cajibío', 'Dra. Claudia Benítez', '+573123456789', '{"iso": "17025", "aval": "Tecnicafé"}', true)
       ON CONFLICT (empresa_id, nit) DO UPDATE SET nombre_laboratorio = EXCLUDED.nombre_laboratorio
       RETURNING id`,
      { replacements: { usuario_id: usuariosMap['lab.tecnicafe@laboratorios.com'], empresa_id: empresaId } }
    );
    const laboratorioId = labRes[0].id;

    // E. Catadores Q-Grader (Panel de Expertos)
    const catadoresData = [
      { email: 'catador.ana@qgrader.com', doc: '1061321654', nombres: 'Ana María', apellidos: 'López Q-Grader', cert: 'Q-GRADER-COL-2024-889', tel: '+573147894561' },
      { email: 'catador.felipe@qgrader.com', doc: '1061432765', nombres: 'Felipe Andrés', apellidos: 'Restrepo Q-Grader', cert: 'Q-GRADER-COL-2023-512', tel: '+573158901234' },
      { email: 'catador.diana@tecnicafe.com', doc: '1061543876', nombres: 'Diana Marcela', apellidos: 'Torres Q-Grader', cert: 'Q-GRADER-COL-2025-104', tel: '+573169012345' }
    ];

    const catadoresMap = {};
    for (const cat of catadoresData) {
      const [res] = await sequelize.query(
        `INSERT INTO personas.catadores 
          (usuario_id, empresa_id, laboratorio_id, numero_documento, nombres, apellidos, codigo_certificado_q_grader, fecha_vencimiento_q_grader, telefono_movil, activo)
         VALUES 
          (:usuario_id, :empresa_id, :laboratorio_id, :doc, :nombres, :apellidos, :cert, '2028-12-31', :tel, true)
         ON CONFLICT (codigo_certificado_q_grader) DO UPDATE SET nombres = EXCLUDED.nombres
         RETURNING id`,
        {
          replacements: {
            usuario_id: usuariosMap[cat.email],
            empresa_id: empresaId,
            laboratorio_id: laboratorioId,
            doc: cat.doc,
            nombres: cat.nombres,
            apellidos: cat.apellidos,
            cert: cat.cert,
            tel: cat.tel
          }
        }
      );
      catadoresMap[cat.email] = res[0].id;
    }
    const catadorId = catadoresMap['catador.ana@qgrader.com'];

    // F. Caficultores
    const caficultoresData = [
      { email: 'caficultor.pedro@fincaesperanza.com', doc: '1061987654', nombres: 'Pedro Nel', apellidos: 'García Muñoz', tel: '+573117654321', mun: 'Piendamó', saldo: 2500000.00 },
      { email: 'caficultor.martha@fincamirador.com', doc: '1061876543', nombres: 'Martha Lucía', apellidos: 'Sánchez Paz', tel: '+573128765432', mun: 'Morales', saldo: 1800000.00 },
      { email: 'caficultor.javier@fincaclarita.com', doc: '1061765432', nombres: 'Javier Elías', apellidos: 'Hoyos Castro', tel: '+573139876543', mun: 'El Tambo', saldo: 950000.00 }
    ];

    const caficultoresMap = {};
    for (const c of caficultoresData) {
      const [caf] = await sequelize.query(
        `INSERT INTO personas.caficultores 
          (usuario_id, empresa_exportadora_id, tipo_documento, numero_documento, nombres, apellidos, telefono_movil, departamento, municipio, estado_verificacion, billetera_saldo_cop)
         VALUES 
          (:usuario_id, :empresa_id, 'CC', :doc, :nombres, :apellidos, :tel, 'Cauca', :mun, 'APROBADO', :saldo)
         ON CONFLICT (numero_documento) DO UPDATE SET billetera_saldo_cop = EXCLUDED.billetera_saldo_cop, empresa_exportadora_id = EXCLUDED.empresa_exportadora_id
         RETURNING id`,
        {
          replacements: {
            usuario_id: usuariosMap[c.email],
            empresa_id: empresaId,
            doc: c.doc,
            nombres: c.nombres,
            apellidos: c.apellidos,
            tel: c.tel,
            mun: c.mun,
            saldo: c.saldo
          }
        }
      );
      caficultoresMap[c.email] = caf[0].id;
    }

    // G. Broker Internacional
    const [brokerRes] = await sequelize.query(
      `INSERT INTO personas.brokers 
        (usuario_id, nombre_empresa, identificacion_fiscal_pais, pais_operacion, ciudad, direccion_bodega, telefono_contacto, porcentaje_comision_split, activo)
       VALUES 
        (:usuario_id, 'Green Horizon Specialty Coffee LLC', 'EIN-88-9923145', 'Estados Unidos', 'Miami', 'Port of Miami Free Trade Zone Whse 4B', '+13055550199', 5.00, true)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      { replacements: { usuario_id: usuariosMap['broker.john@greenhorizoncoffee.com'] } }
    );
    let brokerId = brokerRes?.[0]?.id;
    if (!brokerId) {
      const [b] = await sequelize.query(`SELECT id FROM personas.brokers WHERE usuario_id = :u`, { replacements: { u: usuariosMap['broker.john@greenhorizoncoffee.com'] } });
      brokerId = b[0].id;
    }

    // H. Comprador Internacional (Tostador Boutique en Berlín)
    const [compradorRes] = await sequelize.query(
      `INSERT INTO personas.compradores_internacionales 
        (usuario_id, tipo_entidad, nombre_empresa, identificacion_tributaria, pais_destino, ciudad, direccion_entrega, telefono_contacto, sitio_web, activo)
       VALUES 
        (:usuario_id, 'TOSTADOR_ARTESANAL', 'The Barn Berlin Roastery', 'DE-VAT-987654321', 'Alemania', 'Berlín', 'Schönhauser Allee 8, 10119 Berlin', '+493012345678', 'https://thebarn.de', true)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      { replacements: { usuario_id: usuariosMap['comprador.hans@berlinroasters.de'] } }
    );
    let compradorId = compradorRes?.[0]?.id;
    if (!compradorId) {
      const [c] = await sequelize.query(`SELECT id FROM personas.compradores_internacionales WHERE usuario_id = :u`, { replacements: { u: usuariosMap['comprador.hans@berlinroasters.de'] } });
      compradorId = c[0].id;
    }
    console.log('  ✓ Roles especializados creados (Empresa, Técnico, Laboratorio, Catador, Caficultores, Broker, Comprador).');

    // ========================================================
    // 3. AGRONOMÍA (Fincas y Lotes de Cultivo)
    // ========================================================
    console.log('\n🏞️ [3/10] Creando fincas y lotes georreferenciados...');

    const fincasData = [
      {
        caficultor_id: caficultoresMap['caficultor.pedro@fincaesperanza.com'],
        nombre: 'Finca La Esperanza',
        municipio: 'Piendamó',
        vereda: 'El Carmen',
        altitud: 1850,
        lat: 2.641250,
        lon: -76.531240,
        area: 4.50,
        tipo: 'ORGANICO',
        historia: 'Tres generaciones dedicadas al cultivo artesanal de variedades exóticas con fermentaciones controladas.'
      },
      {
        caficultor_id: caficultoresMap['caficultor.martha@fincamirador.com'],
        nombre: 'Finca El Mirador',
        municipio: 'Morales',
        vereda: 'San Isidro',
        altitud: 1920,
        lat: 2.756180,
        lon: -76.621450,
        area: 6.00,
        tipo: 'EN_TRANSICION',
        historia: 'Ubicada en la cordillera central, protegida por bosques de niebla y sombrío nativo.'
      },
      {
        caficultor_id: caficultoresMap['caficultor.javier@fincaclarita.com'],
        nombre: 'Finca Villa Clarita',
        municipio: 'El Tambo',
        vereda: 'Los Anayes',
        altitud: 1780,
        lat: 2.451200,
        lon: -76.812300,
        area: 3.80,
        tipo: 'CONVENCIONAL',
        historia: 'Especializada en secado lento bajo marquesina y beneficio ecológico con cero vertimientos.'
      }
    ];

    const fincasMap = {};
    for (const f of fincasData) {
      const [finca] = await sequelize.query(
        `INSERT INTO agronomia.fincas 
          (caficultor_id, nombre_finca, departamento, municipio, vereda, altitud_msnm, latitud, longitud, area_total_hectareas, tipo_manejo, historia_familiar)
         VALUES 
          (:caficultor_id, :nombre, 'Cauca', :municipio, :vereda, :altitud, :lat, :lon, :area, :tipo, :historia)
         RETURNING id, nombre_finca`,
        { replacements: f }
      );
      fincasMap[f.nombre] = finca[0].id;
    }

    // Consultar variedades botánicas existentes
    const [variedades] = await sequelize.query(`SELECT id, nombre FROM agronomia.variedades_cafe`);
    const varMap = {};
    variedades.forEach(v => { varMap[v.nombre] = v.id; });

    // Lotes de cultivo
    const lotesData = [
      { finca_id: fincasMap['Finca La Esperanza'], var_id: varMap['Geisha'] || 2, nombre: 'Lote El Roble (Geisha)', arboles: 2500, edad: 4.5, sombra: 'PARCIAL' },
      { finca_id: fincasMap['Finca La Esperanza'], var_id: varMap['Borbón Rosado'] || 3, nombre: 'Lote Las Nubes (Borbón Rosado)', arboles: 3000, edad: 3.5, sombra: 'TOTAL' },
      { finca_id: fincasMap['Finca El Mirador'], var_id: varMap['Castillo'] || 1, nombre: 'Lote La Cascada (Castillo)', arboles: 5000, edad: 5.0, sombra: 'A_LIBRE_EXPOSICION' },
      { finca_id: fincasMap['Finca Villa Clarita'], var_id: varMap['Tabi'] || 5, nombre: 'Lote Los Guayabos (Tabi)', arboles: 2800, edad: 3.0, sombra: 'PARCIAL' }
    ];

    for (const l of lotesData) {
      await sequelize.query(
        `INSERT INTO agronomia.lotes_cultivo 
          (finca_id, variedad_id, nombre_identificador, numero_arboles, edad_arboles_anos, tipo_sombra)
         VALUES (:finca_id, :var_id, :nombre, :arboles, :edad, :sombra)
         RETURNING id`,
        { replacements: l }
      );
    }
    console.log('  ✓ 3 fincas y 4 lotes de cultivo dados de alta.');

    // ========================================================
    // 4. COSECHAS (Preofertas de Lotes de Café)
    // ========================================================
    console.log('\n🌾 [4/10] Creando preofertas de café especial...');

    const preofertasData = [
      {
        codigo: 'PRE-2026-0001',
        caficultor_id: caficultoresMap['caficultor.pedro@fincaesperanza.com'],
        finca_id: fincasMap['Finca La Esperanza'],
        var_id: varMap['Geisha'] || 2,
        proceso: 'NATURAL',
        secado: 'SOL_MARQUESINA',
        cargas: 20.00,
        kg: 2500.00,
        precio_cop: 3800000.00,
        modalidad: 'DIRECTA',
        estado: 'EN_INSPECCION_CAMPO'
      },
      {
        codigo: 'PRE-2026-0002',
        caficultor_id: caficultoresMap['caficultor.martha@fincamirador.com'],
        finca_id: fincasMap['Finca El Mirador'],
        var_id: varMap['Borbón Rosado'] || 3,
        proceso: 'LAVADO',
        secado: 'CAMA_AFRICANA',
        cargas: 15.00,
        kg: 1875.00,
        precio_cop: 3200000.00,
        modalidad: 'BOLSA_LIBRE',
        estado: 'OFERTA_LIBRE'
      },
      {
        codigo: 'PRE-2026-0003',
        caficultor_id: caficultoresMap['caficultor.javier@fincaclarita.com'],
        finca_id: fincasMap['Finca Villa Clarita'],
        var_id: varMap['Castillo'] || 1,
        proceso: 'DOBLE_FERMENTACION',
        secado: 'SOL_MARQUESINA',
        cargas: 35.00,
        kg: 4375.00,
        precio_cop: 2900000.00,
        modalidad: 'DIRECTA',
        estado: 'CONTRATADA'
      }
    ];

    const preofertasMap = {};
    for (const p of preofertasData) {
      const [pre] = await sequelize.query(
        `INSERT INTO cosechas.preofertas 
          (codigo_preoferta, caficultor_id, finca_id, variedad_id, proceso, secado, fecha_recoleccion, fecha_almacenamiento_pos_secado, cantidad_cargas, cantidad_kg, precio_esperado_cop, tipo_modalidad, empresa_aliada_asignada_id, estado)
         VALUES 
          (:codigo, :caficultor_id, :finca_id, :var_id, :proceso, :secado, CURRENT_DATE - 30, CURRENT_DATE - 10, :cargas, :kg, :precio_cop, :modalidad, :empresa_id, :estado)
         ON CONFLICT (codigo_preoferta) DO UPDATE SET estado = EXCLUDED.estado
         RETURNING id, codigo_preoferta`,
        { replacements: { ...p, empresa_id: empresaId } }
      );
      preofertasMap[p.codigo] = pre[0].id;
    }
    console.log('  ✓ 3 preofertas registradas (Geisha Natural, Borbón Rosado Lavado, Castillo Doble Fermentación).');

    // ========================================================
    // 5. INSPECCIÓN TÉCNICA EN FINCA (cosechas.inspecciones_finca)
    // ========================================================
    console.log('\n📋 [5/10] Registrando inspección técnica de campo con humedad controlada...');

    const preoferta1Id = preofertasMap['PRE-2026-0001'];
    await sequelize.query(
      `INSERT INTO cosechas.inspecciones_finca 
        (preoferta_id, asistente_tecnico_id, fecha_visita, modo_offline, latitud_inspeccion, longitud_inspeccion, 
         estibas_madera_presentes, lugar_limpio_ventilado, empaque_bolsa_hermetica, tipo_empaque_hermetico, 
         humedad_pergamino_porcentaje, temperatura_ambiente_c, muestra_lab_extraida_gramos, muestra_comercial_sellada_kg, 
         codigo_precinto_muestra_comercial, fotos_evidencia, resultado_inspeccion, observaciones_tecnicas)
       VALUES 
        (:preoferta_id, :tecnico_id, CURRENT_TIMESTAMP - INTERVAL '5 days', false, 2.641250, -76.531240, 
         true, true, true, 'GrainPro', 
         10.80, 21.5, 1000, 5.00, 
         'PRE-MUESTRA-2026-01', '[{"tipo": "cultivo", "url": "https://storage.conexcoffee.com/fotos/cultivo1.jpg"}, {"tipo": "almacenamiento", "url": "https://storage.conexcoffee.com/fotos/estibas1.jpg"}]', 
         'CONFORME', 'Lote en óptimas condiciones de secado. Estibas reglamentarias y empaque GrainPro verificado.')
       RETURNING id`,
      { replacements: { preoferta_id: preoferta1Id, tecnico_id: tecnicoId } }
    );
    console.log('  ✓ Inspección técnica CONFORME registrada (Humedad: 10.8%, GrainPro, fotos S3).');

    // ========================================================
    // 6. ANÁLISIS FÍSICO DE LABORATORIO (calidad.evaluaciones_fisicas)
    // ========================================================
    console.log('\n🔬 [6/10] Registrando análisis físico de laboratorio...');

    const evalFisicaData = [
      {
        codigo: 'ANALISIS-FIS-2026-001',
        preoferta_id: preofertasMap['PRE-2026-0001'],
        humedad: 10.70,
        densidad: 712.50,
        aw: 0.618,
        factor: 88.40,
        malla18: 52.00,
        malla17: 31.00,
        def1: 0,
        def2: 2,
        conforme: true
      },
      {
        codigo: 'ANALISIS-FIS-2026-002',
        preoferta_id: preofertasMap['PRE-2026-0002'],
        humedad: 11.10,
        densidad: 705.00,
        aw: 0.625,
        factor: 89.10,
        malla18: 48.00,
        malla17: 35.00,
        def1: 0,
        def2: 3,
        conforme: true
      },
      {
        codigo: 'ANALISIS-FIS-2026-003',
        preoferta_id: preofertasMap['PRE-2026-0003'],
        humedad: 12.80,
        densidad: 680.00,
        aw: 0.665,
        factor: 94.20,
        malla18: 30.00,
        malla17: 40.00,
        def1: 2,
        def2: 8,
        conforme: false
      }
    ];

    const evalFisicaMap = {};
    for (const ef of evalFisicaData) {
      const [res] = await sequelize.query(
        `INSERT INTO calidad.evaluaciones_fisicas 
          (codigo_analisis, etapa, preoferta_id, laboratorio_id, analista_nombre, fecha_analisis, 
           peso_muestra_analizada_gramos, humedad_porcentaje, densidad_g_l, actividad_agua_aw, factor_rendimiento, 
           malla_18_porcentaje, malla_17_porcentaje, malla_16_porcentaje, malla_15_porcentaje, malla_14_porcentaje, 
           defectos_primer_grupo, defectos_segundo_grupo, es_conforme, firma_digital_laboratorio)
         VALUES 
          (:codigo, 'FASE_1_FINCA_MUESTRA', :preoferta_id, :lab_id, 'Dra. Claudia Benítez', CURRENT_TIMESTAMP - INTERVAL '3 days', 
           250.00, :humedad, :densidad, :aw, :factor, 
           :malla18, :malla17, 12.00, 4.00, 1.00, 
           :def1, :def2, :conforme, 'SHA256_FIRMA_LAB_TECNICAFE_VALIDADA_2026')
         ON CONFLICT (codigo_analisis) DO UPDATE SET humedad_porcentaje = EXCLUDED.humedad_porcentaje
         RETURNING id`,
        {
          replacements: {
            codigo: ef.codigo,
            preoferta_id: ef.preoferta_id,
            lab_id: laboratorioId,
            humedad: ef.humedad,
            densidad: ef.densidad,
            aw: ef.aw,
            factor: ef.factor,
            malla18: ef.malla18,
            malla17: ef.malla17,
            def1: ef.def1,
            def2: ef.def2,
            conforme: ef.conforme
          }
        }
      );
      evalFisicaMap[ef.codigo] = res[0].id;
    }
    const evalFisicaId = evalFisicaMap['ANALISIS-FIS-2026-001'];
    console.log('  ✓ 3 análisis físicos de laboratorio registrados (Geisha Conforme, Borbón Conforme, Castillo con Alerta Humedad).');

    // ========================================================
    // 7. EVALUACIÓN SENSORIAL SCA CVA 8 FASES (calidad.sesiones_catacion + calidad.hojas_catacion_cva)
    // ========================================================
    console.log('\n☕ [7/10] Ingestando sesiones y hojas de catación CVA (1 Sesión -> N Hojas con panel de catadores)...');

    // --- SESIÓN 1: Microlote Geisha Natural (Panel de 2 Catadores: Ana y Felipe) ---
    const payloadGeishaAna = {
      evaluacion: {
        codigo: 'SES-2026-G01',
        titulo: 'Sesión Oficial Mesa de Cata: Geisha Natural Piendamó',
        objetivo: 'Determinar perfil CVA y certificar calidad de exportación SCA >= 80',
        total_muestras: 1,
        conclusion_catador: 'Perfil de altísima complejidad floral, jazmín puro, miel de azahar y acidez málica brillante tipo manzana verde.',
        puntuacion_catador: 88.75,
        fases: {
          fase_1_descriptiva: {
            nivel_tueste: { valor: 65.00, nombre: 'Medio Claro', termino_ingles: 'Medium Light' },
            fragancia: { intensidad: 13.50, categoria_intensidad: 'Muy Intenso', escala_maxima: 15 },
            aroma: { intensidad: 14.00, categoria_intensidad: 'Muy Intenso', escala_maxima: 15 },
            descriptores: ['Jazmín', 'Miel', 'Bergamota', 'Frutas Amarillas']
          },
          fase_2_afectiva: {
            fragancia: { calidad_agrado: 8.8, escala_maxima: 9 },
            aroma: { calidad_agrado: 8.9, escala_maxima: 9 }
          },
          fase_3_sabor_descriptiva: {
            sabor: { intensidad: 14.00, categoria_intensidad: 'Intenso y Complejo', escala_maxima: 15 },
            sabor_residual_aftertaste: { intensidad: 12.50, categoria_intensidad: 'Prolongado y Limpio', escala_maxima: 15 },
            gustos_predominantes: ['Dulce', 'Ácido'],
            descriptores_sabor: ['Melocotón', 'Jazmín', 'Miel de Azahar']
          },
          fase_4_sabor_afectiva: {
            sabor: { calidad_agrado: 8.9, escala_maxima: 9 },
            sabor_residual: { calidad_agrado: 8.7, escala_maxima: 9 }
          },
          fase_5_acidez: {
            intensidad: { valor: 12.50, categoria_intensidad: 'Media-Alta Brillante', escala_maxima: 15 },
            calidad_agrado: { valor: 8.8, escala_maxima: 9 },
            tipo_acidez_nota: 'Málica vibrante tipo manzana verde'
          },
          fase_6_dulzor: {
            intensidad: { valor: 13.00, categoria_intensidad: 'Muy Dulce', escala_maxima: 15 },
            calidad_agrado: { valor: 8.9, escala_maxima: 9 },
            tipo_dulzor_nota: 'Panela clara y miel de azahar'
          },
          fase_7_sensacion_boca: {
            intensidad: { valor: 12.00, categoria_intensidad: 'Cuerpo Medio Redondo', escala_maxima: 15 },
            textura_cualidad: ['Sedoso', 'Aterciopelado'],
            calidad_agrado: { valor: 8.8, escala_maxima: 9 },
            nota: 'Textura envolvente y sedosa'
          },
          fase_8_impresion_global: {
            calidad_agrado_global: { valor: 9.0, escala_maxima: 9 },
            nota_balance: 'Excelente balance y alta fidelidad varietal'
          },
          defectos_y_uniformidad: {
            tazas_no_uniformes: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tazas_defectuosas: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tipo_defecto: 'NINGUNO'
          }
        }
      }
    };

    const payloadGeishaFelipe = {
      evaluacion: {
        codigo: 'SES-2026-G01',
        total_muestras: 1,
        conclusion_catador: 'Taza extraordinaria, notas cítricas finas de bergamota y final sedoso muy prolongado.',
        puntuacion_catador: 89.25,
        fases: {
          fase_1_descriptiva: {
            nivel_tueste: { valor: 65.00, nombre: 'Medio Claro', termino_ingles: 'Medium Light' },
            fragancia: { intensidad: 14.00, categoria_intensidad: 'Muy Intenso', escala_maxima: 15 },
            aroma: { intensidad: 14.50, categoria_intensidad: 'Muy Intenso', escala_maxima: 15 },
            descriptores: ['Jazmín', 'Flor de Café', 'Mandarina']
          },
          fase_2_afectiva: {
            fragancia: { calidad_agrado: 9.0, escala_maxima: 9 },
            aroma: { calidad_agrado: 9.0, escala_maxima: 9 }
          },
          fase_3_sabor_descriptiva: {
            sabor: { intensidad: 14.50, categoria_intensidad: 'Muy Intenso', escala_maxima: 15 },
            sabor_residual_aftertaste: { intensidad: 13.00, categoria_intensidad: 'Muy Prolongado', escala_maxima: 15 },
            gustos_predominantes: ['Dulce', 'Floral'],
            descriptores_sabor: ['Mandarina', 'Jazmín', 'Melocotón maduro']
          },
          fase_4_sabor_afectiva: {
            sabor: { calidad_agrado: 9.0, escala_maxima: 9 },
            sabor_residual: { calidad_agrado: 8.8, escala_maxima: 9 }
          },
          fase_5_acidez: {
            intensidad: { valor: 13.00, categoria_intensidad: 'Brillante Jugosa', escala_maxima: 15 },
            calidad_agrado: { valor: 9.0, escala_maxima: 9 },
            tipo_acidez_nota: 'Cítrica málica refinada'
          },
          fase_6_dulzor: {
            intensidad: { valor: 13.50, categoria_intensidad: 'Muy Dulce', escala_maxima: 15 },
            calidad_agrado: { valor: 9.0, escala_maxima: 9 },
            tipo_dulzor_nota: 'Miel de caña artesanal'
          },
          fase_7_sensacion_boca: {
            intensidad: { valor: 12.50, categoria_intensidad: 'Cuerpo Redondo', escala_maxima: 15 },
            textura_cualidad: ['Sedoso'],
            calidad_agrado: { valor: 8.9, escala_maxima: 9 },
            nota: 'Sensación limpia y aterciopelada'
          },
          fase_8_impresion_global: {
            calidad_agrado_global: { valor: 9.0, escala_maxima: 9 },
            nota_balance: 'Taza balanceada de clase mundial'
          },
          defectos_y_uniformidad: {
            tazas_no_uniformes: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tazas_defectuosas: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tipo_defecto: 'NINGUNO'
          }
        }
      }
    };

    // Ingestar Hoja 1 y Hoja 2 de la Sesión 1
    const [h1Res] = await sequelize.query(
      `SELECT calidad.fn_guardar_evaluacion_cva_desde_json(:p::jsonb, :c::uuid, :e::uuid, 88.75) AS id`,
      { replacements: { p: JSON.stringify(payloadGeishaAna), c: catadoresMap['catador.ana@qgrader.com'], e: evalFisicaMap['ANALISIS-FIS-2026-001'] } }
    );
    await sequelize.query(`UPDATE calidad.hojas_catacion_cva SET firma_digital_catador = 'SHA256_FIRMA_ANA_LOPEZ' WHERE id = :id`, { replacements: { id: h1Res[0].id } });

    const [h2Res] = await sequelize.query(
      `SELECT calidad.fn_guardar_evaluacion_cva_desde_json(:p::jsonb, :c::uuid, :e::uuid, 89.25) AS id`,
      { replacements: { p: JSON.stringify(payloadGeishaFelipe), c: catadoresMap['catador.felipe@qgrader.com'], e: evalFisicaMap['ANALISIS-FIS-2026-001'] } }
    );
    await sequelize.query(`UPDATE calidad.hojas_catacion_cva SET firma_digital_catador = 'SHA256_FIRMA_FELIPE_RESTREPO' WHERE id = :id`, { replacements: { id: h2Res[0].id } });

    // --- SESIÓN 2: Microlote Borbón Rosado (Panel de 2 Catadores: Ana y Diana) ---
    const payloadBorbonAna = {
      evaluacion: {
        codigo: 'SES-2026-B02',
        titulo: 'Sesión Oficial Mesa de Cata: Borbón Rosado Lavado Morales',
        objetivo: 'Certificación de perfil de taza para comprador de Berlín',
        total_muestras: 1,
        conclusion_catador: 'Notas a frutos rojos frescos, frambuesa, panela y acidez tartárica equilibrada.',
        puntuacion_catador: 85.50,
        fases: {
          fase_1_descriptiva: {
            nivel_tueste: { valor: 64.00, nombre: 'Medio Claro', termino_ingles: 'Medium Light' },
            fragancia: { intensidad: 12.00, categoria_intensidad: 'Intenso', escala_maxima: 15 },
            aroma: { intensidad: 12.50, categoria_intensidad: 'Intenso', escala_maxima: 15 },
            descriptores: ['Frutos Rojos', 'Frambuesa', 'Panela']
          },
          fase_2_afectiva: {
            fragancia: { calidad_agrado: 8.5, escala_maxima: 9 },
            aroma: { calidad_agrado: 8.5, escala_maxima: 9 }
          },
          fase_3_sabor_descriptiva: {
            sabor: { intensidad: 12.50, categoria_intensidad: 'Medio-Alto', escala_maxima: 15 },
            sabor_residual_aftertaste: { intensidad: 11.50, categoria_intensidad: 'Medio', escala_maxima: 15 },
            gustos_predominantes: ['Dulce', 'Cítrico'],
            descriptores_sabor: ['Frambuesa', 'Cereza dulce', 'Panela']
          },
          fase_4_sabor_afectiva: {
            sabor: { calidad_agrado: 8.5, escala_maxima: 9 },
            sabor_residual: { calidad_agrado: 8.4, escala_maxima: 9 }
          },
          fase_5_acidez: {
            intensidad: { valor: 11.50, categoria_intensidad: 'Media Tartárica', escala_maxima: 15 },
            calidad_agrado: { valor: 8.5, escala_maxima: 9 },
            tipo_acidez_nota: 'Tartárica agradable tipo uva y frambuesa'
          },
          fase_6_dulzor: {
            intensidad: { valor: 12.50, categoria_intensidad: 'Muy Dulce', escala_maxima: 15 },
            calidad_agrado: { valor: 8.6, escala_maxima: 9 },
            tipo_dulzor_nota: 'Panela y caña madura'
          },
          fase_7_sensacion_boca: {
            intensidad: { valor: 11.50, categoria_intensidad: 'Medio Jugoso', escala_maxima: 15 },
            textura_cualidad: ['Jugoso'],
            calidad_agrado: { valor: 8.4, escala_maxima: 9 },
            nota: 'Sensación fresca y jugosa'
          },
          fase_8_impresion_global: {
            calidad_agrado_global: { valor: 8.5, escala_maxima: 9 },
            nota_balance: 'Buen balance y taza limpia'
          },
          defectos_y_uniformidad: {
            tazas_no_uniformes: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tazas_defectuosas: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tipo_defecto: 'NINGUNO'
          }
        }
      }
    };

    const payloadBorbonDiana = {
      evaluacion: {
        codigo: 'SES-2026-B02',
        total_muestras: 1,
        conclusion_catador: 'Taza uniforme, excelente dulzor y acidez cítrica brillante.',
        puntuacion_catador: 85.00,
        fases: {
          fase_1_descriptiva: {
            nivel_tueste: { valor: 64.00, nombre: 'Medio Claro', termino_ingles: 'Medium Light' },
            fragancia: { intensidad: 12.00, categoria_intensidad: 'Intenso', escala_maxima: 15 },
            aroma: { intensidad: 12.00, categoria_intensidad: 'Intenso', escala_maxima: 15 },
            descriptores: ['Frutos Rojos', 'Miel']
          },
          fase_2_afectiva: {
            fragancia: { calidad_agrado: 8.4, escala_maxima: 9 },
            aroma: { calidad_agrado: 8.4, escala_maxima: 9 }
          },
          fase_3_sabor_descriptiva: {
            sabor: { intensidad: 12.00, categoria_intensidad: 'Medio', escala_maxima: 15 },
            sabor_residual_aftertaste: { intensidad: 11.00, categoria_intensidad: 'Medio', escala_maxima: 15 },
            gustos_predominantes: ['Dulce'],
            descriptores_sabor: ['Fresa', 'Panela']
          },
          fase_4_sabor_afectiva: {
            sabor: { calidad_agrado: 8.4, escala_maxima: 9 },
            sabor_residual: { calidad_agrado: 8.3, escala_maxima: 9 }
          },
          fase_5_acidez: {
            intensidad: { valor: 11.00, categoria_intensidad: 'Media', escala_maxima: 15 },
            calidad_agrado: { valor: 8.4, escala_maxima: 9 },
            tipo_acidez_nota: 'Cítrica equilibrada'
          },
          fase_6_dulzor: {
            intensidad: { valor: 12.50, categoria_intensidad: 'Dulce', escala_maxima: 15 },
            calidad_agrado: { valor: 8.5, escala_maxima: 9 },
            tipo_dulzor_nota: 'Miel'
          },
          fase_7_sensacion_boca: {
            intensidad: { valor: 11.50, categoria_intensidad: 'Medio', escala_maxima: 15 },
            textura_cualidad: ['Suave'],
            calidad_agrado: { valor: 8.3, escala_maxima: 9 },
            nota: 'Cuerpo suave y agradable'
          },
          fase_8_impresion_global: {
            calidad_agrado_global: { valor: 8.4, escala_maxima: 9 },
            nota_balance: 'Armónico y consistente'
          },
          defectos_y_uniformidad: {
            tazas_no_uniformes: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tazas_defectuosas: { cantidad: 0, total_tazas: 5, tazas_seleccionadas: [] },
            tipo_defecto: 'NINGUNO'
          }
        }
      }
    };

    await sequelize.query(
      `SELECT calidad.fn_guardar_evaluacion_cva_desde_json(:p::jsonb, :c::uuid, :e::uuid, 85.50)`,
      { replacements: { p: JSON.stringify(payloadBorbonAna), c: catadoresMap['catador.ana@qgrader.com'], e: evalFisicaMap['ANALISIS-FIS-2026-002'] } }
    );
    await sequelize.query(
      `SELECT calidad.fn_guardar_evaluacion_cva_desde_json(:p::jsonb, :c::uuid, :e::uuid, 85.00)`,
      { replacements: { p: JSON.stringify(payloadBorbonDiana), c: catadoresMap['catador.diana@tecnicafe.com'], e: evalFisicaMap['ANALISIS-FIS-2026-002'] } }
    );

    // --- SESIÓN 3: Lote Castillo Estándar (No conforme exportación, SCA < 80) ---
    const payloadCastilloRechazado = {
      evaluacion: {
        codigo: 'SES-2026-C03',
        titulo: 'Sesión Control de Calidad: Lote Castillo El Tambo',
        objetivo: 'Verificación de estándar de exportación',
        total_muestras: 1,
        conclusion_catador: 'Taza con defecto suave por sobrefermentación parcial y presencia de 1 taza no uniforme. No alcanza el estándar especial.',
        puntuacion_catador: 77.50,
        fases: {
          fase_1_descriptiva: {
            nivel_tueste: { valor: 60.00, nombre: 'Medio', termino_ingles: 'Medium' },
            fragancia: { intensidad: 9.00, categoria_intensidad: 'Bajo', escala_maxima: 15 },
            aroma: { intensidad: 9.50, categoria_intensidad: 'Bajo', escala_maxima: 15 },
            descriptores: ['Madera seca', 'Cereal tostado']
          },
          fase_2_afectiva: {
            fragancia: { calidad_agrado: 6.5, escala_maxima: 9 },
            aroma: { calidad_agrado: 6.6, escala_maxima: 9 }
          },
          fase_3_sabor_descriptiva: {
            sabor: { intensidad: 9.00, categoria_intensidad: 'Bajo-Medio', escala_maxima: 15 },
            sabor_residual_aftertaste: { intensidad: 8.50, categoria_intensidad: 'Corto', escala_maxima: 15 },
            gustos_predominantes: ['Amargo'],
            descriptores_sabor: ['Cereal', 'Amargo áspero']
          },
          fase_4_sabor_afectiva: {
            sabor: { calidad_agrado: 6.4, escala_maxima: 9 },
            sabor_residual: { calidad_agrado: 6.2, escala_maxima: 9 }
          },
          fase_5_acidez: {
            intensidad: { valor: 8.00, categoria_intensidad: 'Baja Áspera', escala_maxima: 15 },
            calidad_agrado: { valor: 6.0, escala_maxima: 9 },
            tipo_acidez_nota: 'Acidez baja y astringente'
          },
          fase_6_dulzor: {
            intensidad: { valor: 9.00, categoria_intensidad: 'Bajo', escala_maxima: 15 },
            calidad_agrado: { valor: 6.3, escala_maxima: 9 },
            tipo_dulzor_nota: 'Dulzor plano'
          },
          fase_7_sensacion_boca: {
            intensidad: { valor: 9.50, categoria_intensidad: 'Áspero Seco', escala_maxima: 15 },
            textura_cualidad: ['Áspero', 'Seco'],
            calidad_agrado: { valor: 6.0, escala_maxima: 9 },
            nota: 'Final seco en paladar'
          },
          fase_8_impresion_global: {
            calidad_agrado_global: { valor: 6.2, escala_maxima: 9 },
            nota_balance: 'Desbalanceado por defecto'
          },
          defectos_y_uniformidad: {
            tazas_no_uniformes: { cantidad: 1, total_tazas: 5, tazas_seleccionadas: [3] },
            tazas_defectuosas: { cantidad: 1, total_tazas: 5, tazas_seleccionadas: [3] },
            tipo_defecto: 'FERMENTO_LIGERO'
          }
        }
      }
    };

    await sequelize.query(
      `SELECT calidad.fn_guardar_evaluacion_cva_desde_json(:p::jsonb, :c::uuid, :e::uuid, 77.50)`,
      { replacements: { p: JSON.stringify(payloadCastilloRechazado), c: catadoresMap['catador.felipe@qgrader.com'], e: evalFisicaMap['ANALISIS-FIS-2026-003'] } }
    );

    // Consolidado IA Gemini
    await sequelize.query(
      `INSERT INTO calidad.consolidados_sensoriales_ia 
        (preoferta_id, puntaje_sca_promedio, numero_cataciones_consolidadas, narrativa_comercial_es, narrativa_comercial_en, perfil_taza_resumen, tokens_usados)
       VALUES 
        (:preoferta_id, 88.75, 1, 
         'Geisha Natural cultivado a 1.850 msnm en Piendamó. Presenta un perfil extraordinario con aromas florales de jazmín y notas jugosas de melocotón y miel de azahar.', 
         'Specialty Natural Geisha grown at 1,850 masl in Piendamó, Cauca. Boasts intense jasmine florals, juicy peach notes, and a silky honey aftertaste.', 
         'Floral Intenso, Melocotón, Miel, Acidez Málica', 450)
       ON CONFLICT DO NOTHING`,
      { replacements: { preoferta_id: preoferta1Id } }
    );
    console.log('  ✓ Ingesta CVA relacional completada (Puntaje SCA: 88.75 pts, promedio recalculado por trigger, exportación JSON disponible).');

    // ========================================================
    // 8. LOGÍSTICA (Contenedor, Precintos Doble QR y Sacos)
    // ========================================================
    console.log('\n📦 [8/10] Creando contenedor virtual, precintos con doble QR y sacos sellados...');

    // Contenedores Virtuales
    const [contRes] = await sequelize.query(
      `INSERT INTO logistica.contenedores_virtuales 
        (codigo_contenedor, empresa_exportadora_id, broker_destino_id, pais_destino, puerto_embarque_colombia, puerto_destino, capacidad_total_kg, kilos_reservados, estado, fecha_cierre_reservas, fecha_estimada_zarpe)
       VALUES 
        ('CONT-USA-2026-01', :empresa_id, :broker_id, 'Estados Unidos', 'Buenaventura', 'Miami', 20000.00, 2500.00, 'ABIERTO_RECOLECCION', CURRENT_DATE + 30, CURRENT_DATE + 45)
       ON CONFLICT (codigo_contenedor) DO UPDATE SET kilos_reservados = EXCLUDED.kilos_reservados
       RETURNING id`,
      { replacements: { empresa_id: empresaId, broker_id: brokerId } }
    );
    const contenedorId = contRes[0].id;

    // Inventario de Precintos Doble QR asignados en maletín al Asistente Técnico
    const precintosCodigos = ['PRE-SUNCH-001', 'PRE-SUNCH-002', 'PRE-SUNCH-003', 'PRE-SUNCH-004', 'PRE-SUNCH-005'];
    const precintosMap = {};

    for (const cod of precintosCodigos) {
      const [prec] = await sequelize.query(
        `INSERT INTO logistica.inventario_precintos_qr 
          (empresa_id, asistente_tecnico_id, codigo_lote_fabricacion, codigo_suncho_precinto, url_publica_trazabilidad, estado, fecha_entrega_tecnico)
         VALUES 
          (:empresa_id, :tecnico_id, 'LOTE-SUNCHOS-2026-01', :cod, 'https://conexcoffee.com/trazabilidad/' || :cod, 'EN_CUSTODIA_TECNICO', CURRENT_TIMESTAMP)
         ON CONFLICT (codigo_suncho_precinto) DO UPDATE SET estado = EXCLUDED.estado
         RETURNING id, codigo_suncho_precinto, token_qr_externo, token_qr_interno`,
        { replacements: { empresa_id: empresaId, tecnico_id: tecnicoId, cod } }
      );
      precintosMap[cod] = prec[0];
    }

    // Vincular 3 sacos de 70 kg a la preoferta y contenedor (esto activa el trigger de vinculación trg_validar_y_vincular_precinto)
    const sacosCreados = [];
    for (let i = 1; i <= 3; i++) {
      const codPrec = `PRE-SUNCH-00${i}`;
      const precinto = precintosMap[codPrec];

      const [saco] = await sequelize.query(
        `INSERT INTO logistica.sacos_cafe 
          (preoferta_id, precinto_id, asistente_tecnico_vinculo_id, numero_saco_consecutivo, peso_neto_kg, contenedor_id, estado_saco)
         VALUES 
          (:preoferta_id, :precinto_id, :tecnico_id, :num, 70.00, :contenedor_id, 'SELLADO_EN_FINCA')
         ON CONFLICT (preoferta_id, numero_saco_consecutivo) DO UPDATE SET peso_neto_kg = EXCLUDED.peso_neto_kg
         RETURNING id, numero_saco_consecutivo`,
        {
          replacements: {
            preoferta_id: preoferta1Id,
            precinto_id: precinto.id,
            tecnico_id: tecnicoId,
            num: i,
            contenedor_id: contenedorId
          }
        }
      );
      sacosCreados.push({ id: saco[0].id, precinto });
    }

    // Registrar escaneo de trazabilidad de prueba
    if (sacosCreados.length > 0) {
      await sequelize.query(
        `INSERT INTO logistica.trazabilidad_escaneos 
          (saco_id, tipo_qr, rol_detectado, direccion_ip, latitud, longitud, es_escaneo_valido, observaciones)
         VALUES 
          (:saco_id, 'QR_EXTERNO', 'PUBLICO_EXTERNO', '186.84.90.12', 2.641250, -76.531240, true, 'Escaneo inicial en finca de origen')`,
        { replacements: { saco_id: sacosCreados[0].id } }
      );
    }
    console.log('  ✓ Contenedor CONT-USA-2026-01, precintos doble QR y 3 sacos sellados en finca.');

    // ========================================================
    // 9. FINANZAS (Pedidos 30/70 y Transacciones)
    // ========================================================
    console.log('\n💵 [9/10] Registrando pedidos internacionales (30% anticipo / 70% saldo)...');

    const [pedidoRes] = await sequelize.query(
      `INSERT INTO finanzas.pedidos_internacionales 
        (codigo_pedido, comprador_id, contenedor_id, preoferta_id, formato, cantidad_unidades, total_kilos, precio_por_kilo_usd, monto_total_usd, porcentaje_anticipo, monto_anticipo_usd, porcentaje_saldo, monto_saldo_usd, estado)
       VALUES 
        ('PED-2026-0089', :comprador_id, :contenedor_id, :preoferta_id, 'SACO_70KG', 30, 2100.00, 14.50, 30450.00, 30.00, 9135.00, 70.00, 21315.00, 'ANTICIPO_PAGADO_RESERVADO')
       ON CONFLICT (codigo_pedido) DO UPDATE SET estado = EXCLUDED.estado
       RETURNING id`,
      {
        replacements: {
          comprador_id: compradorId,
          contenedor_id: contenedorId,
          preoferta_id: preoferta1Id
        }
      }
    );
    const pedidoId = pedidoRes[0].id;

    // Transacción de pago del anticipo del 30%
    await sequelize.query(
      `INSERT INTO finanzas.transacciones_pagos 
        (pedido_id, tipo_etapa_pago, pasarela_nombre, identificador_transaccion_externo, monto_usd, tasa_cambio_aplicada_cop, monto_equivalente_cop, estado_pago)
       VALUES 
        (:pedido_id, 'ANTICIPO_RESERVA', 'Stripe Payments', 'ch_stripe_mock_anticipo_9135_usd', 9135.00, 4250.00, 38823750.00, 'EXITOSO')
       ON CONFLICT (identificador_transaccion_externo) DO NOTHING`,
      { replacements: { pedido_id: pedidoId } }
    );
    console.log('  ✓ Pedido internacional PED-2026-0089 con anticipo 30% ($9,135 USD) pagado.');

    // ========================================================
    // 10. AUDITORÍA Y ALERTAS DE SEGURIDAD
    // ========================================================
    console.log('\n🛡️ [10/10] Registrando alertas de seguridad y trazabilidad...');

    await sequelize.query(
      `INSERT INTO auditoria.alertas_seguridad 
        (codigo_error, tipo_alerta, severidad, descripcion, direccion_ip, resuelta, resolucion_nota)
       VALUES 
        ('CC-0E15', 'INTENTO_QR_NO_RECONOCIDO', 'MEDIA', 'Intento de escaneo de QR con token de prueba expirado', '192.168.1.10', true, 'Resuelto: Prueba de validación de escaneo en laboratorio exitosa')`
    );
    console.log('  ✓ Registro de auditoría y alertas registrado.');

    console.log('\n====================================================');
    console.log('🎉 BASE DE DATOS POBLADA EXITOSAMENTE!');
    console.log('====================================================');
    console.log('\n🔑 CREDENCIALES DE PRUEBA:');
    console.log('----------------------------------------------------');
    console.log(`Contraseña universal para todas las cuentas: ${SEED_PASSWORD}\n`);
    usuariosData.forEach(u => {
      console.log(`• Rol: ${u.rol.padEnd(25)} | Email: ${u.email}`);
    });
    console.log('----------------------------------------------------');
    console.log('\n🏷️ CÓDIGOS Y TOKENS CLAVE PARA PRUEBAS:');
    console.log(`• Preoferta 1 (Geisha):       PRE-2026-0001 (ID: ${preoferta1Id})`);
    console.log(`• Evaluación CVA:             EVAL-CVA-2026-001 (SCA: 88.75 pts)`);
    console.log(`• Contenedor Marítimo:        CONT-USA-2026-01 (Miami)`);
    console.log(`• Pedido Internacional USD:   PED-2026-0089 (Anticipo 30% pagado)`);
    if (sacosCreados.length > 0) {
      console.log(`• Token QR Externo Saco 1:    ${sacosCreados[0].precinto.token_qr_externo}`);
      console.log(`• Token QR Interno Saco 1:    ${sacosCreados[0].precinto.token_qr_interno}`);
    }
    console.log('====================================================\n');

  } catch (error) {
    console.error('\n❌ Error al poblar la base de datos:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedDatabase();
