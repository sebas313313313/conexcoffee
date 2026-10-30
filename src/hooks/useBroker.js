import { useContext } from 'react';
import { BrokerContext } from '../context/BrokerContext';

export const useBroker = () => {
  const context = useContext(BrokerContext);
  if (!context) {
    throw new Error('useBroker debe ser usado dentro de un BrokerProvider');
  }
  return context;
};
