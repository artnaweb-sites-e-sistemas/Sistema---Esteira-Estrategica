import React, { useEffect } from 'react';
import { Product, ProductItem } from '../types';
import { productBlockTypes } from '../data/productBlockTypes';
import { X, ExternalLink, Edit3, Package, BookOpen, Play, Gift, Users, MessageCircle, Send, CreditCard } from 'lucide-react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/modalStyles.css';

interface ProductDetailsPopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  isDarkMode: boolean;
  selectedProductItem: ProductItem | null;
}

export const ProductDetailsPopup: React.FC<ProductDetailsPopupProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  isDarkMode,
  selectedProductItem
}) => {
  if (!isOpen) return null;

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1">$1</ul>')
      .replace(/\n/g, '<br>');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      onClose();
    }
  };

  // Determine the correct icon and color for the product type
  const productTypeConfig = Object.entries(productBlockTypes).find(([key, config]) => 
    config.label === product.type || key === product.type
  )?.[1]; // Get the value (config object) from the found entry
  const ProductTypeIcon = productTypeConfig?.icon || Package; // Fallback to Package if not found
  const productTypeBgColor = productTypeConfig?.color || 'bg-blue-100'; // Use blue as default background
  const productTypeIconColor = productTypeConfig?.color.replace('bg-', 'text-') || 'text-blue-600'; // Use blue as default icon color

  // Se tiver um item específico selecionado, mostra os detalhes dele
  if (selectedProductItem) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4 will-change-transform"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${productTypeBgColor}`}>
                  <ProductTypeIcon className={`w-5 h-5 ${productTypeIconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{productTypeConfig?.label || product.type}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{product.name}</p>
                </div>
              </div>

              {/* Valor do produto */}
              {selectedProductItem.value && (
                <div className="mt-4">
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProductItem.value)}
                  </span>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Promessa */}
            {selectedProductItem.promessa && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Promessa</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                  {selectedProductItem.promessa}
                </p>
              </div>
            )}

            {/* Módulos */}
            {selectedProductItem.modules && selectedProductItem.modules.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Módulos
                </h4>
                <ul className="space-y-2">
                  {selectedProductItem.modules.map((module, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></span>
                      <span className="break-words">{module.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Aulas */}
            {selectedProductItem.lessons && selectedProductItem.lessons.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Play className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Aulas
                </h4>
                <ul className="space-y-2">
                  {selectedProductItem.lessons.map((lesson, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                      <span className="break-words">{lesson.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bônus */}
            {selectedProductItem.bonuses && selectedProductItem.bonuses.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Bônus
                </h4>
                <ul className="space-y-2">
                  {selectedProductItem.bonuses.map((bonus, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 mt-1"></span>
                      <span className="break-words">{bonus.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grupos */}
            {(selectedProductItem.whatsappGroup || selectedProductItem.telegramGroup) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Grupos</h4>
                <div className="space-y-2">
                  {selectedProductItem.whatsappGroup && (
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>WhatsApp: {selectedProductItem.whatsappGroup}</span>
                    </div>
                  )}
                  {selectedProductItem.telegramGroup && (
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>Telegram: {selectedProductItem.telegramGroup}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Afiliados */}
            {selectedProductItem.hasAffiliates && (
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Users className="w-4 h-4" />
                <span>Programa de Afiliados disponível</span>
              </div>
            )}

            {/* Observações */}
            {selectedProductItem.notes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Observações</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedProductItem.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se não tiver item específico, mostra os detalhes do produto principal
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${productTypeBgColor}`}>
                <ProductTypeIcon className={`w-5 h-5 ${productTypeIconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{productTypeConfig?.label || product.type}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{product.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
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

        <div className="p-6 space-y-6">
          {/* Promessa do produto principal */}
          {product.promessa && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Promessa</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {product.promessa}
              </p>
            </div>
          )}

          {/* Descrição Resumida */}
          {product.description && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descrição</h4>
              <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
            </div>
          )}

          {/* Descrição Detalhada */}
          {product.detailedDescription && (
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
                  {product.detailedDescription}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Link */}
          {product.link && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Link</h4>
              <a
                href={product.link}
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
          {product.notes && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Observações</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{product.notes}</p>
            </div>
          )}

          {/* Produtos */}
          {product.productItems && product.productItems.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Produtos</h4>
              <div className="space-y-3">
                {product.productItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Com Afiliados */}
          {product.productItems && product.productItems.some(item => item.hasAffiliates) && (
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
              <span>Programa de Afiliados disponível</span>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};