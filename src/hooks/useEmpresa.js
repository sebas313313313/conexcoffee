import { useContext } from 'react';
import { EmpresaContext } from '../context/EmpresaContext';

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa debe ser usado dentro de un EmpresaProvider');
  }
  return context;
};
