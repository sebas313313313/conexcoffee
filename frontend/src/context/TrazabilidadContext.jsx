import { useCallback, useState } from 'react';
import { axiosClient } from '@/lib/axios';
import { TrazabilidadContext } from './TrazabilidadContextValue';

export function TrazabilidadProvider({ children }) {
  const [ficha, setFicha] = useState(null);
  const [flujo, setFlujo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (token, rol) => {
    setLoading(true);
    setError(null);
    setFicha(null);
    setFlujo(null);
    try {
      let datosFlujo = null;
      if (rol === 'tecnico' || rol === 'laboratorio') {
        const response = await axiosClient.get(`/trazabilidad-escaneos/flujo/${token}`, { strictResponse: true });
        datosFlujo = response.data;
        setFlujo(datosFlujo);
      }
      if (!datosFlujo || datosFlujo.estado === 'VINCULADO_A_SACO') {
        const response = await axiosClient.get(`/trazabilidad-escaneos/ficha/${token}`, { strictResponse: true });
        setFicha(response.data);
      }
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }, []);

  return (
    <TrazabilidadContext.Provider value={{ ficha, flujo, loading, error, cargar }}>
      {children}
    </TrazabilidadContext.Provider>
  );
}
