import React, { useState } from 'react';
import { Product, StepStatus, Step, ProductItem } from '../types';
import { StepNode } from './StepNode';
import { StepDetailsModal } from './StepDetailsModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { ProductDetailsPopup } from './ProductDetailsPopup';
import { ProductItemModal } from './ProductItemModal';
import { stepTypes, marketingStrategies, isParentCategory } from '../data/stepTypes';
import { productBlockTypes } from '../data/productBlockTypes';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  Star,
  GripVertical,
  Grip
} from 'lucide-react';
import '../styles/productNode.css';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Componente SortableProductCard para uso com dnd-kit
interface SortableProductCardProps {
  productItem: ProductItem;
  index: number;
  onClick: () => void;
  isReadOnly: boolean;
  setShowDeleteConfirm: (idx: number) => void;
  handleProductItemClick: (item: ProductItem) => void;
  handleProductItemStatusChange: (idx: number, status: 'todo' | 'in-progress' | 'completed') => void;
}

const SortableProductCard = React.memo(function SortableProductCard({ productItem, index, onClick, isReadOnly, setShowDeleteConfirm, handleProductItemClick, handleProductItemStatusChange }: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: productItem.id });
  
  // Define a cor da borda baseada no status
  const getBorderClass = () => {
    switch (productItem.status) {
      case 'completed':
        return 'border-green-500 dark:border-green-600 border-2';
      case 'in-progress':
        return 'border-amber-500 dark:border-amber-600 border-2';
      default:
        return 'border-blue-200 dark:border-blue-700 border';
    }
  };
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
    zIndex: isDragging ? 50 : 'auto',
    boxShadow: isDragging ? '0 0 0 4px #3b82f6' : undefined
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${getBorderClass()} shadow-sm hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full transition-transform duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
      onClick={() => handleProductItemClick(productItem)}
    >
      {/* Botões de ação - apenas se não for somente leitura */}
      {!isReadOnly && (
        <div className="absolute top-3 right-3 flex items-center space-x-1 transition-all z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProductItemClick(productItem);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all"
            title="Editar produto"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(index);
            }}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
            title="Excluir produto"
          >
            <Trash2 className="w-4 h-4" />
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
            {/* Tipo de Oferta abaixo da promessa */}
            {productItem.offerType && (
              <div className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                productItem.offerType === 'inicial'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
              }`}>
                {productItem.offerType === 'inicial' ? 'Oferta Inicial' : 'Oferta de Upsell'}
              </div>
            )}
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
        {/* Status do produto */}
        <div className="flex gap-1 flex-wrap">
          {(['todo', 'in-progress', 'completed'] as const).map((status) => {
            const config = productItemStatusConfig[status];
            const StatusIcon = config.icon;
            const isSelected = productItem.status === status;
            if (isReadOnly && !isSelected) return null;
            return (
              <div
                key={status}
                className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                  isSelected
                    ? `${config.bg} ${config.color} border ${config.border}`
                    : isReadOnly 
                      ? 'hidden'
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
  );
});

// Adicionar componente SortableTrafficStepNode
interface SortableTrafficStepNodeProps {
  step: Step;
  index: number;
  onUpdate: (updates: Partial<Step>) => void;
  onDelete: () => void;
  onEdit: () => void;
  isDarkMode: boolean;
  isReadOnly?: boolean;
  isDashedBorder?: boolean;
  className?: string;
}

function SortableTrafficStepNode({ step, index, onUpdate, onDelete, onEdit, isDarkMode, isReadOnly, isDashedBorder, className }: SortableTrafficStepNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
    zIndex: isDragging ? 50 : 'auto',
    boxShadow: isDragging ? '0 0 0 4px #3b82f6' : undefined
  };
  return (
    <div ref={setNodeRef} style={style} className={className}>
      <StepNode
        step={step}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEdit={onEdit}
        isDarkMode={isDarkMode}
        isReadOnly={isReadOnly}
        isDashedBorder={isDashedBorder}
        listeners={listeners}
        attributes={attributes}
      />
    </div>
  );
}

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
  const [pendingParentId, setPendingParentId] = useState<string | null>(null);
  const [showProductDetailsPopup, setShowProductDetailsPopup] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showProductItemModal, setShowProductItemModal] = useState(false);
  const [selectedProductItem, setSelectedProductItem] = useState<ProductItem | null>(null);
  const [isCreatingProductItem, setIsCreatingProductItem] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState(false);
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [activeProductItemId, setActiveProductItemId] = useState<string | null>(null);
  const [activeTrafficStepId, setActiveTrafficStepId] = useState<string | null>(null);

  // Estado para controlar qual etapa pai está expandida (apenas uma por vez)
  const [expandedParentId, setExpandedParentId] = useState<string | null>(() => {
    const parentSteps = product.steps.filter(s => isParentCategory(s.type) && !s.parentId);
    return parentSteps.length > 0 ? parentSteps[0].id : null;
  });

  // Garantir que sempre haja um pai expandido se houver pais
  React.useEffect(() => {
    const parentSteps = product.steps.filter(s => isParentCategory(s.type) && !s.parentId);
    if (parentSteps.length > 0 && !expandedParentId) {
      setExpandedParentId(parentSteps[0].id);
    }
  }, [product.steps, expandedParentId]);

  // Estado para modal de exclusão em cascata
  const [cascadeDeleteModal, setCascadeDeleteModal] = useState<{
    isOpen: boolean;
    stepId: string | null;
    stepName: string;
    childrenCount: number;
  }>({
    isOpen: false,
    stepId: null,
    stepName: '',
    childrenCount: 0
  });
  
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
      isCustom: stepData.isCustom,
      ...(stepData.parentId ? { parentId: stepData.parentId } : {}),
      ...(typeof stepData.downsellValue !== 'undefined' ? { downsellValue: stepData.downsellValue } : {})
    };
    
    // Se a etapa tem um pai, expande automaticamente esse pai
    if (stepData.parentId) {
      setExpandedParentId(stepData.parentId);
    }
    
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

  // Função para expandir/colapsar etapa pai (apenas uma por vez)
  const toggleParentExpansion = (parentId: string) => {
    if (expandedParentId === parentId) {
      // Se clicar no já expandido, não faz nada (mantém expandido)
      return;
    }
    setExpandedParentId(parentId);
  };

  // Função para deletar etapa com verificação de cascata
  const handleDeleteStepWithValidation = (stepId: string) => {
    const step = product.steps.find(s => s.id === stepId);
    if (!step) return;

    // Fechar modal de edição se estiver aberto
    if (showEditStepModal) {
      setShowEditStepModal(false);
      setSelectedStep(null);
      
      // Aguardar um momento para garantir que o modal de edição feche antes de abrir o de exclusão
      setTimeout(() => {
        proceedWithDelete(stepId, step);
      }, 100);
      return;
    }

    proceedWithDelete(stepId, step);
  };

  // Função auxiliar para processar a exclusão
  const proceedWithDelete = (stepId: string, step: Step) => {
    // Verificar se é uma etapa pai
    if (isParentCategory(step.type)) {
      const children = product.steps.filter(s => s.parentId === stepId);
      
      if (children.length > 0) {
        // Verificar se há uma página pai vinculada (que pode "herdar" os filhos)
        const linkedParentPage = children.find(s => isParentCategory(s.type));
        
        if (linkedParentPage) {
          // Há uma página pai vinculada - transferir os filhos normais para ela
          const normalChildren = children.filter(s => !isParentCategory(s.type));
          
          // Transferir os filhos normais para a página pai vinculada
          normalChildren.forEach(child => {
            onUpdateStep(child.id, { parentId: linkedParentPage.id });
          });
          
          // Remover o vínculo da página pai vinculada (ela fica independente)
          onUpdateStep(linkedParentPage.id, { parentId: undefined });
          
          // Deletar apenas a página atual
          onDeleteStep(stepId);
          return;
        }
        
        // Não há página pai vinculada - mostrar modal de exclusão em cascata
        setCascadeDeleteModal({
          isOpen: true,
          stepId: stepId,
          stepName: step.name || stepTypes[step.type]?.label || step.type,
          childrenCount: children.length
        });
        return;
      }
    }

    // Se não tem filhos ou não é pai, deletar normalmente
    onDeleteStep(stepId);
  };

  // Função para confirmar exclusão em cascata
  const handleConfirmCascadeDelete = () => {
    if (!cascadeDeleteModal.stepId) return;

    const stepId = cascadeDeleteModal.stepId;
    const children = product.steps.filter(s => s.parentId === stepId);

    // Deletar todas as etapas filhas
    children.forEach(child => {
      onDeleteStep(child.id);
    });

    // Deletar a etapa pai
    onDeleteStep(stepId);

    // Fechar modal
    setCascadeDeleteModal({
      isOpen: false,
      stepId: null,
      stepName: '',
      childrenCount: 0
    });
  };

  // Separar etapas de tráfego das outras
  const trafficSteps = product.steps.filter(step => step.type === 'traffic');
  
  // Organizar etapas em hierarquia
  // Excluir páginas pai que têm um parentId (pois serão renderizadas dentro do pai delas)
  // E filtrar apenas páginas pai que têm produtos (páginas vazias são consideradas "órfãs")
  const parentSteps = product.steps
    .filter(step => 
      isParentCategory(step.type) && 
      !step.parentId &&
      step.relatedProducts && 
      step.relatedProducts.length > 0
    )
    .sort((a, b) => {
      const aOrder = stepTypes[a.type]?.order || 999;
      const bOrder = stepTypes[b.type]?.order || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.order - b.order;
    });
  
  // Páginas pai órfãs (sem produtos vinculados)
  const orphanParentPages = product.steps.filter(step => 
    isParentCategory(step.type) && 
    !step.parentId &&
    (!step.relatedProducts || step.relatedProducts.length === 0)
  );

  // Criar mapa de filhos para cada pai
  const getChildrenOfParent = (parentId: string): Step[] => {
    return product.steps
      .filter(step => 
        step.parentId === parentId && 
        !isParentCategory(step.type) // Excluir páginas pai vinculadas (já renderizadas separadamente)
      )
      .sort((a, b) => {
        const aOrder = stepTypes[a.type]?.order || 999;
        const bOrder = stepTypes[b.type]?.order || 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.order - b.order;
      });
  };

  // Encontrar etapas órfãs (filhas sem pai definido)
  const orphanSteps = product.steps
    .filter(step => 
      step.type !== 'traffic' && 
      !isParentCategory(step.type) && 
      !step.parentId
    )
    .sort((a, b) => {
      const aOrder = stepTypes[a.type]?.order || 999;
      const bOrder = stepTypes[b.type]?.order || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.order - b.order;
    });

  // Manter compatibilidade com código antigo
  const otherSteps = product.steps
    .filter(step => step.type !== 'traffic')
    .sort((a, b) => {
      const aOrder = stepTypes[a.type]?.order || 999;
      const bOrder = stepTypes[b.type]?.order || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.order - b.order;
    });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleProductItemsDndEnd = (event: any) => {
    const { active, over } = event;
    const items = product.productItems || [];
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newItems = arrayMove(items, oldIndex, newIndex);
    onUpdateProduct({ productItems: newItems });
  };

  const handleTrafficStepsDndEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = trafficSteps.findIndex(step => step.id === active.id);
    const newIndex = trafficSteps.findIndex(step => step.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newSteps = arrayMove(trafficSteps, oldIndex, newIndex);
    // Atualiza a ordem dos steps no produto
    const allSteps = [
      ...newSteps,
      ...otherSteps
    ];
    allSteps.forEach((step, idx) => {
      if (step.order !== idx) {
        onUpdateStep(step.id, { order: idx });
      }
    });
    onUpdateProduct({ steps: allSteps });
  };

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
                    className="w-4 h-4 cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsExpanded(false); }}
                  />
                ) : (
                  <UnfoldVertical
                    className={`w-4 h-4 cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 ${!isExpanded ? 'animate-pulse' : ''}`}
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event) => {
                    setActiveProductItemId(event.active?.id ? String(event.active.id) : null);
                  }}
                  onDragCancel={() => setActiveProductItemId(null)}
                  onDragOver={() => {}}
                  onDragMove={() => {}}
                  onDragEnd={(event) => {
                    setActiveProductItemId(null);
                    if (!isReadOnly) handleProductItemsDndEnd(event);
                  }}
                >
                  <SortableContext items={(product.productItems || []).map(item => item.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(product.productItems || []).map((productItem, index) => (
                        <SortableProductCard
                          key={productItem.id}
                          productItem={productItem}
                          index={index}
                          onClick={() => handleProductItemClick(productItem)}
                          isReadOnly={isReadOnly}
                          setShowDeleteConfirm={setShowDeleteConfirm}
                          handleProductItemClick={handleProductItemClick}
                          handleProductItemStatusChange={handleProductItemStatusChange}
                        />
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
                  </SortableContext>
                  {/* DragOverlay para visualização fluida do item arrastado */}
                  <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
                    {activeProductItemId ? (
                      (() => {
                        const draggingItem = (product.productItems || []).find(item => item.id === activeProductItemId);
                        if (!draggingItem) return null;
                        return (
                          <div style={{ opacity: 0.95 }}>
                            <SortableProductCard
                              productItem={draggingItem}
                              index={-1}
                              onClick={() => {}}
                              isReadOnly={true}
                              setShowDeleteConfirm={() => {}}
                              handleProductItemClick={() => {}}
                              handleProductItemStatusChange={() => {}}
                            />
                          </div>
                        );
                      })()
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>

            {/* Etapas do Funil - Accordion Hierárquico */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Etapas do Funil</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-300 dark:from-green-600 to-transparent ml-4"></div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      setIsTrafficOnly(false);
                      setPendingParentId(null); // Limpar o pendingParentId para criar etapa independente
                      setShowCreateStepModal(true);
                    }}
                    className="ml-4 flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Etapa</span>
                  </button>
                )}
              </div>

              {/* Accordion de Etapas Hierárquicas */}
              <div className="space-y-3">
                {parentSteps.map((parentStep, parentIndex) => {
                  const children = getChildrenOfParent(parentStep.id);
                  const isExpanded = expandedParentId === parentStep.id;
                  
                  // Verificar se há uma página pai vinculada (Página de Captura para Página de Vendas, ou vice-versa)
                  const linkedParentPage = product.steps.find(s => 
                    isParentCategory(s.type) && s.parentId === parentStep.id
                  );
                  
                  return (
                    <div key={parentStep.id} className="space-y-2">
                      {/* Etapa Pai - Compactada quando não expandida */}
                      {isExpanded ? (
                        // PAI EXPANDIDO - Grid completo com filhos
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {/* Página de Captura sempre vem ANTES */}
                          {(() => {
                            // Se parentStep é page (vendas) E linkedParentPage é captura, inverte a ordem
                            // Caso contrário, mantém ordem original (parentStep → linkedParentPage)
                            const shouldInvert = parentStep.type === 'page' && linkedParentPage?.type === 'capture';
                            
                            const firstPage = shouldInvert ? linkedParentPage : parentStep;
                            const secondPage = shouldInvert ? parentStep : linkedParentPage;
                            
                            return (
                              <>
                                {/* Primeira Página */}
                                <div className="relative">
                                  <StepNode
                                    step={firstPage}
                                    onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(firstPage.id, updates)}
                                    onDelete={isReadOnly ? () => {} : () => handleDeleteStepWithValidation(firstPage.id)}
                                    onEdit={() => handleStepEdit(firstPage)}
                                    isDarkMode={isDarkMode}
                                    isReadOnly={isReadOnly}
                                    isDashedBorder={true}
                                    className="h-full"
                                  />

                                  {/* Seta para segunda página ou primeiro filho */}
                                  {(secondPage || children.length > 0) && (
                                    <div className="hidden lg:flex absolute top-1/2 left-full transform -translate-y-1/2 z-10 items-center w-8">
                                      <div className="w-4 h-[2px] bg-teal-500"></div>
                                      <div className="bg-teal-500 rounded-full p-1 shadow-md flex-shrink-0 relative overflow-hidden ml-[-2px]">
                                        <div className="shimmer-bg absolute inset-0"></div>
                                        <ChevronsRight size={16} className="text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Segunda Página (se existir) */}
                                {secondPage && (
                                  <div className="relative">
                                    <StepNode
                                      step={secondPage}
                                      onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(secondPage.id, updates)}
                                      onDelete={isReadOnly ? () => {} : () => handleDeleteStepWithValidation(secondPage.id)}
                                      onEdit={() => handleStepEdit(secondPage)}
                                      isDarkMode={isDarkMode}
                                      isReadOnly={isReadOnly}
                                      isDashedBorder={true}
                                      className="h-full"
                                    />

                                    {/* Seta para primeiro filho */}
                                    {children.length > 0 && (
                                      <div className="hidden lg:flex absolute top-1/2 left-full transform -translate-y-1/2 z-10 items-center w-8">
                                        <div className="w-4 h-[2px] bg-teal-500"></div>
                                        <div className="bg-teal-500 rounded-full p-1 shadow-md flex-shrink-0 relative overflow-hidden ml-[-2px]">
                                          <div className="shimmer-bg absolute inset-0"></div>
                                          <ChevronsRight size={16} className="text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {/* Etapas Filhas - Lado a lado */}
                          {children.map((childStep, childIndex) => (
                            <div key={childStep.id} className="relative">
                              <StepNode
                                step={childStep}
                                onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(childStep.id, updates)}
                                onDelete={isReadOnly ? () => {} : () => handleDeleteStepWithValidation(childStep.id)}
                                onEdit={() => handleStepEdit(childStep)}
                                isDarkMode={isDarkMode}
                                isReadOnly={isReadOnly}
                                isDashedBorder={true}
                                className="h-full"
                              />

                              {/* Seta entre etapas filhas */}
                              {childIndex < children.length - 1 && (
                                <div className="hidden lg:flex absolute top-1/2 left-full transform -translate-y-1/2 z-10 items-center w-8">
                                  <div className="w-4 h-[2px] bg-teal-500"></div>
                                  <div className="bg-teal-500 rounded-full p-1 shadow-md flex-shrink-0 relative overflow-hidden ml-[-2px]">
                                    <div className="shimmer-bg absolute inset-0"></div>
                                    <ChevronsRight size={16} className="text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Card para adicionar nova etapa - dentro do grid expandido */}
                          {!isReadOnly && (
                            <div 
                              onClick={() => {
                                setIsTrafficOnly(false);
                                // Preferir Página de Vendas se existir, caso contrário usar Página de Captura
                                const preferredParentId = (() => {
                                  // Se parentStep é page (vendas), usar ela
                                  if (parentStep.type === 'page') return parentStep.id;
                                  // Se linkedParentPage é page (vendas), usar ela
                                  if (linkedParentPage?.type === 'page') return linkedParentPage.id;
                                  // Caso contrário, usar parentStep (que será captura)
                                  return parentStep.id;
                                })();
                                setPendingParentId(preferredParentId);
                                setShowCreateStepModal(true);
                              }}
                              className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group h-full"
                            >
                              <div className="bg-gray-200 dark:bg-gray-700 group-hover:bg-green-200 dark:group-hover:bg-green-800 rounded-full p-3 mb-2 transition-colors">
                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 font-medium text-sm text-center">
                                Adicionar Etapa
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // PAI COMPACTADO - Versão mini
                        <div
                          onClick={() => toggleParentExpansion(parentStep.id)}
                          className={`cursor-pointer transition-all duration-300 ${
                            isDarkMode
                              ? 'bg-gray-800 hover:bg-gray-750 border-gray-700'
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                          } border-2 border-dashed rounded-lg p-3 flex items-center justify-between`}
                        >
                          <div className="flex items-center space-x-3">
                            <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                            <div className="flex items-center space-x-2">
                              {React.createElement(stepTypes[parentStep.type]?.icon || Globe, {
                                className: 'w-5 h-5 text-green-600 dark:text-green-400'
                              })}
                              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {(() => {
                                  // Para páginas pai, mostra: "Tipo - Nome do Produto"
                                  const typeLabel = stepTypes[parentStep.type]?.label;
                                  let productName = '';
                                  
                                  if (parentStep.relatedProducts && parentStep.relatedProducts.length > 0) {
                                    const firstProduct = parentStep.relatedProducts[0];
                                    if (typeof firstProduct === 'string') {
                                      productName = firstProduct;
                                    } else if (firstProduct && typeof firstProduct === 'object' && 'name' in firstProduct) {
                                      productName = firstProduct.name;
                                    }
                                  }
                                  
                                  return productName ? `${typeLabel} - ${productName}` : typeLabel;
                                })()}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Clique para expandir
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Páginas Vazias (sem produtos) */}
                {orphanParentPages.length > 0 && (
                  <div className="mb-4">
                    <div className={`border-2 border-dashed rounded-lg p-4 ${
                      isDarkMode 
                        ? 'bg-red-900/20 border-red-700' 
                        : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                            Páginas Vazias - Sem Produtos ({orphanParentPages.length})
                          </h4>
                        </div>
                        {!isReadOnly && (
                          <button
                            onClick={() => {
                              // Deletar todas as páginas vazias
                              orphanParentPages.forEach(page => {
                                onDeleteStep(page.id);
                              });
                            }}
                            className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'bg-red-700 hover:bg-red-600 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Limpar Todas
                          </button>
                        )}
                      </div>
                      <p className={`text-xs mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        Estas páginas não têm produtos vinculados e não aparecem nos dropdowns. Delete-as para limpar seu funil.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orphanParentPages.map((orphanPage) => (
                          <div key={orphanPage.id} className="relative">
                            <StepNode
                              step={orphanPage}
                              onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(orphanPage.id, updates)}
                              onDelete={isReadOnly ? () => {} : () => onDeleteStep(orphanPage.id)}
                              onEdit={() => handleStepEdit(orphanPage)}
                              isDarkMode={isDarkMode}
                              isReadOnly={isReadOnly}
                              isDashedBorder={true}
                              className="h-full"
                            />
                            
                            {/* Badge de aviso */}
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
                              ✕
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapas Órfãs - Sem pai definido */}
                {orphanSteps.length > 0 && (
                  <div>
                    <div className={`border-2 border-dashed rounded-lg p-4 ${
                      isDarkMode 
                        ? 'bg-yellow-900/20 border-yellow-700' 
                        : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          Etapas sem Pai Definido ({orphanSteps.length})
                        </h4>
                      </div>
                      <p className={`text-xs mb-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Estas etapas precisam ser vinculadas a uma Página de Captura ou Página de Vendas. Clique no ícone de editar para configurar.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orphanSteps.map((orphanStep) => (
                          <div key={orphanStep.id} className="relative">
                            <StepNode
                              step={orphanStep}
                              onUpdate={isReadOnly ? () => {} : (updates) => onUpdateStep(orphanStep.id, updates)}
                              onDelete={isReadOnly ? () => {} : () => handleDeleteStepWithValidation(orphanStep.id)}
                              onEdit={() => handleStepEdit(orphanStep)}
                              isDarkMode={isDarkMode}
                              isReadOnly={isReadOnly}
                              isDashedBorder={true}
                              className="h-full"
                            />
                            
                            {/* Badge de aviso */}
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
                              !
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estratégias de Marketing */}
            <div>
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(event) => {
                  setActiveTrafficStepId(event.active?.id ? String(event.active.id) : null);
                }}
                onDragCancel={() => setActiveTrafficStepId(null)}
                onDragOver={() => {}}
                onDragMove={() => {}}
                onDragEnd={(event) => {
                  setActiveTrafficStepId(null);
                  handleTrafficStepsDndEnd(event);
                }}
              >
                <SortableContext items={trafficSteps.map(step => step.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                    {trafficSteps.map((step, index) => (
                      <SortableTrafficStepNode
                        key={step.id}
                        step={step}
                        index={index}
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
                    {trafficSteps.length === 0 && (
                      <div className="col-span-full text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma estratégia cadastrada</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
                <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
                  {activeTrafficStepId ? (
                    (() => {
                      const draggingStep = trafficSteps.find(step => step.id === activeTrafficStepId);
                      if (!draggingStep) return null;
                      return (
                        <div style={{ opacity: 0.95 }}>
                          <StepNode
                            step={draggingStep}
                            onUpdate={() => {}}
                            onDelete={() => {}}
                            onEdit={() => {}}
                            isDarkMode={isDarkMode}
                            isReadOnly={true}
                            isDashedBorder={false}
                            className="h-full"
                            listeners={undefined}
                            attributes={undefined}
                          />
                        </div>
                      );
                    })()
                  ) : null}
                </DragOverlay>
              </DndContext>
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
            onClose={() => {
              setShowCreateStepModal(false);
              setPendingParentId(null); // Limpar o pendingParentId ao fechar
            }}
            onSave={(stepData) => {
              handleCreateStep(stepData);
              setShowCreateStepModal(false);
              setPendingParentId(null); // Limpar o pendingParentId após salvar
            }}
            isCreating={true}
            isTrafficOnly={isTrafficOnly}
            isDarkMode={isDarkMode}
            availableParentSteps={(() => {
              // Filtrar apenas páginas pai que têm produtos vinculados
              const parents = product.steps.filter(s => 
                isParentCategory(s.type) && 
                s.relatedProducts && 
                s.relatedProducts.length > 0
              );
              console.log('🔍 Etapas pai disponíveis (com produtos):', parents.map(p => ({ id: p.id, type: p.type, name: p.name, products: p.relatedProducts })));
              return parents;
            })()}
            initialParentId={pendingParentId}
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
            availableParentSteps={(() => {
              // Filtrar apenas páginas pai que têm produtos vinculados (exceto a própria etapa sendo editada)
              const parents = product.steps.filter(s => 
                isParentCategory(s.type) && 
                s.id !== selectedStep.id &&
                s.relatedProducts && 
                s.relatedProducts.length > 0
              );
              console.log('🔍 Etapas pai disponíveis para edição (com produtos):', parents.map(p => ({ id: p.id, type: p.type, name: p.name, products: p.relatedProducts })));
              return parents;
            })()}
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

        {/* Modal de confirmação de exclusão em cascata */}
        {!isReadOnly && cascadeDeleteModal.isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
            onClick={() => setCascadeDeleteModal({ isOpen: false, stepId: null, stepName: '', childrenCount: 0 })}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Exclusão em Cascata
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    A etapa <span className="font-bold">{cascadeDeleteModal.stepName}</span> possui{' '}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {cascadeDeleteModal.childrenCount} etapa{cascadeDeleteModal.childrenCount > 1 ? 's' : ''} filha{cascadeDeleteModal.childrenCount > 1 ? 's' : ''}
                    </span>.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ao excluir esta etapa pai, todas as etapas filhas também serão excluídas permanentemente.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCascadeDeleteModal({ isOpen: false, stepId: null, stepName: '', childrenCount: 0 })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCascadeDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Excluir Tudo</span>
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