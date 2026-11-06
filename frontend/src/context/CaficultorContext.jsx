import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { caficultorData } from './caficultor/data';
import { createCaficultorActions } from './caficultor/actions';

export const CaficultorContext = createContext(null);

export const CaficultorProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(caficultorData);
  const actions = useMemo(() => createCaficultorActions(state, setters), [state, setters]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    fincas: state.fincas,
    lotes: state.lotes,
    preofertas: state.preofertas,
    ofertas: state.ofertas,
    variedades: state.variedades,
    createFinca: actions.createFinca,
    updateFinca: actions.updateFinca,
    createLote: actions.createLote,
    updateLote: actions.updateLote,
    createPreoferta: actions.createPreoferta,
    updatePreoferta: actions.updatePreoferta,
    createOferta: actions.createOferta,
    updateOferta: actions.updateOferta,
  }), [state, actions, loading, error, refetch]);

  return <CaficultorContext.Provider value={value}>{children}</CaficultorContext.Provider>;
};
