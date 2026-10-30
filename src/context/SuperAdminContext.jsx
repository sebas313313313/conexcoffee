import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Sprout,
  PackageCheck,
  TrendingUp,
  ShieldAlert,
  Building2,
  FlaskConical,
  Briefcase,
} from 'lucide-react';
import { axiosClient, getErrorMessage } from '../lib/axios';
import {
  mapUsuario,
  mapCaficultor,
  mapFinca,
  mapLote,
  mapPreoferta,
  mapEmpresa,
  mapTecnico,
  mapLaboratorio,
  mapCatador,
  mapBroker,
  mapComprador,
  mapMuestraYAnalisisFisico,
  mapContenedor,
  mapPedido,
} from './mappers';

export const SuperAdminContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const SuperAdminProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [caficultores, setCaficultores] = useState([]);
  const [catadores, setCatadores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [preofertas, setPreofertas] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [muestras, setMuestras] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [configuracion, setConfiguracion] = useState({
    nombrePlataforma: 'ConexCoffee Global',
    correoSoporte: 'soporte@conexcoffee.com',
    telefonoSoporte: '+57 310 555 0199',
    monedaBase: 'USD',
    tasaCambioCop: 4200,
    puntajeScaMinimo: 84.0,
    humedadMaximaPermitida: 12.0,
    notificacionesEmail: true,
    dobleFactorObligatorio: false,
    mantenimientoActivo: false,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawUsuarios,
        rawCaficultores,
        rawCatadores,
        rawEmpresas,
        rawTecnicos,
        rawLaboratorios,
        rawBrokers,
        rawCompradores,
        rawFincas,
        rawVariedades,
        rawLotes,
        rawPreofertas,
        rawEvaluacionesFisicas,
        rawSesionesCatacion,
        rawContenedores,
        rawPedidos,
        rawInspecciones,
        rawAlertas,
      ] = await Promise.all([
        safeGet('/usuarios-sistema'),
        safeGet('/caficultores'),
        safeGet('/catadores'),
        safeGet('/empresas-exportadoras'),
        safeGet('/asistentes-tecnicos'),
        safeGet('/laboratorios'),
        safeGet('/brokers'),
        safeGet('/compradores-internacionales'),
        safeGet('/fincas'),
        safeGet('/variedades-cafe'),
        safeGet('/lotes-cultivo'),
        safeGet('/preofertas'),
        safeGet('/evaluaciones-fisicas'),
        safeGet('/sesiones-catacion'),
        safeGet('/contenedores-virtuales'),
        safeGet('/pedidos-internacionales'),
        safeGet('/inspecciones-campo'),
        safeGet('/alertas-seguridad'),
      ]);

      const mappedUsuarios = rawUsuarios.map(mapUsuario);
      const mappedFincas = rawFincas.map((f) =>
        mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
      );
      const mappedLotes = rawLotes.map((l) =>
        mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
      );
      const mappedCaficultores = rawCaficultores.map((c) =>
        mapCaficultor(c, {
          fincas: rawFincas,
          empresas: rawEmpresas,
          usuarios: rawUsuarios,
        })
      );
      const mappedEmpresas = rawEmpresas.map((e) =>
        mapEmpresa(e, {
          caficultores: rawCaficultores,
          preofertas: rawPreofertas,
          usuarios: rawUsuarios,
        })
      );
      const mappedTecnicos = rawTecnicos.map((t) =>
        mapTecnico(t, { inspecciones: rawInspecciones, usuarios: rawUsuarios })
      );
      const mappedLaboratorios = rawLaboratorios.map((l) =>
        mapLaboratorio(l, {
          evaluacionesFisicas: rawEvaluacionesFisicas,
          sesionesCatacion: rawSesionesCatacion,
          usuarios: rawUsuarios,
        })
      );
      const mappedCatadores = rawCatadores.map((c) =>
        mapCatador(c, {
          laboratorios: rawLaboratorios,
          sesionesCatacion: rawSesionesCatacion,
          usuarios: rawUsuarios,
        })
      );
      const mappedBrokers = rawBrokers.map((b) =>
        mapBroker(b, { pedidos: rawPedidos, usuarios: rawUsuarios })
      );
      const mappedCompradores = rawCompradores.map((c) =>
        mapComprador(c, { pedidos: rawPedidos, usuarios: rawUsuarios })
      );
      const mappedPreofertas = rawPreofertas.map((p) => {
        const mapped = mapPreoferta(p, {
          caficultores: rawCaficultores,
          fincas: rawFincas,
          lotes: rawLotes,
          variedades: rawVariedades,
          sesiones: rawSesionesCatacion,
        });
        return {
          ...mapped,
          caficultorObj: mapped.caficultor,
          fincaObj: mapped.finca,
          caficultor: mapped.caficultor_nombre || 'Pedro Nel García',
          finca: mapped.finca_nombre || 'Finca La Esperanza',
          fechaRegistro: mapped.fecha_creacion || '2026-10-20',
        };
      });
      const mappedMuestras = rawEvaluacionesFisicas.map((ev) =>
        mapMuestraYAnalisisFisico(ev, {
          preofertas: rawPreofertas,
          caficultores: rawCaficultores,
          fincas: rawFincas,
          lotes: rawLotes,
          variedades: rawVariedades,
          laboratorios: rawLaboratorios,
          sesiones: rawSesionesCatacion,
        })
      );
      const mappedContenedores = rawContenedores.map((cnt) =>
        mapContenedor(cnt, {
          preofertas: rawPreofertas,
          fincas: rawFincas,
          lotes: rawLotes,
          variedades: rawVariedades,
          caficultores: rawCaficultores,
          sesiones: rawSesionesCatacion,
        })
      );
      const mappedCompras = rawPedidos.map((ped) =>
        mapPedido(ped, {
          contenedores: mappedContenedores,
          compradores: rawCompradores,
          brokers: rawBrokers,
        })
      );

      setUsuarios(mappedUsuarios);
      setCaficultores(mappedCaficultores);
      setCatadores(mappedCatadores);
      setEmpresas(mappedEmpresas);
      setTecnicos(mappedTecnicos);
      setLaboratorios(mappedLaboratorios);
      setBrokers(mappedBrokers);
      setCompradores(mappedCompradores);
      setFincas(mappedFincas);
      setVariedades(rawVariedades);
      setLotes(mappedLotes);
      setPreofertas(mappedPreofertas);
      setOfertas(mappedPreofertas);
      setMuestras(mappedMuestras);
      setContenedores(mappedContenedores);
      setCompras(mappedCompras);
      setAlertas(rawAlertas);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── USUARIOS CRUD ──────────────────────────────────────────────────────────
  const createUsuario = async (payload) => {
    try {
      const { data } = await axiosClient.post('/usuarios-sistema', payload);
      const mapped = mapUsuario({ ...payload, ...data });
      setUsuarios((prev) => [mapped, ...prev]);
      toast.success('Usuario registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateUsuario = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/usuarios-sistema/${id}`, payload);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? mapUsuario({ ...u, ...payload, ...data }) : u))
      );
      toast.success('Usuario actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const toggleEstadoUsuario = async (id) => {
    const target = usuarios.find((u) => u.id === id);
    if (!target) return;
    const nuevoActivo = target.estado !== 'Activo';
    try {
      await axiosClient.put(`/usuarios-sistema/${id}`, {
        esta_activo: nuevoActivo,
        estado: nuevoActivo ? 'Activo' : 'Inactivo',
      });
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                esta_activo: nuevoActivo,
                estado: nuevoActivo ? 'Activo' : 'Inactivo',
              }
            : u
        )
      );
      toast.success(`Usuario ${nuevoActivo ? 'activado' : 'inactivado'} correctamente`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── CAFICULTORES CRUD ──────────────────────────────────────────────────────
  const createCaficultor = async (payload) => {
    try {
      const { data } = await axiosClient.post('/caficultores', payload);
      const mapped = mapCaficultor({ ...payload, ...data }, { fincas, empresas, usuarios });
      setCaficultores((prev) => [mapped, ...prev]);
      toast.success('Caficultor registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateCaficultor = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/caficultores/${id}`, payload);
      setCaficultores((prev) =>
        prev.map((c) =>
          c.id === id ? mapCaficultor({ ...c, ...payload, ...data }, { fincas, empresas, usuarios }) : c
        )
      );
      toast.success('Caficultor actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const asignarEmpresaCaficultor = async (caficultorId, empresaNombre) => {
    setCaficultores((prev) =>
      prev.map((c) => (c.id === caficultorId ? { ...c, empresaAsignada: empresaNombre } : c))
    );
    toast.success(`Empresa ${empresaNombre} asignada al caficultor`);
  };

  // ── CATADORES CRUD ─────────────────────────────────────────────────────────
  const createCatador = async (payload) => {
    try {
      const { data } = await axiosClient.post('/catadores', payload);
      const mapped = mapCatador({ ...payload, ...data }, { laboratorios, usuarios });
      setCatadores((prev) => [mapped, ...prev]);
      toast.success('Catador registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateCatador = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/catadores/${id}`, payload);
      setCatadores((prev) =>
        prev.map((c) =>
          c.id === id ? mapCatador({ ...c, ...payload, ...data }, { laboratorios, usuarios }) : c
        )
      );
      toast.success('Catador actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── EMPRESAS CRUD ──────────────────────────────────────────────────────────
  const createEmpresa = async (payload) => {
    try {
      const { data } = await axiosClient.post('/empresas-exportadoras', payload);
      const mapped = mapEmpresa({ ...payload, ...data }, { caficultores, preofertas, usuarios });
      setEmpresas((prev) => [mapped, ...prev]);
      toast.success('Empresa exportadora registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateEmpresa = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/empresas-exportadoras/${id}`, payload);
      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === id ? mapEmpresa({ ...e, ...payload, ...data }, { caficultores, preofertas, usuarios }) : e
        )
      );
      toast.success('Empresa exportadora actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── TECNICOS CRUD ──────────────────────────────────────────────────────────
  const createTecnico = async (payload) => {
    try {
      const { data } = await axiosClient.post('/asistentes-tecnicos', payload);
      const mapped = mapTecnico({ ...payload, ...data }, { usuarios });
      setTecnicos((prev) => [mapped, ...prev]);
      toast.success('Técnico registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateTecnico = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/asistentes-tecnicos/${id}`, payload);
      setTecnicos((prev) =>
        prev.map((t) => (t.id === id ? mapTecnico({ ...t, ...payload, ...data }, { usuarios }) : t))
      );
      toast.success('Técnico actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── LABORATORIOS CRUD ──────────────────────────────────────────────────────
  const createLaboratorio = async (payload) => {
    try {
      const { data } = await axiosClient.post('/laboratorios', payload);
      const mapped = mapLaboratorio({ ...payload, ...data }, { usuarios });
      setLaboratorios((prev) => [mapped, ...prev]);
      toast.success('Laboratorio registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateLaboratorio = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/laboratorios/${id}`, payload);
      setLaboratorios((prev) =>
        prev.map((l) => (l.id === id ? mapLaboratorio({ ...l, ...payload, ...data }, { usuarios }) : l))
      );
      toast.success('Laboratorio actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── BROKERS CRUD ───────────────────────────────────────────────────────────
  const createBroker = async (payload) => {
    try {
      const { data } = await axiosClient.post('/brokers', payload);
      const mapped = mapBroker({ ...payload, ...data }, { pedidos: compras, usuarios });
      setBrokers((prev) => [mapped, ...prev]);
      toast.success('Broker registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateBroker = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/brokers/${id}`, payload);
      setBrokers((prev) =>
        prev.map((b) =>
          b.id === id ? mapBroker({ ...b, ...payload, ...data }, { pedidos: compras, usuarios }) : b
        )
      );
      toast.success('Broker actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── COMPRADORES CRUD ───────────────────────────────────────────────────────
  const createComprador = async (payload) => {
    try {
      const { data } = await axiosClient.post('/compradores-internacionales', payload);
      const mapped = mapComprador({ ...payload, ...data }, { pedidos: compras, usuarios });
      setCompradores((prev) => [mapped, ...prev]);
      toast.success('Comprador internacional registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateComprador = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/compradores-internacionales/${id}`, payload);
      setCompradores((prev) =>
        prev.map((c) =>
          c.id === id ? mapComprador({ ...c, ...payload, ...data }, { pedidos: compras, usuarios }) : c
        )
      );
      toast.success('Comprador internacional actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── FINCAS & LOTES CRUD ────────────────────────────────────────────────────
  const createFinca = async (payload) => {
    try {
      const { data } = await axiosClient.post('/fincas', payload);
      const mapped = mapFinca({ ...payload, ...data }, { caficultores, lotes });
      setFincas((prev) => [mapped, ...prev]);
      toast.success('Finca registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateFinca = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/fincas/${id}`, payload);
      setFincas((prev) =>
        prev.map((f) => (f.id === id ? mapFinca({ ...f, ...payload, ...data }, { caficultores, lotes }) : f))
      );
      toast.success('Finca actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createLote = async (fincaId, lotePayload) => {
    try {
      const { data } = await axiosClient.post('/lotes-cultivo', {
        ...lotePayload,
        finca_id: fincaId,
      });
      const mappedLote = mapLote({ ...lotePayload, ...data, finca_id: fincaId }, { fincas, variedades });
      setLotes((prev) => [mappedLote, ...prev]);
      setFincas((prev) =>
        prev.map((f) =>
          f.id === fincaId
            ? {
                ...f,
                lotesCount: (f.lotesCount || 0) + 1,
                lotes: [...(f.lotes || []), mappedLote],
              }
            : f
        )
      );
      toast.success('Lote agregado a la finca correctamente');
      return mappedLote;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── MUESTRAS CRUD ──────────────────────────────────────────────────────────
  const createMuestra = async (payload) => {
    try {
      const { data } = await axiosClient.post('/evaluaciones-fisicas', payload);
      const mapped = mapMuestraYAnalisisFisico(
        { ...payload, ...data },
        { preofertas, caficultores, fincas, lotes, variedades, laboratorios }
      );
      setMuestras((prev) => [mapped, ...prev]);
      toast.success('Muestra registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const asignarLaboratorioMuestra = async (muestraId, laboratorioNombre) => {
    try {
      const lab = laboratorios.find((l) => l.nombre === laboratorioNombre);
      await axiosClient.put(`/evaluaciones-fisicas/${muestraId}`, {
        laboratorio_id: lab?.id,
        analista_nombre: laboratorioNombre,
      });
      setMuestras((prev) =>
        prev.map((m) =>
          m.id === muestraId
            ? {
                ...m,
                laboratorio: laboratorioNombre,
                informacionTecnico: {
                  ...m.informacionTecnico,
                  laboratorio: laboratorioNombre,
                },
              }
            : m
        )
      );
      toast.success(`Laboratorio ${laboratorioNombre} asignado a la muestra`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── CONTENEDORES CRUD ──────────────────────────────────────────────────────
  const createContenedor = async (payload) => {
    try {
      const { data } = await axiosClient.post('/contenedores-virtuales', payload);
      const mapped = mapContenedor(
        { ...payload, ...data },
        { preofertas, fincas, lotes, variedades, caficultores }
      );
      setContenedores((prev) => [mapped, ...prev]);
      toast.success('Contenedor virtual creado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateContenedor = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/contenedores-virtuales/${id}`, payload);
      setContenedores((prev) =>
        prev.map((c) =>
          c.id === id
            ? mapContenedor({ ...c, ...payload, ...data }, { preofertas, fincas, lotes, variedades, caficultores })
            : c
        )
      );
      toast.success('Contenedor actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const toggleEstadoContenedor = async (id) => {
    const target = contenedores.find((c) => c.id === id);
    if (!target) return;
    const nuevoEstado = target.estado === 'Activo' ? 'Borrador' : 'Activo';
    await updateContenedor(id, { estado: nuevoEstado });
  };

  const asignarOfertaContenedor = async (contenedorId, ofertaObj) => {
    const target = contenedores.find((c) => c.id === contenedorId);
    if (!target) return;
    const pesoAdicional = Number(ofertaObj.pesoTotal || ofertaObj.peso_kg || ofertaObj.cantidad || 1200);
    const nuevaCapacidadUsada = (target.cantidad_cafe_kg || target.capacidadUsada || 0) + pesoAdicional;
    setContenedores((prev) =>
      prev.map((c) =>
        c.id === contenedorId
          ? {
              ...c,
              capacidadUsada: nuevaCapacidadUsada,
              cantidad_cafe_kg: nuevaCapacidadUsada,
              ofertasAsignadas: [...(c.ofertasAsignadas || c.ofertas_asignadas || []), ofertaObj],
              ofertas_asignadas: [...(c.ofertas_asignadas || c.ofertasAsignadas || []), ofertaObj],
            }
          : c
      )
    );
    toast.success('Oferta consolidada en el contenedor');
  };

  const updateConfiguracion = async (newConfig) => {
    setConfiguracion((prev) => ({ ...prev, ...newConfig }));
    toast.success('Configuración global guardada correctamente');
  };

  // ── DASHBOARD COMPUTED DATA ────────────────────────────────────────────────
  const stats = [
    {
      id: 'stat-usuarios',
      label: 'Usuarios del Sistema',
      value: String(usuarios.length),
      change: `${usuarios.filter((u) => u.estado === 'Activo').length} activos`,
      up: true,
      icon: Users,
      iconName: 'Users',
      bg: '#FFF5F2',
      color: '#AD2E01',
    },
    {
      id: 'stat-fincas',
      label: 'Fincas y Lotes',
      value: `${fincas.length} / ${lotes.length}`,
      change: `${caficultores.length} caficultores`,
      up: true,
      icon: Sprout,
      iconName: 'Sprout',
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      id: 'stat-contenedores',
      label: 'Contenedores Virtuales',
      value: String(contenedores.length),
      change: `${ofertas.length} ofertas`,
      up: true,
      icon: PackageCheck,
      iconName: 'PackageCheck',
      bg: '#FEF3C7',
      color: '#D97706',
    },
    {
      id: 'stat-pedidos',
      label: 'Pedidos Internacionales',
      value: String(compras.length),
      change: `${compradores.length} compradores`,
      up: true,
      icon: TrendingUp,
      iconName: 'TrendingUp',
      bg: '#EFF6FF',
      color: '#2563EB',
    },
  ];

  const metrics = [
    {
      label: 'Disponibilidad API REST',
      value: Math.max(usuarios.filter((u) => u.estado === 'Activo').length, 1),
      total: Math.max(usuarios.length, 1),
      val: '99.98%',
      pct: '99%',
      color: '#10B981',
    },
    {
      label: 'Cobertura de Trazabilidad FNC / SCA',
      value: Math.max(fincas.length, 1),
      total: Math.max(fincas.length, 1),
      val: '100%',
      pct: '100%',
      color: '#AD2E01',
    },
    {
      label: 'Capacidad Consolidada en Contenedores',
      value: Math.max(contenedores.length, 1),
      total: Math.max(contenedores.length + 2, 3),
      val: `${contenedores.length} activos`,
      pct: '82%',
      color: '#F59E0B',
    },
  ];

  const activity = [
    ...alertas.slice(0, 3).map((a, idx) => ({
      id: a.id || `alerta-${idx}`,
      status: a.severidad === 'ALTA' ? 'warning' : 'info',
      message: `${a.tipo_evento || 'Seguridad'}: ${a.descripcion || 'Evento auditado'}`,
      action: `${a.tipo_evento || 'Seguridad'}: ${a.descripcion || 'Evento auditado'}`,
      user: a.severidad || 'SISTEMA',
      time: a.fecha_evento ? String(a.fecha_evento).slice(0, 10) : 'Reciente',
    })),
    ...preofertas.slice(0, 3).map((p, idx) => ({
      id: p.id || `pre-${idx}`,
      status: 'success',
      message: `Preoferta ${p.codigo} (${p.variedad} - ${p.cantidad} Kg) — ${typeof p.caficultor === 'string' ? p.caficultor : p.caficultor_nombre || 'Caficultor'}`,
      action: `Preoferta ${p.codigo} (${p.variedad} - ${p.cantidad} Kg)`,
      user: typeof p.caficultor === 'string' ? p.caficultor : p.caficultor_nombre || 'Caficultor',
      time: p.fechaRegistro || p.fecha_creacion || 'Reciente',
    })),
  ];

  const modules = [
    {
      id: 'mod-usuarios',
      title: 'Gestión de Usuarios y Roles',
      name: 'Gestión de Usuarios y Roles',
      description: `${usuarios.length} cuentas activas con RBAC y cookies HttpOnly`,
      desc: `${usuarios.length} cuentas activas con RBAC y cookies HttpOnly`,
      path: '/superadmin/usuarios',
      icon: ShieldAlert,
      iconName: 'ShieldAlert',
      stats: [
        { label: 'Total', value: usuarios.length },
        { label: 'Activos', value: usuarios.filter((u) => u.estado === 'Activo').length },
      ],
    },
    {
      id: 'mod-empresas',
      title: 'Empresas Exportadoras',
      name: 'Empresas Exportadoras',
      description: `${empresas.length} exportadoras registradas ante DIAN/FNC`,
      desc: `${empresas.length} exportadoras registradas ante DIAN/FNC`,
      path: '/superadmin/empresas',
      icon: Building2,
      iconName: 'Building2',
      stats: [
        { label: 'Empresas', value: empresas.length },
        { label: 'Activas', value: empresas.filter((e) => e.estado === 'Activo').length },
      ],
    },
    {
      id: 'mod-fincas',
      title: 'Fincas y Lotes de Cultivo',
      name: 'Fincas y Lotes de Cultivo',
      description: `${fincas.length} unidades productivas georreferenciadas`,
      desc: `${fincas.length} unidades productivas georreferenciadas`,
      path: '/superadmin/fincas',
      icon: Sprout,
      iconName: 'Sprout',
      stats: [
        { label: 'Fincas', value: fincas.length },
        { label: 'Lotes', value: lotes.length },
      ],
    },
    {
      id: 'mod-contenedores',
      title: 'Contenedores y Exportación',
      name: 'Contenedores y Exportación',
      description: `${contenedores.length} contenedores virtuales consolidados`,
      desc: `${contenedores.length} contenedores virtuales consolidados`,
      path: '/superadmin/contenedores',
      icon: PackageCheck,
      iconName: 'PackageCheck',
      stats: [
        { label: 'Contenedores', value: contenedores.length },
        { label: 'Ofertas', value: ofertas.length },
      ],
    },
    {
      id: 'mod-laboratorios',
      title: 'Laboratorios y Catación',
      name: 'Laboratorios y Catación',
      description: `${laboratorios.length} laboratorios y ${catadores.length} catadores Q-Grader`,
      desc: `${laboratorios.length} laboratorios y ${catadores.length} catadores Q-Grader`,
      path: '/superadmin/laboratorios',
      icon: FlaskConical,
      iconName: 'FlaskConical',
      stats: [
        { label: 'Labs', value: laboratorios.length },
        { label: 'Muestras', value: muestras.length },
      ],
    },
    {
      id: 'mod-brokers',
      title: 'Brokers y Compradores',
      name: 'Brokers y Compradores',
      description: `${brokers.length} brokers y ${compradores.length} compradores globales`,
      desc: `${brokers.length} brokers y ${compradores.length} compradores globales`,
      path: '/superadmin/brokers',
      icon: Briefcase,
      iconName: 'Briefcase',
      stats: [
        { label: 'Brokers', value: brokers.length },
        { label: 'Pedidos', value: compras.length },
      ],
    },
  ];

  return (
    <SuperAdminContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        stats,
        metrics,
        activity,
        modules,
        usuarios,
        caficultores,
        catadores,
        empresas,
        tecnicos,
        laboratorios,
        brokers,
        compradores,
        fincas,
        variedades,
        lotes,
        preofertas,
        ofertas,
        muestras,
        contenedores,
        compras,
        configuracion,
        createUsuario,
        updateUsuario,
        toggleEstadoUsuario,
        createCaficultor,
        updateCaficultor,
        asignarEmpresaCaficultor,
        createCatador,
        updateCatador,
        createEmpresa,
        updateEmpresa,
        createTecnico,
        updateTecnico,
        createLaboratorio,
        updateLaboratorio,
        createBroker,
        updateBroker,
        createComprador,
        updateComprador,
        createFinca,
        updateFinca,
        createLote,
        createMuestra,
        asignarLaboratorioMuestra,
        createContenedor,
        updateContenedor,
        toggleEstadoContenedor,
        asignarOfertaContenedor,
        updateConfiguracion,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
