import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Funnel } from '../types';
import { useFunnels } from '../hooks/useFunnels';
import { VisualFunnelBoard } from './VisualFunnelBoard';
import { TrendingUp, Lock, AlertCircle, Sun, Moon } from 'lucide-react';

export const PublicFunnelViewer: React.FC = () => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const { loadPublicFunnel } = useFunnels();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Carregar preferência de tema do localStorage
    const saved = localStorage.getItem('publicViewDarkMode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Salvar preferência de tema
    localStorage.setItem('publicViewDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (funnelId) {
      loadFunnel();
    }
  }, [funnelId]);

  const loadFunnel = async () => {
    if (!funnelId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const publicFunnel = await loadPublicFunnel(funnelId);
      
      if (publicFunnel) {
        setFunnel(publicFunnel);
      } else {
        setError('Funil não encontrado ou não é público');
      }
    } catch (error) {
      console.error('Erro ao carregar funil público:', error);
      setError('Erro ao carregar funil');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando funil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {error.includes('não é público') ? (
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error.includes('não é público') ? 'Funil Privado' : 'Funil Não Encontrado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error.includes('não é público') 
              ? 'Este funil é privado e não pode ser visualizado publicamente.'
              : 'O funil solicitado não foi encontrado ou foi removido.'
            }
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header público */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {funnel.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visualização Pública</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Botão de tema */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Público</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do funil (somente leitura) */}
      <VisualFunnelBoard
        funnel={funnel}
        onUpdateProduct={() => {}} // Desabilitado para visualização pública
        onUpdateStep={() => {}} // Desabilitado para visualização pública
        onDeleteStep={() => {}} // Desabilitado para visualização pública
        onAddStep={() => {}} // Desabilitado para visualização pública
        onAddProduct={() => {}} // Desabilitado para visualização pública
        onMoveProduct={() => {}} // Desabilitado para visualização pública
        onDeleteProduct={() => {}} // Desabilitado para visualização pública
        isDarkMode={isDarkMode}
        isReadOnly={true} // Prop para indicar modo somente leitura
      />

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Criado com{' '}
            <a 
              href="/" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Teste
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};