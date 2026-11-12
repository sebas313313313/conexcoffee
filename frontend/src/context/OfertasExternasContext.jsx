import { createContext } from 'react';
import api from '@/lib/axios';

const resource = '/ofertas-productores-externos';
const strictResponse = { strictResponse: true };
const post = async (path, data, config) => (await api.post(`${resource}${path}`, data, {
  ...strictResponse, ...config,
})).data;

const publicActions = {
  enviarOferta: (data) => post('', data),
  confirmarOferta: (token) => post('/confirmar', { token }),
  consultarInvitacion: (token, signal) => post('/invitacion', { token }, { signal }),
  aceptarInvitacion: (data) => post('/invitacion/aceptar', data),
};

export const OfertasExternasContext = createContext(null);

export function OfertasExternasProvider({ children }) {
  return <OfertasExternasContext.Provider value={publicActions}>{children}</OfertasExternasContext.Provider>;
}
