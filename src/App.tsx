import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFunnels } from './hooks/useFunnels';
import { LoginScreen } from './components/LoginScreen';
import { FunnelSidebar } from './components/FunnelSidebar';
import { VisualFunnelBoard } from './components/VisualFunnelBoard';
import { CreateFunnelModal } from './components/CreateFunnelModal';
import { AudienceTargeting } from './components/AudienceTargeting';
import { AudienceTarget } from './types/audience';
import { TrendingUp, Target, Zap, Sun, Moon, Menu, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function App() {
  const { user, isLoading, isAuthenticated, login, loginWithGoogle, register, logout } = useAuth();
  const {
    funnels,
    activeFunnel,
    activeFunnelId,
    setActiveFunnelId,
    createFunnel,
    duplicateFunnel,
    deleteFunnel,
    updateFunnel,
    updateProduct,
    updateStep,
    deleteStep,
    addStep,
    addProduct,
    moveProduct,
    makeFunnelPublic,
    isLoading: funnelsLoading,
    deleteProduct
  } = useFunnels();
  const location = useLocation();

  const [isCreateFunnelModalOpen, setIsCreateFunnelModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthError('');
      await login(email, password);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      const result = await loginWithGoogle();
      
      // Se result for null, significa que está usando redirect
      if (result === null) {
        // Mostrar mensagem de carregamento ou algo similar
        setAuthError('Redirecionando para o Google...');
      }
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      setAuthError('');
      await register(email, password, name);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    setSidebarCollapsed(false);
    setIsSidebarOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Verificar se está na rota pública
  const isPublicRoute = location.pathname.startsWith('/share/');

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">Carregando...</span>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se não estiver autenticado e não estiver na rota pública
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div>
        <LoginScreen 
          onLogin={handleLogin} 
          onLoginWithGoogle={handleGoogleLogin}
          onRegister={handleRegister}
          isDarkMode={isDarkMode} 
        />
        {authError && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm">{authError}</span>
              <button 
                onClick={() => setAuthError('')}
                className="ml-2 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors main-app-background">
      {/* Sidebar - Desktop (Fixa) */}
      {!sidebarCollapsed && (
        <div className="hidden lg:block fixed left-0 top-0 w-80 h-screen z-20">
          <FunnelSidebar
            funnels={funnels}
            activeFunnelId={activeFunnelId}
            onSelectFunnel={setActiveFunnelId}
            onCreateFunnel={() => setIsCreateFunnelModalOpen(true)}
            onDuplicateFunnel={duplicateFunnel}
            onDeleteFunnel={deleteFunnel}
            onRenameFunnel={updateFunnel}
            onMakeFunnelPublic={makeFunnelPublic}
            isDarkMode={isDarkMode}
            onToggleSidebar={toggleSidebarCollapse}
            userEmail={user?.email}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Sidebar Mobile - Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm h-full">
            <FunnelSidebar
              funnels={funnels}
              activeFunnelId={activeFunnelId}
              onSelectFunnel={(id) => {
                setActiveFunnelId(id);
                setIsSidebarOpen(false);
              }}
              onCreateFunnel={() => setIsCreateFunnelModalOpen(true)}
              onDuplicateFunnel={duplicateFunnel}
              onDeleteFunnel={deleteFunnel}
              onRenameFunnel={updateFunnel}
              onMakeFunnelPublic={makeFunnelPublic}
              isDarkMode={isDarkMode}
              onClose={() => setIsSidebarOpen(false)}
              isMobile={true}
              userEmail={user?.email}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Conteúdo Principal com margem para compensar a sidebar fixa */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 ${
        !sidebarCollapsed ? 'lg:ml-80' : ''
      }`}>
        {/* Header com botões de controle */}
        <div className={`border-b px-4 py-3 flex justify-between items-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            {/* Botão menu mobile */}
            <button
              onClick={toggleSidebar}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Botão para mostrar sidebar quando colapsada (desktop) */}
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebarCollapse}
                className={`hidden lg:block p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Mostrar sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Indicador de carregamento dos funis */}
            {funnelsLoading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Sincronizando...</span>
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* AudienceTargeting component */}
        </div>

        {activeFunnel ? (
          <VisualFunnelBoard
            funnel={activeFunnel}
            onUpdateProduct={(productId, updates) => updateProduct(activeFunnelId!, productId, updates)}
            onUpdateStep={(productId, stepId, updates) => updateStep(activeFunnelId!, productId, stepId, updates)}
            onDeleteStep={(productId, stepId) => deleteStep(activeFunnelId!, productId, stepId)}
            onAddStep={(productId, stepData) => addStep(activeFunnelId!, productId, stepData)}
            onAddProduct={(productData) => addProduct(activeFunnelId!, productData)}
            onMoveProduct={(productId, direction) => moveProduct(activeFunnelId!, productId, direction)}
            onDeleteProduct={(productId) => deleteProduct(activeFunnelId!, productId)}
            onUpdateFunnel={updateFunnel}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900/20 dark:via-gray-900 dark:to-indigo-900/20 py-16">
            <div className="text-center max-w-lg px-4">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-6">
                    <TrendingUp className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                    <Target className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                    <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Dashboard Visual de Funis
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                Crie e gerencie seus funis de vendas de forma visual e intuitiva. 
                Acompanhe cada etapa do processo, desde o tráfego até a mentoria premium.
              </p>
              <button
                onClick={() => setIsCreateFunnelModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Criar Primeiro Funil Visual
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateFunnelModal
        isOpen={isCreateFunnelModalOpen}
        onClose={() => setIsCreateFunnelModalOpen(false)}
        onSave={(funnel) => {
          createFunnel(funnel);
          setIsCreateFunnelModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;