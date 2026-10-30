import { useContext } from 'react';
import { LaboratorioContext } from '../context/LaboratorioContext';

export const useLaboratorio = () => {
  const context = useContext(LaboratorioContext);
  if (!context) {
    throw new Error('useLaboratorio debe ser usado dentro de un LaboratorioProvider');
  }
  return context;
};
