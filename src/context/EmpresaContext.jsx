import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../lib/axios';
import {
  mapCaficultor,
  mapFinca,
  mapLote,
  mapPreoferta,
  mapTecnico,
  mapLaboratorio,
  mapBroker,
  mapMuestraYAnalisisFisico,
  mapContenedor,
} from './mappers';

export const EmpresaContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const EmpresaProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [brokers, setBrokers] = useState([]);
  const [caficultores, setCaficultores] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [muestras, setMuestras] = useState([]);
  const [preofertas, setPreofertas] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [ofertasLibres, setOfertasLibres] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [variedades, setVariedades] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawUsuarios,
        rawCaficultores,
        rawEmpresas,
        rawTecnicos,
        rawLaboratorios,
        rawBrokers,
        rawFincas,
        rawVariedades,
        rawLotes,
        rawPreofertas,
        rawEvaluacionesFisicas,
        rawSesionesCatacion,
        rawContenedores,
        rawPedidos,
        rawInspecciones,
      ] = await Promise.all([
        safeGet('/usuarios-sistema'),
        safeGet('/caficultores'),
        safeGet('/empresas-exportadoras'),
        safeGet('/asistentes-tecnicos'),
        safeGet('/laboratorios'),
        safeGet('/brokers'),
        safeGet('/fincas'),
        safeGet('/variedades-cafe'),
        safeGet('/lotes-cultivo'),
        safeGet('/preofertas'),
        safeGet('/evaluaciones-fisicas'),
        safeGet('/sesiones-catacion'),
        safeGet('/contenedores-virtuales'),
        safeGet('/pedidos-internacionales'),
        safeGet('/inspecciones-campo'),
      ]);

      const mappedFincas = rawFincas.map((f) =>
        mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
      );
      const mappedLotes = rawLotes.map((l) =>
        mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
      );
      const mappedCaficultores = rawCaficultores.map((c) =>
        mapCaficultor(c, { fincas: rawFincas, empresas: rawEmpresas, usuarios: rawUsuarios })
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
      const mappedBrokers = rawBrokers.map((b) =>
        mapBroker(b, { pedidos: rawPedidos, usuarios: rawUsuarios })
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
          estado: mapped.estadoEmpresa,
        };
      });
      const mappedOfertas = mappedPreofertas.map((p) => ({
        ...p,
        estado: p.estadoOferta,
      }));
      const mappedOfertasLibres = mappedPreofertas.map((p) => ({
        ...p,
        estado: p.estadoLibre,
      }));
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

      setFincas(mappedFincas);
      setLotes(mappedLotes);
      setVariedades(rawVariedades);
      setCaficultores(mappedCaficultores);
      setTecnicos(mappedTecnicos);
      setLaboratorios(mappedLaboratorios);
      setBrokers(mappedBrokers);
      setPreofertas(mappedPreofertas);
      setOfertas(mappedOfertas);
      setOfertasLibres(mappedOfertasLibres);
      setMuestras(mappedMuestras);
      setContenedores(mappedContenedores);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── BROKERS ────────────────────────────────────────────────────────────────
  const createBroker = async (payload) => {
    try {
      const { data } = await axiosClient.post('/brokers', payload);
      const mapped = mapBroker({ ...payload, ...data });
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
      setBrokers((prev) => prev.map((b) => (b.id === id ? mapBroker({ ...b, ...payload, ...data }) : b)));
      toast.success('Broker actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── CAFICULTORES ───────────────────────────────────────────────────────────
  const createCaficultor = async (payload) => {
    try {
      const { data } = await axiosClient.post('/caficultores', payload);
      const mapped = mapCaficultor({ ...payload, ...data }, { fincas });
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
        prev.map((c) => (c.id === id ? mapCaficultor({ ...c, ...payload, ...data }, { fincas }) : c))
      );
      toast.success('Caficultor actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── CONTENEDORES ───────────────────────────────────────────────────────────
  const createContenedor = async (payload) => {
    try {
      const { data } = await axiosClient.post('/contenedores-virtuales', payload);
      const mapped = mapContenedor({ ...payload, ...data }, { preofertas, fincas, lotes, variedades, caficultores });
      setContenedores((prev) => [mapped, ...prev]);
      toast.success('Contenedor creado correctamente');
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

  // ── LABORATORIOS ───────────────────────────────────────────────────────────
  const createLaboratorio = async (payload) => {
    try {
      const { data } = await axiosClient.post('/laboratorios', payload);
      const mapped = mapLaboratorio({ ...payload, ...data });
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
        prev.map((l) => (l.id === id ? mapLaboratorio({ ...l, ...payload, ...data }) : l))
      );
      toast.success('Laboratorio actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── MUESTRAS ───────────────────────────────────────────────────────────────
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

  const updateMuestra = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/evaluaciones-fisicas/${id}`, payload);
      setMuestras((prev) =>
        prev.map((m) =>
          m.id === id
            ? mapMuestraYAnalisisFisico(
                { ...m, ...payload, ...data },
                { preofertas, caficultores, fincas, lotes, variedades, laboratorios }
              )
            : m
        )
      );
      toast.success('Muestra actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── PREOFERTAS & OFERTAS ───────────────────────────────────────────────────
  const createPreoferta = async (payload) => {
    try {
      const { data } = await axiosClient.post('/preofertas', payload);
      const mapped = mapPreoferta({ ...payload, ...data }, { caficultores, fincas, lotes, variedades });
      setPreofertas((prev) => [{ ...mapped, estado: mapped.estadoEmpresa }, ...prev]);
      setOfertas((prev) => [{ ...mapped, estado: mapped.estadoOferta }, ...prev]);
      setOfertasLibres((prev) => [{ ...mapped, estado: mapped.estadoLibre }, ...prev]);
      toast.success('Preoferta registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updatePreoferta = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/preofertas/${id}`, payload);
      setPreofertas((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...mapPreoferta({ ...p, ...payload, ...data }, { caficultores, fincas, lotes, variedades }),
                ...payload,
              }
            : p
        )
      );
      toast.success('Preoferta actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createOferta = async (payload) => {
    return createPreoferta(payload);
  };

  const updateOferta = async (id, payload) => {
    await updatePreoferta(id, payload);
    setOfertas((prev) => prev.map((o) => (o.id === id ? { ...o, ...payload } : o)));
  };

  const updateOfertaLibre = async (id, payload) => {
    await updatePreoferta(id, payload);
    setOfertasLibres((prev) => prev.map((o) => (o.id === id ? { ...o, ...payload } : o)));
  };

  // ── TECNICOS ───────────────────────────────────────────────────────────────
  const createTecnico = async (payload) => {
    try {
      const { data } = await axiosClient.post('/asistentes-tecnicos', payload);
      const mapped = mapTecnico({ ...payload, ...data });
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
      setTecnicos((prev) => prev.map((t) => (t.id === id ? mapTecnico({ ...t, ...payload, ...data }) : t)));
      toast.success('Técnico actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── DASHBOARD KPIs & ACTIVIDAD ─────────────────────────────────────────────
  const totalVolumenKg = preofertas.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);
  const kpis = [
    {
      id: 'kpi-caficultores',
      titulo: 'Caficultores Vinculados',
      valor: String(caficultores.length),
      iconoNombre: 'Leaf',
      label: 'Caficultores Vinculados',
      value: String(caficultores.length),
      change: `${fincas.length} fincas activas`,
      iconName: 'Users',
    },
    {
      id: 'kpi-ofertas',
      titulo: 'Ofertas Publicadas',
      valor: String(ofertas.length),
      iconoNombre: 'Gift',
      label: 'Ofertas Publicadas',
      value: String(ofertas.length),
      change: `${brokers.length} brokers aliados`,
      iconName: 'TrendingUp',
    },
    {
      id: 'kpi-contenedores',
      titulo: 'Contenedores en Despacho',
      valor: String(contenedores.length),
      iconoNombre: 'Package',
      label: 'Contenedores en Despacho',
      value: String(contenedores.length),
      change: `${muestras.length} muestras certificadas`,
      iconName: 'Truck',
    },
    {
      id: 'kpi-muestras',
      titulo: 'Muestras Registradas',
      valor: String(muestras.length),
      iconoNombre: 'Archive',
      label: 'Volumen Acopiado',
      value: `${(totalVolumenKg / 1000).toFixed(1)} Ton`,
      change: `${preofertas.length} lotes registrados`,
      iconName: 'Boxes',
    },
  ];

  const actividad = [
    ...preofertas.slice(0, 3).map((p, idx) => ({
      id: p.id || `act-pre-${idx}`,
      titulo: `Preoferta ${p.codigo} registrada por ${p.caficultor} (${p.variedad} - ${p.cantidad} Kg)`,
      tiempo: p.fechaRegistro || 'Reciente',
      estado: 'completado',
      lote: p.codigo,
      productor: p.caficultor,
      variedad: p.variedad,
      peso: `${p.cantidad} Kg`,
      fecha: p.fechaRegistro,
    })),
    ...muestras.slice(0, 2).map((m, idx) => ({
      id: m.id || `act-mue-${idx}`,
      titulo: `Muestra física ${m.codigo} asignada a laboratorio (${m.variedad})`,
      tiempo: m.fecha || 'Reciente',
      estado: 'pendiente',
      lote: m.codigo,
      productor: m.caficultor,
      variedad: m.variedad,
      peso: m.peso,
      fecha: m.fecha,
    })),
  ];

  return (
    <EmpresaContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        kpis,
        actividad,
        brokers,
        caficultores,
        contenedores,
        laboratorios,
        muestras,
        preofertas,
        ofertas,
        ofertasLibres,
        tecnicos,
        createBroker,
        updateBroker,
        createCaficultor,
        updateCaficultor,
        createContenedor,
        updateContenedor,
        createLaboratorio,
        updateLaboratorio,
        createMuestra,
        updateMuestra,
        createPreoferta,
        updatePreoferta,
        createOferta,
        updateOferta,
        updateOfertaLibre,
        createTecnico,
        updateTecnico,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
};
