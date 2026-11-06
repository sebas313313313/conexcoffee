import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapCaficultor, mapPreoferta, mapTecnico, mapLaboratorio, mapBroker, mapMuestraYAnalisisFisico, mapContenedor } from '../mappers';

export function createEmpresaActions(state, setters) {
  const { caficultores, laboratorios, preofertas, fincas, lotes, variedades } = state;
  const { setBrokers, setCaficultores, setContenedores, setLaboratorios, setMuestras, setPreofertas, setOfertas, setOfertasLibres, setTecnicos } = setters;

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

  return { createBroker, updateBroker, createCaficultor, updateCaficultor, createContenedor, updateContenedor, createLaboratorio, updateLaboratorio, createMuestra, updateMuestra, createPreoferta, updatePreoferta, createOferta, updateOferta, updateOfertaLibre, createTecnico, updateTecnico };
}
