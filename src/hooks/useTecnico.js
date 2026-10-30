import { useContext } from 'react';
import { TecnicoContext } from '../context/TecnicoContext';

export const useTecnico = () => {
  const context = useContext(TecnicoContext);
  if (!context) {
    throw new Error('useTecnico debe ser usado dentro de un TecnicoProvider');
  }
  return context;
};
