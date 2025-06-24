import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
  X, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Link as LinkIcon
} from 'lucide-react';
import ReactDOM from 'react-dom';
import { productBlockTypes } from '../data/productBlockTypes';
import '../styles/modalStyles.css';
import UnsavedChangesModal from './UnsavedChangesModal';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
  isCreating?: boolean;
  isDarkMode: boolean;
}

const initialFormData = {
  type: 'entryProduct',
  description: '',
  detailedDescription: '',
  link: '',
  notes: '',
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  isCreating = false,
  isDarkMode
}) => {
  const [formData, setFormData] = useState({
    type: product?.type || '',
    description: product?.description || '',
    detailedDescription: product?.detailedDescription || '',
    link: product?.link || '',
    notes: product?.notes || '',
  });
  const [initialData, setInitialData] = useState({
    type: product?.type || '',
    description: product?.description || '',
    detailedDescription: product?.detailedDescription || '',
    link: product?.link || '',
    notes: product?.notes || '',
  });
  const [isCustomType, setIsCustomType] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    if (isCreating && isOpen) {
      setFormData(initialFormData);
      setInitialData(initialFormData);
      setIsCustomType(false);
    } else if (product && isOpen) {
      const data = {
        type: product.type || '',
        description: product.description || '',
        detailedDescription: product.detailedDescription || '',
        link: product.link || '',
        notes: product.notes || '',
      };
      setFormData(data);
      setInitialData(data);
      setIsCustomType(!Object.keys(productBlockTypes).includes(product.type || ''));
    }
  }, [isCreating, isOpen, product]);

  const isDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSave = () => {
    const typeToSave = isCustomType && !formData.type.trim() ? 'Personalizado' : formData.type;
    onSave({ ...formData, type: typeToSave });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      if (isDirty()) {
        setShowUnsavedModal(true);
      } else {
        onClose();
      }
    }
  };

  const handleDiscard = () => {
    setShowUnsavedModal(false);
    onClose();
  };

  const handleSaveFromModal = () => {
    setShowUnsavedModal(false);
    handleSave();
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('product-detailed-description') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = (formData.detailedDescription || '').substring(start, end);
    const newText = (formData.detailedDescription || '').substring(0, start) + 
                   before + selectedText + after + 
                   (formData.detailedDescription || '').substring(end);
    
    setFormData(prev => ({ ...prev, detailedDescription: newText }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isCreating ? 'Criar Novo Bloco' : 'Editar Bloco'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo do Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo *
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(productBlockTypes).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, type: key }));
                      setIsCustomType(key === 'custom');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      (formData.type === key || (key === 'custom' && isCustomType))
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`p-1 rounded ${config.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{config.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{config.description}</p>
                  </button>
                );
              })}
            </div>

            {isCustomType && (
              <div className="mt-4">
                <label htmlFor="custom-product-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Bloco Personalizado *
                </label>
                <input
                  type="text"
                  id="custom-product-type"
                  value={formData.type === 'custom' ? '' : formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Insira aqui o nome do seu Bloco"
                />
              </div>
            )}
          </div>

          {/* Descrição Resumida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição Resumida
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Breve descrição do produto"
            />
          </div>

          {/* Descrição Detalhada com Markdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição Detalhada
            </label>
            
            {/* Toolbar de Markdown */}
            <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                title="Negrito"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*')}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                title="Itálico"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('<u>', '</u>')}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                title="Sublinhado"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('\n- ', '')}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                title="Lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[', '](url)')}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            <textarea
              id="product-detailed-description"
              value={formData.detailedDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, detailedDescription: e.target.value }))}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'b') {
                  e.preventDefault();
                  insertMarkdown('**', '**');
                }
              }}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Insira seu texto aqui..."
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link (opcional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://exemplo.com"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Observações adicionais..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!(formData.type || '').trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Criar Bloco' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleSaveFromModal}
        onDiscard={handleDiscard}
        onClose={() => setShowUnsavedModal(false)}
        isDarkMode={isDarkMode}
      />
    </div>,
    document.body
  );
};