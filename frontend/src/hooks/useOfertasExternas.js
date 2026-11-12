import { useContext } from 'react';
import { OfertasExternasContext } from '@/context/OfertasExternasContext';

export function useOfertasExternas() {
  const context = useContext(OfertasExternasContext);
  if (!context) throw new Error('useOfertasExternas requiere OfertasExternasProvider');
  return context;
}
