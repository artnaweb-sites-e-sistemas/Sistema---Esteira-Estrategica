import React, { useState } from 'react';
import { Step, StepStatus, StepType } from '../types';
import { stepTypes, marketingStrategies } from '../data/stepTypes';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Edit3, 
  ExternalLink, 
  StickyNote,
  Trash2,
  Eye,
  Pause,
  Lock,
  Plus,
  Megaphone,
  Globe,
  Grip,
  CreditCard
} from 'lucide-react';
import { StepDetailsPopup } from './StepDetailsPopup';
import { MetaAdsIcon } from '../icons/MetaAdsIcon';
import { GoogleAdsIcon } from '../icons/GoogleAdsIcon';

interface StepNodeProps {
  step: Step;
  onUpdate: (updates: Partial<Step>) => void;
  onDelete: () => void;
  onEdit: () => void;
  isDarkMode: boolean;
  isReadOnly?: boolean; // Nova prop para modo somente leitura
  isDashedBorder?: boolean; // Nova prop para controlar a borda listrada
  className?: string; // Permitir que a prop className seja passada
  listeners?: any;
  attributes?: any;
  isDragging?: boolean;
}

const statusConfig = {
  todo: {
    icon: Circle,
    color: 'text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-600'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-600'
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-600'
  },
  paused: {
    icon: Pause,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-600'
  }
};

const statusLabels = {
  todo: 'A fazer',
  'in-progress': 'Em andamento',
  completed: 'Concluído',
  paused: 'Pausado'
};

export const StepNode: React.FC<StepNodeProps> = ({ 
  step, 
  onUpdate, 
  onDelete, 
  onEdit,
  isDarkMode, 
  isReadOnly = false,
  isDashedBorder = false,
  className,
  listeners,
  attributes,
  isDragging
}) => {
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const config = statusConfig[step.status];
  const StatusIcon = config.icon;
  const stepConfig = stepTypes[step.type] || stepTypes['custom'];
  const TypeIcon = stepConfig.icon;

  const isTrafficStep = step.type === 'traffic';

  // Determine icon based on step type or marketing strategy
  const StepIcon = isTrafficStep
    ? (() => {
        if (!step.notes) return Globe;
        if (step.notes === 'custom') return Megaphone;
        const strategy = marketingStrategies.find(s => s.id === step.notes);
        return strategy?.icon || Globe;
      })()
    : step.type === 'custom'
      ? Megaphone
      : (stepTypes[step.type] || stepTypes['custom']).icon || Plus;

  // Função para obter o ícone da estratégia de marketing
  const getStrategyIcon = (strategyId: string) => {
    if (strategyId === 'custom') return Megaphone;
    const strategy = marketingStrategies.find(s => s.id === strategyId);
    return strategy?.icon || Globe;
  };

  const handleStatusChange = (status: StepStatus, e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.stopPropagation(); // Impedindo a propagação do evento
    onUpdate({ status });
  };

  const handleViewDetails = () => {
    setShowDetailsPopup(true);
  };

  const handleEdit = () => {
    if (isReadOnly) return;
    setShowDetailsPopup(false);
    onEdit();
  };

  const handleSaveEdit = (updates: Partial<Step>) => {
    if (isReadOnly) return;
    onUpdate(updates);
  };

  const getStrategyName = (strategyId: string) => {
    const strategy = marketingStrategies.find(s => s.id === strategyId);
    return strategy?.name || strategyId;
  };

  // Função para obter as classes de cor corretas para os produtos relacionados
  const getProductRelatedColorClasses = (type: StepType) => {
    if (type === 'upsell' || type === 'crosssell') {
      return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
    }
    if (type === 'membership' || type === 'mentoring' || type === 'subscription' || type === 'custom') {
      return 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300';
    }
    return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border ${isTrafficStep ? config.border : 'border-emerald-300 dark:border-emerald-600'} ${isDashedBorder ? 'border-dashed' : ''} p-4 shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer h-full ${listeners ? (isDragging ? 'cursor-grabbing' : 'cursor-pointer') : ''}`}
        {...(listeners ? listeners : {})}
        {...(attributes ? attributes : {})}
        onClick={handleViewDetails}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${stepConfig.color}`}>
              {step.type === 'traffic' ? (
                (() => {
                  const StrategyIcon = getStrategyIcon(step.notes || '');
                  return <StrategyIcon className="w-4 h-4" />;
                })()
              ) : (
                <StepIcon className="w-4 h-4" />
              )}
            </div>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex items-center space-x-1 transition-opacity">
            {/* Indicador de somente leitura */}
            {isReadOnly && (
              <div className="p-1 text-gray-400" title="Somente leitura">
                <Lock className="w-3 h-3" />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="p-1 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
              title="Ver detalhes"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {!isReadOnly && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 text-gray-400 hover:!text-red-500 dark:text-gray-500 dark:hover:!text-red-500 transition-colors duration-200 relative z-10"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 hover:text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>

        <div onClick={handleViewDetails} className="flex-grow flex flex-col h-full">
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 leading-tight break-words">
              {['capture', 'page'].includes(step.type) 
                ? stepTypes[step.type]?.label 
                : step.type === 'traffic' && step.notes
                  ? getStrategyName(step.notes)
                  : (step.name || stepTypes[step.type]?.label)
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 leading-relaxed">{step.description}</p>

            {/* Mostrar produtos de upsell para checkout */}
            {step.type === 'checkout' && step.upsellProducts && step.upsellProducts.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Bumps:</p>
                <div className="space-y-1">
                  {step.upsellProducts.slice(0, 2).map((product, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded mr-1">
                      {product}
                    </span>
                  ))}
                  {step.upsellProducts.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{step.upsellProducts.length - 2} mais</span>
                  )}
                </div>
              </div>
            )}

            {/* Mostrar produtos relacionados para page, upsell, membership, subscription, mentoring, crosssell, capture */}
            {['page', 'upsell', 'membership', 'subscription', 'mentoring', 'crosssell', 'capture', 'custom'].includes(step.type) && step.relatedProducts && step.relatedProducts.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {step.type === 'page' ? 'Produtos:' :
                   step.type === 'upsell' ? 'Upsells:' :
                   step.type === 'membership' ? 'Produtos para Adquirir:' :
                   step.type === 'subscription' ? 'Produtos para Adquirir:' :
                   step.type === 'mentoring' ? 'Produtos para Adquirir:' :
                   step.type === 'crosssell' ? 'Down-sell:' :
                   step.type === 'capture' ? 'Produtos da Página:' :
                   'Produtos para Adquirir:'}
                </p>
                <div className="space-y-1">
                  {step.relatedProducts.slice(0, 2).map((product, index) => (
                    <span key={index} className={`inline-block px-2 py-1 ${getProductRelatedColorClasses(step.type)} text-xs rounded mr-1`}>
                      {product}
                    </span>
                  ))}
                  {step.relatedProducts.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{step.relatedProducts.length - 2} mais</span>
                  )}
                </div>
              </div>
            )}

            {step.link && (
              <a
                href={step.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs mb-3 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver link</span>
              </a>
            )}

            {/* Exibir o valor do produto de down-sell no card, se existir */}
            {step.type === 'crosssell' && typeof step.downsellValue === 'number' && !isNaN(step.downsellValue) && (
              <div className="flex items-center space-x-2 mt-1">
                <CreditCard className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(step.downsellValue)}
                </span>
              </div>
            )}
          </div>

          {/* Observações - fixas na parte inferior */}
          {step.type !== 'traffic' && step.notes && (
            <div className="flex items-start space-x-2 mt-auto mb-2">
              <StickyNote className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">{step.notes}</p>
            </div>
          )}

          {/* Status - sempre visível, mas sem interação em modo somente leitura */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(['todo', 'in-progress', 'completed', 'paused'] as StepStatus[]).map((status) => (
              <button
                key={status}
                onClick={(e) => handleStatusChange(status, e)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  step.status === status
                    ? `${statusConfig[status].bg} ${statusConfig[status].color} border ${statusConfig[status].border}`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <StepDetailsPopup
        step={step}
        isOpen={showDetailsPopup}
        onClose={() => setShowDetailsPopup(false)}
        onEdit={handleEdit}
        isDarkMode={isDarkMode}
      />
    </>
  );
};