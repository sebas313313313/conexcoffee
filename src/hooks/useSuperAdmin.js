import { useContext } from 'react';
import { SuperAdminContext } from '../context/SuperAdminContext';

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin debe ser usado dentro de un SuperAdminProvider');
  }
  return context;
};
