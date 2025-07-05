import React from 'react';
import { Step } from '../types';
import { stepTypes, marketingStrategies } from '../data/stepTypes';
import {
  X,
  ExternalLink,
  Edit3,
  Globe,
  Mail,
  MessageCircle,
  Video,
  Calendar,
  Plus as PlusIcon,
  Megaphone,
} from 'lucide-react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MetaAdsIcon } from '../icons/MetaAdsIcon';
import { GoogleAdsIcon } from '../icons/GoogleAdsIcon';

// Mapeamento de todos os ícones disponíveis
const iconMap: { [key: string]: React.ElementType } = {
  Globe: Globe,
  Mail: Mail,
  MessageCircle: MessageCircle,
  Video: Video,
  Calendar: Calendar,
  PlusIcon: PlusIcon,
  MetaAdsIcon: MetaAdsIcon,
  GoogleAdsIcon: GoogleAdsIcon,
  // Adicione outros ícones do lucide-react ou personalizados conforme necessário
};

interface StepDetailsPopupProps {
  step: Step;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  isDarkMode: boolean;
}

export const StepDetailsPopup: React.FC<StepDetailsPopupProps> = ({
  step,
  isOpen,
  onClose,
  onEdit,
  isDarkMode
}) => {
  if (!isOpen) return null;

  const stepConfig = stepTypes[step.type];

  const getStrategyName = (strategyId: string) => {
    const strategy = marketingStrategies.find(s => s.id === strategyId);
    return strategy?.name || strategyId;
  };

  // Determine the correct icon and color for the step type or marketing strategy
  let headerIconComponent: React.ElementType;
  let headerBgColor: string;
  let headerIconColor: string;
  let headerLabel: string;

  // Extract background and text colors from stepConfig.color
  const [bgColorClass, textColorClass] = stepConfig.color.split(' ');

  if (step.type === 'traffic') {
    if (step.notes === 'custom') {
      headerIconComponent = Megaphone;
      headerBgColor = bgColorClass;
      headerIconColor = textColorClass;
      headerLabel = 'Estratégia Personalizada';
    } else {
      const strategyConfig = marketingStrategies.find(s => s.id === step.notes);
      headerIconComponent = strategyConfig?.icon || Globe;
      headerBgColor = bgColorClass;
      headerIconColor = textColorClass;
      headerLabel = strategyConfig?.name || 'Estratégia de Marketing';
    }
  } else {
    headerIconComponent = stepConfig.icon;
    headerBgColor = bgColorClass;
    headerIconColor = textColorClass;
    headerLabel = stepConfig.label;
  }

  const HandleHeaderIcon = headerIconComponent;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${headerBgColor}`}>
                <HandleHeaderIcon className={`w-5 h-5 ${headerIconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{headerLabel}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Descrição Resumida */}
          {step.description && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descrição</h4>
              <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
            </div>
          )}

          {/* Estratégia de Marketing */}
          {step.type === 'traffic' && step.notes && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estratégia de Marketing</h4>
              <p className="text-gray-700 dark:text-gray-300">{getStrategyName(step.notes)}</p>
            </div>
          )}

          {/* Produtos de Upsell */}
          {step.type === 'checkout' && step.upsellProducts && step.upsellProducts.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Produtos de Order Bump</h4>
              <ul className="space-y-1">
                {step.upsellProducts.map((product, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Produtos Relacionados */}
          {['page', 'upsell', 'membership', 'mentoring', 'subscription'].includes(step.type) && step.relatedProducts && step.relatedProducts.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {step.type === 'page' ? 'Produtos da Página' :
                 step.type === 'upsell' ? 'Produtos de Upsell' :
                 'Produtos para Adquirir'}
              </h4>
              <ul className="space-y-1">
                {step.relatedProducts.map((product, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Descrição Detalhada */}
          {step.detailedDescription && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detalhes</h4>
              <div className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none dark:prose-invert 
                prose-headings:font-medium 
                prose-p:my-4 
                prose-p:leading-relaxed
                prose-ul:my-2 
                prose-ol:my-2
                prose-li:my-1 
                prose-li:leading-relaxed
                prose-li:marker:text-gray-500 
                dark:prose-li:marker:text-gray-400
                prose-pre:my-4
                prose-blockquote:my-4
                prose-blockquote:border-l-4
                prose-blockquote:border-gray-300
                dark:prose-blockquote:border-gray-600
                prose-blockquote:pl-4
                prose-blockquote:italic
                prose-hr:my-6
                prose-hr:border-gray-300
                dark:prose-hr:border-gray-600
                [&>*+*]:mt-4
                [&>p+p]:mt-4
                [&>ul+ul]:mt-4
                [&>ol+ol]:mt-4
                [&>h1+h2]:mt-6
                [&>h2+h3]:mt-4
                [&>h3+h4]:mt-4
                [&>h4+h5]:mt-4
                [&>h5+h6]:mt-4
                [&>h1]:mt-8
                [&>h2]:mt-6
                [&>h3]:mt-4
                [&>h4]:mt-4
                [&>h5]:mt-4
                [&>h6]:mt-4
                [&>p]:whitespace-pre-line
                [&>p+ul]:mt-2
                [&>p+ol]:mt-2
                [&>ul+p]:mt-4
                [&>ol+p]:mt-4
              ">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({node, ...props}) => (
                      <a 
                        {...props} 
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    ul: ({node, ...props}) => (
                      <ul {...props} className="list-disc list-outside space-y-1 pl-4" />
                    ),
                    ol: ({node, ...props}) => (
                      <ol {...props} className="list-decimal list-outside space-y-1 pl-4" />
                    ),
                    li: ({node, ...props}) => (
                      <li {...props} className="my-1" />
                    ),
                    p: ({node, ...props}) => (
                      <p {...props} className="whitespace-pre-line" />
                    ),
                    br: () => <br className="my-2" />
                  }}
                >
                  {step.detailedDescription}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Link */}
          {step.link && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Link</h4>
              <a
                href={step.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir link</span>
              </a>
            </div>
          )}

          {/* Observações */}
          {step.type !== 'traffic' && step.notes && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Observações</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{step.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};