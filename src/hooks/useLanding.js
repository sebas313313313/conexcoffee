import { useContext } from 'react';
import LandingContext from '../context/LandingContext';

const useLanding = () => {
  const context = useContext(LandingContext);
  if (!context) {
    throw new Error('useLanding debe usarse dentro de un LandingProvider');
  }
  return context;
};

export default useLanding;
