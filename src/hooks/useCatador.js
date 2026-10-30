import { useContext } from 'react';
import { CatadorContext } from '../context/CatadorContext';

export const useCatador = () => {
  const context = useContext(CatadorContext);
  if (!context) {
    throw new Error('useCatador debe ser usado dentro de un CatadorProvider');
  }
  return context;
};
