import { useContext } from 'react';
import { CaficultorContext } from '../context/CaficultorContext';

export const useCaficultor = () => {
  const context = useContext(CaficultorContext);
  if (!context) {
    throw new Error('useCaficultor debe ser usado dentro de un CaficultorProvider');
  }
  return context;
};
