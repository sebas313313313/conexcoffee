import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapUsuario, mapCaficultor, mapFinca, mapLote, mapEmpresa, mapTecnico, mapLaboratorio, mapCatador, mapBroker, mapComprador, mapMuestraYAnalisisFisico, mapContenedor } from '../mappers';

export function createSuperAdminActions(state, setters) {
  const { usuarios, caficultores, empresas, laboratorios, fincas, variedades, lotes, preofertas, contenedores, compras } = state;
  const { setUsuarios, setCaficultores, setCatadores, setEmpresas, setTecnicos, setLaboratorios, setBrokers, setCompradores, setFincas, setLotes, setMuestras, setContenedores, setConfiguracion } = setters;

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

  return { createUsuario, updateUsuario, toggleEstadoUsuario, createCaficultor, updateCaficultor, asignarEmpresaCaficultor, createCatador, updateCatador, createEmpresa, updateEmpresa, createTecnico, updateTecnico, createLaboratorio, updateLaboratorio, createBroker, updateBroker, createComprador, updateComprador, createFinca, updateFinca, createLote, createMuestra, asignarLaboratorioMuestra, createContenedor, updateContenedor, toggleEstadoContenedor, asignarOfertaContenedor, updateConfiguracion };
}
