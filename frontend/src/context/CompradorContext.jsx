import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { compradorData } from './comprador/data';
import { createCompradorActions } from './comprador/actions';
import { selectCompradorSummary } from './comprador/summary';

export const CompradorContext = createContext(null);

export const CompradorProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(compradorData);
  const actions = useMemo(() => createCompradorActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectCompradorSummary(state), [state]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    contenedores: state.contenedores,
    pedidos: state.pedidos,
    paisesDisponibles: summary.paisesDisponibles,
    createPedido: actions.createPedido,
  }), [state, actions, loading, error, refetch, summary]);

  return <CompradorContext.Provider value={value}>{children}</CompradorContext.Provider>;
};
