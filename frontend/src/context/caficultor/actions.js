import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapFinca, mapLote, mapPreoferta } from '../mappers';

export function createCaficultorActions(state, setters) {
  const { fincas, lotes, variedades, caficultores } = state;
  const { setFincas, setLotes, setPreofertas, setOfertas } = setters;

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

  const createLote = async (payload) => {
    try {
      const { data } = await axiosClient.post('/lotes-cultivo', payload);
      const mapped = mapLote({ ...payload, ...data }, { fincas, variedades });
      setLotes((prev) => [mapped, ...prev]);
      toast.success('Lote de cultivo registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateLote = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/lotes-cultivo/${id}`, payload);
      setLotes((prev) =>
        prev.map((l) => (l.id === id ? mapLote({ ...l, ...payload, ...data }, { fincas, variedades }) : l))
      );
      toast.success('Lote de cultivo actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createPreoferta = async (payload) => {
    try {
      const { data } = await axiosClient.post('/preofertas', payload);
      const mapped = mapPreoferta({ ...payload, ...data }, { caficultores, fincas, lotes, variedades });
      setPreofertas((prev) => [{ ...mapped, estado: mapped.estadoCaficultor }, ...prev]);
      setOfertas((prev) => [{ ...mapped, estado: mapped.estadoOferta }, ...prev]);
      toast.success('Preoferta creada correctamente');
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

  const createOferta = async (payload) => createPreoferta(payload);
  const updateOferta = async (id, payload) => updatePreoferta(id, payload);

  return { createFinca, updateFinca, createLote, updateLote, createPreoferta, updatePreoferta, createOferta, updateOferta };
}
