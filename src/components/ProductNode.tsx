import React, { useState } from 'react';
import { Product, StepStatus, Step, ProductItem } from '../types';
import { StepNode } from './StepNode';
import { StepDetailsModal } from './StepDetailsModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { ProductDetailsPopup } from './ProductDetailsPopup';
import { ProductItemModal } from './ProductItemModal';
import { stepTypes, marketingStrategies } from '../data/stepTypes';
import { productBlockTypes } from '../data/productBlockTypes';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Lock,
  Pause,
  Expand,
  ListCollapse,
  FoldVertical,
  UnfoldVertical,
  Globe,
  ChevronsRight,
  StickyNote as StickyNoteIcon,
  CreditCard,
  Users,
  Star
} from 'lucide-react';
import '../styles/productNode.css';

interface ProductNodeProps {
  product: Product;
  onUpdateProduct: (updates: Partial<Product>) => void;
  onUpdateStep: (stepId: string, updates: any) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (stepData: Omit<Step, 'id'>) => void;
  onMoveProduct: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDarkMode: boolean;
  isReadOnly?: boolean; // Nova prop para modo somente leitura
  onDeleteProduct: (productId: string) => void; // Adicionar prop para exclusão do produto
}

const statusConfig = {
  todo: {
    icon: Circle,
    color: 'text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-300 dark:border-amber-600'
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-300 dark:border-green-600'
  },
  paused: {
    icon: Pause,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-600'
  }
};

const statusLabels = {
  todo: 'A fazer',
  'in-progress': 'Em andamento',
  completed: 'Concluído',
  paused: 'Pausado'
};

const productItemStatusConfig = {
  todo: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' },
  'in-progress': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-600' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-600' }
};

const productItemStatusLabels = {
  todo: 'A fazer',
  'in-progress': 'Em andamento',
  completed: 'Concluído'
};

export const ProductNode: React.FC<ProductNodeProps> = ({
  product,
  onUpdateProduct,
  onUpdateStep,
  onDeleteStep,
  onAddStep,
  onMoveProduct,
  canMoveUp,
  canMoveDown,
  isDarkMode,
  isReadOnly = false,
  onDeleteProduct
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateStepModal, setShowCreateStepModal] = useState(false);
  const [isTrafficOnly, setIsTrafficOnly] = useState(false);
  const [showProductDetailsPopup, setShowProductDetailsPopup] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showProductItemModal, setShowProductItemModal] = useState(false);
  const [selectedProductItem, setSelectedProductItem] = useState<ProductItem | null>(null);
  const [isCreatingProductItem, setIsCreatingProductItem] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState(false);
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  
  const config = statusConfig[product.status];
  const StatusIcon = config.icon;

  // Determine the correct icon and color for the product type
  const productTypeConfig = Object.entries(productBlockTypes).find(([key, config]) => 
    config.label === product.type || key === product.type
  )?.[1];
  let ProductTypeIcon = productTypeConfig?.icon || Package; // Fallback to Package if not found

  // If the type is 'custom', explicitly use the Package icon as requested
  if (product.type === 'custom') {
    ProductTypeIcon = Package;
  }

  const productTypeBgColor = productTypeConfig?.color || 'bg-blue-100'; // Use blue as default background
  const productTypeIconColor = productTypeConfig?.color.replace('bg-', 'text-') || 'text-blue-600'; // Use blue as default icon color

  const handleStatusChange = (status: StepStatus, e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.stopPropagation(); // Impedindo a propagação do evento
    onUpdateProduct({ status });
  };

  const completedSteps = product.steps.filter(s => s.status === 'completed').length;
  const totalSteps = product.steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const handleViewDetails = () => {
    setShowProductDetailsPopup(true);
  };

  const handleCreateStep = (stepData: Partial<Step>) => {
    if (isReadOnly) return;
    
    const stepType = stepData.type!;
    const stepOrder = stepTypes[stepType]?.order || 999;
    
    // Encontrar a posição correta baseada na ordem ideal
    const existingStepsOfType = product.steps.filter(s => s.type === stepType);
    const allSteps = product.steps.sort((a, b) => {
      const aOrder = stepTypes[a.type]?.order || 999;
      const bOrder = stepTypes[b.type]?.order || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.order - b.order;
    });
    
    let newOrder = 1;
    if (stepType === 'traffic') {
      // Para tráfego, adicionar no final das estratégias
      const trafficSteps = allSteps.filter(s => s.type === 'traffic');
      newOrder = trafficSteps.length + 1;
    } else {
      // Para outras etapas, encontrar posição baseada na ordem ideal
      const stepsBeforeThisType = allSteps.filter(s => {
        const sOrder = stepTypes[s.type]?.order || 999;
        return sOrder < stepOrder;
      });
      const stepsOfSameType = allSteps.filter(s => s.type === stepType);
      newOrder = stepsBeforeThisType.length + stepsOfSameType.length + 1;
    }

    const newStep: Omit<Step, 'id'> = {
      name: stepData.name || '',
      description: stepData.description || '',
      detailedDescription: stepData.detailedDescription || '',
      type: stepData.type || 'page',
      status: 'todo',
      order: newOrder,
      link: stepData.link,
      notes: stepData.notes,
      upsellProducts: stepData.upsellProducts,
      relatedProducts: stepData.relatedProducts,
      isCustom: stepData.isCustom
    };
    onAddStep(newStep);
  };

  const handleStepEdit = (step: Step) => {
    if (isReadOnly) return;
    
    // Se for uma estratégia de marketing, abre o modal de edição do produto
    if (step.type === 'traffic') {
      setSelectedStep(step); // Define a etapa selecionada
      setShowEditStepModal(true); // Abre o modal de edição da etapa
    } else {
      // Para outras etapas, abre o modal de edição da etapa
      setSelectedStep(step); // Define a etapa selecionada
      setShowEditStepModal(true); // Abre o modal
    }
  };

  const handleProductEdit = () => {
    if (isReadOnly) return;
    setShowProductDetailsPopup(false);
    setShowProductEditModal(true);
  };

  const handleProductSave = (updates: Partial<Product>) => {
    if (isReadOnly) return;
    onUpdateProduct(updates);
  };

  const handleProductItemStatusChange = (itemIndex: number, status: 'todo' | 'in-progress' | 'completed') => {
    if (isReadOnly) return;
    
    const updatedItems = [...(product.productItems || [])];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], status };
    onUpdateProduct({ productItems: updatedItems });
  };

  const handleProductItemClick = (productItem: ProductItem) => {
    if (isReadOnly) {
      // Em modo somente leitura, mostra o popup de detalhes
      setSelectedProductItem(productItem);
      setShowProductDetailsPopup(true);
    } else {
      // Em modo de edição, mostra o modal de edição
      setSelectedProductItem(productItem);
      setIsCreatingProductItem(false);
      setShowProductItemModal(true);
    }
  };

  const handleCreateProductItem = () => {
    if (isReadOnly) return;
    
    // Limpa o estado do produto selecionado e define como criação
    const newProductItem: ProductItem = {
      id: '',
      name: '',
      status: 'todo',
      modules: [],
      lessons: [],
      bonuses: [],
      hasAffiliates: false,
      promessa: '',
      value: undefined,
      notes: ''
    };
    setSelectedProductItem(newProductItem);
    setIsCreatingProductItem(true);
    setShowProductItemModal(true);
  };

  const handleDeleteProductItem = (itemIndex: number) => {
    if (isReadOnly) return;
    
    const updatedItems = [...(product.productItems || [])];
    updatedItems.splice(itemIndex, 1);
    onUpdateProduct({ productItems: updatedItems });
    setShowDeleteConfirm(null);
  };

  const handleProductItemSave = (productItemData: Partial<ProductItem>) => {
    if (isReadOnly) return;
    
    const updatedItems = [...(product.productItems || [])];
    
    if (isCreatingProductItem) {
      // Criar novo produto
      const newProductItem: ProductItem = {
        id: crypto.randomUUID(),
        name: productItemData.name || '',
        status: productItemData.status || 'todo',
        modules: productItemData.modules || [],
        lessons: productItemData.lessons || [],
        bonuses: productItemData.bonuses || [],
        whatsappGroup: productItemData.whatsappGroup,
        telegramGroup: productItemData.telegramGroup,
        hasAffiliates: productItemData.hasAffiliates || false,
        notes: productItemData.notes,
        promessa: productItemData.promessa || '',
        value: productItemData.value
      };
      updatedItems.push(newProductItem);
    } else {
      // Editar produto existente
      const index = updatedItems.findIndex(item => item.id === selectedProductItem?.id);
      if (index !== -1) {
        updatedItems[index] = { ...updatedItems[index], ...productItemData };
      }
    }
    
    onUpdateProduct({ productItems: updatedItems });
  };

  const handleDeleteProduct = () => {
    if (isReadOnly) return;
    setShowDeleteProductConfirm(true);
  };

  const confirmDeleteProduct = () => {
    onDeleteProduct(product.id);
    setShowDeleteProductConfirm(false);
  };

  // Separar etapas de tráfego das outras
  const trafficSteps = product.steps.filter(step => step.type === 'traffic');
  const otherSteps = product.steps
    .filter(step => step.type !== 'traffic')
    .sort((a, b) => {
      const aOrder = stepTypes[a.type]?.order || 999;
      const bOrder = stepTypes[b.type]?.order || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.order - b.order;
    });

  return (
    <div className={`product-node-texture bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-600 shadow-sm p-4 transition-all duration-300 ${isExpanded ? 'min-h-[250px]' : ''}`}>
      
      <div className="flex flex-col items-center relative py-6 z-10">
        {/* Product Header */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${config.border} shadow-lg p-4 sm:p-6 mb-8 max-w-6xl w-full group cursor-pointer`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${productTypeBgColor}`}>
                <ProductTypeIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${productTypeIconColor}`} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words">{productTypeConfig?.label || product.type}</h2>
            </div>
            {/* Ícones de ação do produto: Sempre visíveis, funcionalidade controlada por isReadOnly */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-full justify-start ml-[3px] mt-[15px] sm:ml-auto sm:w-auto sm:justify-end sm:mt-0">
              <div title={isExpanded ? "Recolher produto" : "Expandir produto"}>
                {isExpanded ? (
                  <FoldVertical
                    className="w-4 h-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsExpanded(false); }}
                  />
                ) : (
                  <UnfoldVertical
                    className={`w-4 h-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${!isExpanded ? 'animate-pulse' : ''}`}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsExpanded(true); }}
                  />
                )}
              </div>
              {/* Ícone de visualizar com espaçamento */}
              <div title="Ver detalhes do produto" className="ml-2">
                <Eye
                  className={`w-4 h-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                />
              </div>
              {/* Ícone de editar */}
              <div title="Editar produto">
                <Edit3
                  className={`w-4 h-4 cursor-pointer ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700 dark:hover:text-gray-200'}`}
                  onClick={isReadOnly ? undefined : (e: React.MouseEvent) => { e.stopPropagation(); handleProductEdit(); }}
                />
              </div>
              {/* Ícone de excluir */}
              <div title="Excluir produto">
                <Trash2
                  className={`w-4 h-4 cursor-pointer ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-600'}`}
                  onClick={isReadOnly ? undefined : (e: React.MouseEvent) => { e.stopPropagation(); setShowDeleteProductConfirm(true); }}
                />
              </div>
              {/* Ícone de mover para cima */}
              <div title="Mover produto para cima">
                <ChevronUp
                  className={`w-4 h-4 cursor-pointer ${!canMoveUp || isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={!canMoveUp || isReadOnly ? undefined : (e: React.MouseEvent) => { e.stopPropagation(); onMoveProduct('up'); }}
                />
              </div>
              {/* Ícone de mover para baixo */}
              <div title="Mover produto para baixo">
                <ChevronDown
                  className={`w-4 h-4 cursor-pointer ${!canMoveDown || isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={!canMoveDown || isReadOnly ? undefined : (e: React.MouseEvent) => { e.stopPropagation(); onMoveProduct('down'); }}
                />
              </div>
            </div>
          </div>

          {product.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{product.description}</p>
          )}

          {product.promessa && (
            <div className="mb-4">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {product.promessa}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {statusLabels[product.status]}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progresso das Etapas</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {completedSteps}/{totalSteps} ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(['todo', 'in-progress', 'completed', 'paused'] as StepStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={(e) => handleStatusChange(status, e)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    product.status === status
                      ? `${statusConfig[status].bg} ${statusConfig[status].color} border ${statusConfig[status].border}`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="w-full max-w-6xl">
            {/* Seção de Produtos */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Produtos</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-300 dark:from-blue-600 to-transparent ml-4"></div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleCreateProductItem}
                    className="ml-4 flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Produto</span>
                  </button>
                )}
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.productItems && product.productItems.map((productItem, index) => (
                    <div 
                      key={productItem.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full"
                      onClick={() => handleProductItemClick(productItem)}
                    >
                      {/* Botões de ação - apenas se não for somente leitura */}
                      {!isReadOnly && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(index);
                            }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductItemClick(productItem);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all"
                            title="Editar produto"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Conteúdo principal do card */}
                      <div className="flex-grow">
                        <div className={`flex items-center space-x-2 mb-3 ${!isReadOnly ? 'pr-12' : ''}`}>
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{productItem.name}</span>
                        </div>
                        
                        {/* Promessa do produto */}
                        {productItem.promessa && (
                          <div className="mb-3">
                            <div className="flex items-start space-x-2">
                              <StickyNoteIcon className="w-3 h-3 text-gray-400 mt-[3px] flex-shrink-0" />
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {productItem.promessa}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Estatísticas */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {productItem.modules && productItem.modules.length > 0 && (
                            <div>📚 Módulos: {productItem.modules.length}</div>
                          )}
                          {productItem.lessons && productItem.lessons.length > 0 && (
                            <div>🎥 Aulas: {productItem.lessons.length}</div>
                          )}
                          {productItem.bonuses && productItem.bonuses.length > 0 && (
                            <div>🎁 Bônus: {productItem.bonuses.length}</div>
                          )}
                          {productItem.hasAffiliates && (
                            <div className="text-blue-600 dark:text-blue-400 font-medium">👥 Com afiliados</div>
                          )}
                        </div>
                      </div>

                      {/* Rodapé do card com valor e status */}
                      <div className="mt-3 space-y-2">
                        {/* Valor do produto */}
                        {productItem.value && (
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(productItem.value)}
                            </span>
                          </div>
                        )}

                        {/* Status do produto - sempre visível, mas sem interação em modo somente leitura */}
                        <div className="flex gap-1 flex-wrap">
                          {(['todo', 'in-progress', 'completed'] as const).map((status) => {
                            const config = productItemStatusConfig[status];
                            const StatusIcon = config.icon;
                            const isSelected = productItem.status === status;
                            // Em modo somente leitura, mostra apenas o status atual
                            if (isReadOnly && !isSelected) return null;
                            return (
                              <div
                                key={status}
                                className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                                  isSelected
                                    ? `${config.bg} ${config.color} border ${config.border}`
                                    : isReadOnly 
                                      ? 'hidden' // Esconde os outros status em modo somente leitura
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={(e) => {
                                  if (!isReadOnly) {
                                    e.stopPropagation();
                                    handleProductItemStatusChange(index, status);
                                  }
                                }}
                              >
                                <div className="flex-shrink-0 flex items-center justify-center w-3 h-3">
                                  <StatusIcon className="w-3 h-3" />
                                </div>
                                <span>{productItemStatusLabels[status]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Card para adicionar novo produto - apenas se não for somente leitura */}
                  {!isReadOnly && (
                    <div 
                      onClick={handleCreateProductItem}
                      className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                      <div className="bg-blue-200 dark:bg-blue-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-700 rounded-full p-3 mb-2 transition-colors">
                        <Plus className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium text-sm">
                        Adicionar Bloco
                      </p>
                    </div>
                  )}
                  
                  {(!product.productItems || product.productItems.length === 0) && (
                    <div className="col-span-full text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum produto específico cadastrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estratégias de Marketing */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Estratégias de Marketing</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-300 dark:from-blue-600 to-transparent ml-4"></div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      setIsTrafficOnly(true);
                      setShowCreateStepModal(true);
                    }}
                    className="ml-4 flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Estratégia</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                {trafficSteps.map((step) => (
                  <StepNode
                    key={step.id}
                    step={step}
                    onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(step.id, updates)}
                    onDelete={isReadOnly ? () => {} : () => onDeleteStep(step.id)}
                    onEdit={() => handleStepEdit(step)}
                    isDarkMode={isDarkMode}
                    isReadOnly={isReadOnly}
                    isDashedBorder={false}
                    className="h-full"
                  />
                ))}
                
                {/* Card vazio para adicionar estratégia personalizada - apenas se não for somente leitura */}
                {!isReadOnly && (
                  <div 
                    onClick={() => {
                      setIsTrafficOnly(true);
                      setShowCreateStepModal(true);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group h-full"
                  >
                    <div className="bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 rounded-full p-3 mb-3 transition-colors">
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium text-sm">
                      Adicionar Estratégia
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Etapas do Funil */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Etapas do Funil</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-300 dark:from-green-600 to-transparent ml-4"></div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      setIsTrafficOnly(false);
                      setShowCreateStepModal(true);
                    }}
                    className="ml-4 flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Etapa</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {otherSteps.map((step, index) => (
                  <div key={step.id} className="relative h-full">
                    <StepNode
                      step={step}
                      onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(step.id, updates)}
                      onDelete={isReadOnly ? () => {} : () => onDeleteStep(step.id)}
                      onEdit={() => handleStepEdit(step)}
                      isDarkMode={isDarkMode}
                      isReadOnly={isReadOnly}
                      isDashedBorder={true}
                      className="h-full"
                    />
                    
                    {/* Connection arrows between steps */}
                    {index < otherSteps.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 left-full transform -translate-y-1/2 z-10 items-center w-8">
                        {/* Line */}
                        <div className="w-4 h-[2px] bg-teal-500"></div>
                        {/* Arrow circle */}
                        <div className="bg-teal-500 rounded-full p-1 shadow-md flex-shrink-0 relative overflow-hidden ml-[-2px]">
                          <div className="shimmer-bg absolute inset-0"></div>
                          <ChevronsRight size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Card vazio para adicionar etapa personalizada - apenas se não for somente leitura */}
                {!isReadOnly && (
                  <div 
                    onClick={() => {
                      setIsTrafficOnly(false);
                      setShowCreateStepModal(true);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group h-full"
                  >
                    <div className="bg-gray-200 dark:bg-gray-700 group-hover:bg-green-200 dark:group-hover:bg-green-800 rounded-full p-3 mb-3 transition-colors">
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 font-medium text-sm">
                      Adicionar Etapa
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-green-500 text-xs text-center mt-1">
                      Clique para criar uma nova etapa do funil
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmação de exclusão - apenas se não for somente leitura */}
        {!isReadOnly && showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteProductItem(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para criar/editar etapas */}
        {!isReadOnly && showCreateStepModal && (
          <StepDetailsModal
            step={null} // Passa null para criação, o modal se encarrega de preencher
            isOpen={showCreateStepModal}
            onClose={() => setShowCreateStepModal(false)}
            onSave={handleCreateStep}
            isCreating={true}
            isTrafficOnly={isTrafficOnly}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Modal para editar etapa (quando selectedStep não é null) */}
        {!isReadOnly && showEditStepModal && selectedStep && (
          <StepDetailsModal
            key={selectedStep.id}
            step={selectedStep}
            isOpen={showEditStepModal}
            onClose={() => {
              setShowEditStepModal(false);
              setSelectedStep(null);
            }}
            onSave={(updates) => {
              onUpdateStep(selectedStep.id, updates);
              setShowEditStepModal(false);
              setSelectedStep(null);
            }}
            isCreating={false}
            isTrafficOnly={selectedStep.type === 'traffic'}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Modal de edição do produto principal */}
        {!isReadOnly && (
          <ProductDetailsModal
            product={product} // Passa o produto completo para edição
            isOpen={showProductEditModal} // Controla a visibilidade do modal de edição do produto
            onClose={() => setShowProductEditModal(false)}
            onSave={handleProductSave}
            isCreating={false}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Popup de detalhes do produto (visualização) */}
        <ProductDetailsPopup
          product={product}
          isOpen={showProductDetailsPopup}
          onClose={() => setShowProductDetailsPopup(false)}
          onEdit={handleProductEdit}
          isDarkMode={isDarkMode}
          selectedProductItem={selectedProductItem} // Passa o item de produto selecionado se houver
        />

        {/* Modal para adicionar/editar item de produto */}
        {!isReadOnly && (
          <ProductItemModal
            productItem={selectedProductItem} // Passa o item de produto selecionado ou null para criar
            isOpen={showProductItemModal}
            onClose={() => setShowProductItemModal(false)}
            onSave={handleProductItemSave}
            isCreating={isCreatingProductItem}
            isDarkMode={isDarkMode}
          />
        )}

        {!isReadOnly && showDeleteProductConfirm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => setShowDeleteProductConfirm(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Tem certeza que deseja excluir o produto <span className="font-bold">{product.name}</span>?
                Todas as etapas e itens de produto relacionados também serão excluídos.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteProductConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = `
@keyframes gradient-shift {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.animate-gradient-shift {
  animation: gradient-shift 15s ease infinite;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);