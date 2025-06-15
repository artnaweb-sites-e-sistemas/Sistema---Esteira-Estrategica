import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { PublicFunnelViewer } from './components/PublicFunnelViewer';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota pública para visualização de funil compartilhado */}
        <Route path="/share/:funnelId" element={<PublicFunnelViewer />} />
        
        {/* Rota principal do app (requer autenticação) */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
