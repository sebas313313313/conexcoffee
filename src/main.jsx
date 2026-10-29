import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// ============================================
// Punto de entrada — ConexCoffee Frontendd
// ============================================

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
