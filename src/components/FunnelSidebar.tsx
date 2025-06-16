import React, { useState } from 'react';
import { Funnel } from '../types';
import { 
  Plus, 
  Copy, 
  Trash2, 
  FileText,
  Calendar,
  MoreVertical,
  TrendingUp,
  X,
  Share2,
  Edit3,
  Check,
  XIcon,
  ChevronLeft,
  LogOut,
  User,
  Globe,
  Lock
} from 'lucide-react';

interface FunnelSidebarProps {
  funnels: Funnel[];
  activeFunnelId: string | null;
  onSelectFunnel: (funnelId: string) => void;
  onCreateFunnel: () => void;
  onDuplicateFunnel: (funnelId: string) => void;
  onDeleteFunnel: (funnelId: string) => void;
  onRenameFunnel: (funnelId: string, updates: { name: string; description?: string }) => void;
  onMakeFunnelPublic?: (funnelId: string) => Promise<boolean>;
  isDarkMode: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export const FunnelSidebar: React.FC<FunnelSidebarProps> = ({
  funnels,
  activeFunnelId,
  onSelectFunnel,
  onCreateFunnel,
  onDuplicateFunnel,
  onDeleteFunnel,
  onRenameFunnel,
  onMakeFunnelPublic,
  isDarkMode,
  onClose,
  isMobile = false,
  onToggleSidebar,
  userEmail,
  onLogout
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<string | null>(null);
  const [editingFunnelId, setEditingFunnelId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [makingPublic, setMakingPublic] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFunnelProgress = (funnel: Funnel) => {
    const allSteps = funnel.products.flatMap(p => p.steps);
    const completed = allSteps.filter(s => s.status === 'completed').length;
    const total = allSteps.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const generateShareLink = (funnelId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${funnelId}`;
  };

  const handleShare = async (funnelId: string) => {
    if (!onMakeFunnelPublic) {
      // Fallback para link simples se não houver função de tornar público
      const shareLink = generateShareLink(funnelId);
      navigator.clipboard.writeText(shareLink).then(() => {
        setShareModalOpen(funnelId);
        setTimeout(() => setShareModalOpen(null), 3000);
      });
      return;
    }

    try {
      setMakingPublic(funnelId);
      
      // Tornar o funil público primeiro
      const success = await onMakeFunnelPublic(funnelId);
      
      if (success) {
        // Gerar link público
        const shareLink = generateShareLink(funnelId);
        
        // Copiar para clipboard
        await navigator.clipboard.writeText(shareLink);
        
        // Mostrar confirmação
        setShareModalOpen(funnelId);
        setTimeout(() => setShareModalOpen(null), 5000);
      } else {
        alert('Erro ao tornar funil público. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao compartilhar funil:', error);
      alert('Erro ao compartilhar funil. Tente novamente.');
    } finally {
      setMakingPublic(null);
      setOpenMenuId(null);
    }
  };

  const handleStartEdit = (funnel: Funnel) => {
    setEditingFunnelId(funnel.id);
    setEditingName(funnel.name);
    setOpenMenuId(null);
  };

  const handleSaveEdit = (funnelId: string) => {
    if (editingName.trim()) {
      onRenameFunnel(funnelId, { name: editingName.trim() });
    }
    setEditingFunnelId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingFunnelId(null);
    setEditingName('');
  };

  return (
    <div className={`w-80 h-screen border-r flex flex-col shadow-sm ${
      isDarkMode 
        ? 'sidebar-background-dark border-gray-700' 
        : 'sidebar-background-light border-gray-200'
    }`}>
      {/* Header da Sidebar - Fixo */}
      <div className={`p-4 border-b flex-shrink-0 ${
        isDarkMode 
          ? 'border-gray-700 bg-gradient-to-r from-blue-900/20 to-indigo-900/20' 
          : 'border-gray-200 bg-gradient-to-r from-blue-100/50 to-indigo-100/50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Teste
            </h2>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Botão para ocultar sidebar (desktop) */}
            {!isMobile && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
                title="Ocultar sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Botão para fechar (mobile) */}
            {isMobile && onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={onCreateFunnel}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Funil</span>
        </button>
      </div>

      {/* Lista de Funis - Com scroll interno */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {funnels.length === 0 ? (
          <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className="font-medium">Nenhum funil criado ainda</p>
            <p className="text-sm">Clique em "Novo Funil" para começar</p>
          </div>
        ) : (
          <div className="p-2">
            {funnels.map((funnel) => {
              const progress = getFunnelProgress(funnel);
              const isActive = funnel.id === activeFunnelId;
              const isMenuOpen = openMenuId === funnel.id;
              const isEditing = editingFunnelId === funnel.id;
              const isBeingShared = makingPublic === funnel.id;

              return (
                <div
                  key={funnel.id}
                  className={`relative group mb-2 p-3 rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? (isDarkMode 
                          ? 'bg-blue-900/30 border-2 border-blue-700 shadow-sm' 
                          : 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                        )
                      : (isDarkMode 
                          ? 'hover:bg-gray-700 border-2 border-transparent'
                          : 'hover:bg-gray-200 border-2 border-transparent'
                        )
                  }`}
                  onClick={() => !isEditing && onSelectFunnel(funnel.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className={`w-full px-2 py-1 text-sm font-medium rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(funnel.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <div className="flex items-center space-x-1 mt-1">
                            <button
                              onClick={() => handleSaveEdit(funnel.id)}
                              className="p-1 text-green-500 hover:text-green-600 transition-colors"
                              title="Salvar"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-500 hover:text-red-600 transition-colors"
                              title="Cancelar"
                            >
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <h3 className={`font-medium text-sm mb-1 line-clamp-2 ${
                          isActive && !isDarkMode ? 'text-gray-900' : 
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {funnel.name}
                        </h3>
                      )}
                      
                      <div className={`flex items-center space-x-2 text-xs mb-2 ${
                        isActive && !isDarkMode ? 'text-gray-500' : 
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(funnel.createdAt)}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={
                            isActive && !isDarkMode ? 'text-gray-600' : 
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }>
                            Progresso Geral
                          </span>
                          <span className={`font-medium ${
                            isActive && !isDarkMode ? 'text-gray-900' : 
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${
                          isActive && !isDarkMode ? 'bg-gray-200' : 
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                        }`}>
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <div className={`text-xs ${
                          isActive && !isDarkMode ? 'text-gray-500' : 
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {progress.percentage}% concluído
                        </div>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="flex items-center space-x-1">
                        {/* Botão de compartilhar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(funnel.id);
                          }}
                          disabled={isBeingShared}
                          className={`p-1 transition-colors opacity-0 group-hover:opacity-100 ${
                            isBeingShared
                              ? 'text-blue-500 animate-pulse'
                              : isActive && !isDarkMode 
                                ? 'text-gray-400 hover:text-blue-600' 
                                : isDarkMode
                                  ? 'text-gray-400 hover:text-blue-400'
                                  : 'text-gray-500 hover:text-blue-600'
                          }`}
                          title={isBeingShared ? "Tornando público..." : "Compartilhar funil"}
                        >
                          {isBeingShared ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Menu de opções */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : funnel.id);
                            }}
                            className={`p-1 transition-colors opacity-0 group-hover:opacity-100 ${
                              isActive && !isDarkMode 
                                ? 'text-gray-400 hover:text-gray-600' 
                                : isDarkMode
                                  ? 'text-gray-400 hover:text-gray-300'
                                  : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className={`absolute right-0 top-6 z-20 border rounded-lg shadow-lg py-1 min-w-[140px] ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-700' 
                                  : 'bg-white border-gray-200'
                              }`}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(funnel);
                                  }}
                                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <span>Renomear</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicateFunnel(funnel.id);
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <Copy className="w-4 h-4" />
                                  <span>Duplicar</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Tem certeza que deseja excluir este funil?')) {
                                      onDeleteFunnel(funnel.id);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 transition-colors ${
                                    isDarkMode 
                                      ? 'hover:bg-red-900/20' 
                                      : 'hover:bg-red-50'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Excluir</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal de confirmação de compartilhamento */}
                  {shareModalOpen === funnel.id && (
                    <div className="absolute inset-x-0 top-0 z-30 mx-2">
                      <div className="bg-green-600 text-white rounded-lg p-3 shadow-lg border border-green-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="w-4 h-4" />
                          <p className="text-xs font-medium">
                            ✓ Funil tornado público!
                          </p>
                        </div>
                        <p className="text-xs opacity-90">
                          Link copiado para a área de transferência. Qualquer pessoa com o link pode visualizar este funil.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer com informações do usuário - Fixo */}
      {userEmail && (
        <div className={`p-4 border-t flex-shrink-0 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <User className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {userEmail.split('@')[0]}
                </p>
                <p className={`text-xs truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {userEmail}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-red-600 hover:bg-gray-200'
                }`}
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};