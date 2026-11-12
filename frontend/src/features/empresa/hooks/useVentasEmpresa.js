import { useEffect, useState } from 'react';
import { useEmpresa } from '@/hooks/useEmpresa';
import useAuthStore from '@/store/useAuthStore';

export function useVentasEmpresa(incluirVariedades = false) {
  const { cargarVentasEmpresa } = useEmpresa();
  const empresaId = useAuthStore((state) => state.user?.empresa_id);
  const [resultado, setResultado] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!empresaId) return;
    const controller = new AbortController();
    cargarVentasEmpresa(empresaId, controller.signal, incluirVariedades)
      .then((contenedores) => {
        if (!controller.signal.aborted) setResultado({ empresaId, intento, contenedores });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResultado({ empresaId, intento, error: true });
      });
    return () => controller.abort();
  }, [empresaId, intento, incluirVariedades, cargarVentasEmpresa]);

  const vigente = resultado?.empresaId === empresaId && resultado?.intento === intento ? resultado : null;
  return {
    contenedores: vigente?.contenedores ?? [],
    cargando: Boolean(empresaId && !vigente),
    error: !empresaId ? 'Tu cuenta no tiene una empresa vinculada.'
      : vigente?.error ? 'No se pudieron cargar las ventas.' : null,
    reintentar: empresaId ? () => setIntento((valor) => valor + 1) : null,
  };
}
