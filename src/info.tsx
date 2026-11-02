import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Informace } from './pages/Informace';
import './tokens.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Informace />
  </StrictMode>,
);
