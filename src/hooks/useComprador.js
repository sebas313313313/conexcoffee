import { useContext } from 'react';
import { CompradorContext } from '../context/CompradorContext';

export const useComprador = () => {
  const context = useContext(CompradorContext);
  if (!context) {
    throw new Error('useComprador debe ser usado dentro de un CompradorProvider');
  }
  return context;
};
