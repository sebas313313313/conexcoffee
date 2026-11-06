import { useContext } from 'react';
import { TrazabilidadContext } from '@/context/TrazabilidadContextValue';

export default function useTrazabilidad() {
  const context = useContext(TrazabilidadContext);
  if (!context) throw new Error('useTrazabilidad requiere TrazabilidadProvider');
  return context;
}
