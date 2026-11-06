import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { brokerData } from './broker/data';
import { createBrokerActions } from './broker/actions';
import { selectBrokerSummary } from './broker/summary';
import { BROKER_PAISES_DESTINO } from '@/features/broker/data/brokerData';

export const BrokerContext = createContext(null);

export const BrokerProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(brokerData);
  const actions = useMemo(() => createBrokerActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectBrokerSummary(state), [state]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    stats: summary.stats,
    negociaciones: state.negociaciones,
    contenedores: state.contenedores,
    ofertasLibres: state.ofertasLibres,
    muestras: state.muestras,
    ventas: state.ventas,
    compradores: state.compradores,
    eventos: state.eventos,
    paisesDestino: BROKER_PAISES_DESTINO,
    crearEvento: actions.crearEvento,
    invitarCompradoresAEvento: actions.invitarCompradoresAEvento,
    cambiarEstadoInvitacion: actions.cambiarEstadoInvitacion,
    actualizarEstadoMuestra: actions.actualizarEstadoMuestra,
    crearSolicitudMuestra: actions.crearSolicitudMuestra,
  }), [state, actions, summary, loading, error, refetch]);

  return <BrokerContext.Provider value={value}>{children}</BrokerContext.Provider>;
};
