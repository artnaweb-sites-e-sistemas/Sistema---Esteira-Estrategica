import React from 'react';
import { ChevronsDown } from 'lucide-react';

interface FunnelConnectorProps {
  isDarkMode?: boolean;
}

export const FunnelConnector: React.FC<FunnelConnectorProps> = ({ isDarkMode }) => {
  return (
    <div className="flex flex-col items-center justify-center" style={{ marginTop: '0rem', marginBottom: '-1rem' }}>
      {/* Linha superior */}
      <div className="h-10 relative overflow-hidden gradient-line" style={{ 
        width: '2px',
        background: 'linear-gradient(to bottom, #00d46e, #4ae098, #00d46e)',
        backgroundSize: '100% 200%'
      }}>
        <div className="shimmer-bg absolute inset-0"></div>
      </div>
      {/* Círculo central com seta e brilho */}
      <div className="rounded-full p-2.5 shadow-xl flex-shrink-0 relative overflow-hidden gradient-circle"
           style={{ 
             background: 'linear-gradient(45deg, #00d46e, #4ae098, #00d46e)',
             backgroundSize: '200% 200%'
           }}>
        <div className="shimmer-bg absolute inset-0"></div>
        <ChevronsDown className="w-6 h-6 text-white" />
      </div>
      {/* Linha inferior */}
      <div className="h-10 relative overflow-hidden gradient-line" style={{ 
        width: '2px',
        background: 'linear-gradient(to bottom, #00d46e, #4ae098, #00d46e)',
        backgroundSize: '100% 200%'
      }}>
        <div className="shimmer-bg absolute inset-0"></div>
      </div>
    </div>
  );
};