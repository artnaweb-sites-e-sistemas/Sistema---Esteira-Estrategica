import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Step, StepType } from '../types';
import { stepTypes, marketingStrategies } from '../data/stepTypes';
import { 
  X, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  Package,
  BookOpen,
  Play,
  Gift,
  MessageCircle,
  Send,
  Users,
  GripVertical
} from 'lucide-react';
import '../styles/modalStyles.css';
import UnsavedChangesModal from './UnsavedChangesModal';
import { CurrencyInput } from 'react-currency-mask';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StepDetailsModalProps {
  step: Step | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: Partial<Step>) => void;
  isCreating?: boolean;
  isTrafficOnly?: boolean; // Para mostrar apenas estratégias de marketing
  isDarkMode: boolean;
}

// Tipagem para produto relacionado
interface RelatedProduct {
  id: string;
  name: string;
}

// Estado local: tipagem explícita para RelatedProduct[]
interface StepFormData {
  name: string;
  description: string;
  detailedDescription: string;
  type: StepType;
  link: string;
  notes: string;
  upsellProducts: string[];
  relatedProducts: RelatedProduct[];
  isCustom: boolean;
  downsellValue?: number;
}

export const StepDetailsModal: React.FC<StepDetailsModalProps> = ({
  step,
  isOpen,
  onClose,
  onSave,
  isCreating = false,
  isTrafficOnly = false,
  isDarkMode
}) => {
  const toProductObjArray = (arr: any): RelatedProduct[] => {
    if (!arr || (Array.isArray(arr) && arr.length === 0)) return [];
    if (Array.isArray(arr) && typeof arr[0] === 'object') return arr as RelatedProduct[];
    return arr.map((name: string) => ({ id: crypto.randomUUID(), name }));
  };

  const [formData, setFormData] = useState<StepFormData>({
    name: step?.name || '',
    description: step?.description || '',
    detailedDescription: step?.detailedDescription || '',
    type: (step?.type as StepType) || (isTrafficOnly ? 'traffic' : 'page'),
    link: step?.link || '',
    notes: step?.notes || '',
    upsellProducts: step?.type === 'checkout' ? (step?.upsellProducts || []) : [],
    relatedProducts: toProductObjArray(step?.relatedProducts),
    isCustom: step?.isCustom || false,
    downsellValue: step?.type === 'crosssell' && typeof step?.downsellValue === 'number' ? step.downsellValue : undefined
  });
  const [initialData, setInitialData] = useState<StepFormData>({
    name: step?.name || '',
    description: step?.description || '',
    detailedDescription: step?.detailedDescription || '',
    type: (step?.type as StepType) || (isTrafficOnly ? 'traffic' : 'page'),
    link: step?.link || '',
    notes: step?.notes || '',
    upsellProducts: step?.type === 'checkout' ? (step?.upsellProducts || []) : [],
    relatedProducts: toProductObjArray(step?.relatedProducts),
    isCustom: step?.isCustom || false,
    downsellValue: step?.type === 'crosssell' && typeof step?.downsellValue === 'number' ? step.downsellValue : undefined
  });
  const [selectedStrategy, setSelectedStrategy] = useState(
    step?.type === 'traffic' ? (step?.notes || 'facebook-ads') : 'facebook-ads'
  );
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const downsellInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (isCreating && isOpen) {
      const data: StepFormData = {
        name: '',
        description: '',
        detailedDescription: '',
        type: (isTrafficOnly ? 'traffic' : 'page') as StepType,
        link: '',
        notes: '',
        upsellProducts: [],
        relatedProducts: [],
        isCustom: false,
        downsellValue: undefined
      };
      setFormData(data);
      setInitialData(data);
      setSelectedStrategy('facebook-ads');
    } else if (step && isOpen) {
      const data: StepFormData = {
        name: step.name || '',
        description: step.description || '',
        detailedDescription: step.detailedDescription || '',
        type: (step.type as StepType) || (isTrafficOnly ? 'traffic' : 'page'),
        link: step.link || '',
        notes: step.notes || '',
        upsellProducts: step.type === 'checkout' ? (step.upsellProducts || []) : [],
        relatedProducts: toProductObjArray(step.relatedProducts),
        isCustom: step.isCustom || false,
        downsellValue: step.type === 'crosssell' && typeof step.downsellValue === 'number' ? step.downsellValue : undefined
      };
      setFormData(data);
      setInitialData(data);
      if (step.type === 'traffic') {
        setSelectedStrategy(step.notes || 'facebook-ads');
      }
    }
  }, [isCreating, isOpen, step, isTrafficOnly]);

  const isDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSave = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const { downsellValue: formDownsellValue, relatedProducts, ...restFormData } = formData;
    let dataToSave: Partial<Step> = { ...restFormData };
    if (formData.type === 'crosssell') {
      dataToSave.downsellValue = typeof formDownsellValue === 'number' && !isNaN(formDownsellValue) && formDownsellValue > 0 ? formDownsellValue : undefined;
      if (formData.relatedProducts.length > 1) {
        dataToSave.relatedProducts = [formData.relatedProducts[0].name];
      } else {
        dataToSave.relatedProducts = formData.relatedProducts.map((p: RelatedProduct) => p.name);
      }
    } else {
      dataToSave.relatedProducts = formData.relatedProducts.map((p: RelatedProduct) => p.name);
    }
    onSave(dataToSave);
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

  const addUpsellProduct = () => {
    if (formData.type !== 'checkout') return;
    setFormData(prev => ({
      ...prev,
      upsellProducts: [...prev.upsellProducts, '']
    }));
  };

  const removeUpsellProduct = (index: number) => {
    if (formData.type !== 'checkout') return;
    setFormData(prev => ({
      ...prev,
      upsellProducts: prev.upsellProducts.filter((_, i) => i !== index)
    }));
  };

  const updateUpsellProduct = (index: number, value: string) => {
    if (formData.type !== 'checkout') return;
    setFormData(prev => ({
      ...prev,
      upsellProducts: prev.upsellProducts.map((product, i) => i === index ? value : product)
    }));
  };

  const addRelatedProduct = () => {
    if (formData.type === 'crosssell' && formData.relatedProducts.length >= 1) return;
    setFormData(prev => ({
      ...prev,
      relatedProducts: [...(prev.relatedProducts as RelatedProduct[]), { id: crypto.randomUUID(), name: '' }]
    }));
  };

  const removeRelatedProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedProducts: (prev.relatedProducts as RelatedProduct[]).filter((_: RelatedProduct, i: number) => i !== index)
    }));
  };

  const updateRelatedProduct = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      relatedProducts: (prev.relatedProducts as RelatedProduct[]).map((product: RelatedProduct, i: number) => i === index ? { ...product, name: value } : product)
    }));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('detailed-description') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.detailedDescription.substring(start, end);
    const newText = formData.detailedDescription.substring(0, start) + 
                   before + selectedText + after + 
                   formData.detailedDescription.substring(end);
    
    setFormData(prev => ({ ...prev, detailedDescription: newText }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const getProductFieldLabel = () => {
    if (formData.type === 'crosssell') return 'Produto de Down-sell';
    if (formData.type === 'custom') return 'Produtos da Etapa';
    return formData.type === 'page' ? 'Produtos da Página' : 'Produtos para Adquirir';
  };

  const getProductItemId = (product: RelatedProduct) => product.id;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFormData(prev => {
      const oldIndex = (prev.relatedProducts as RelatedProduct[]).findIndex((product: RelatedProduct) => getProductItemId(product) === active.id);
      const newIndex = (prev.relatedProducts as RelatedProduct[]).findIndex((product: RelatedProduct) => getProductItemId(product) === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return {
        ...prev,
        relatedProducts: arrayMove(prev.relatedProducts as RelatedProduct[], oldIndex, newIndex)
      };
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <form 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl custom-scrollbar"
        onClick={e => e.stopPropagation()}
        onSubmit={handleSave}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isCreating 
                ? (isTrafficOnly ? 'Criar Nova Estratégia' : 'Criar Nova Etapa')
                : (isTrafficOnly ? 'Editar Estratégia' : 'Editar Etapa')
              }
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo da Etapa/Estratégia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isTrafficOnly ? 'Estratégia de Marketing *' : 'Categoria da Etapa *'}
            </label>
            
            {isTrafficOnly ? (
              // Mostrar apenas estratégias de marketing
              <div className="grid grid-cols-2 gap-3">
                {marketingStrategies.map((strategy) => {
                  const IconComponent = strategy.icon;
                  return (
                    <button
                      key={strategy.id}
                      type="button"
                      onClick={() => {
                        setSelectedStrategy(strategy.id);
                        setFormData(prev => ({ ...prev, type: 'traffic' }));
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedStrategy === strategy.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{strategy.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{strategy.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Mostrar categorias de etapas (exceto traffic)
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(stepTypes)
                  .filter(([key]) => key !== 'traffic')
                  .map(([key, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: key as StepType }))}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          formData.type === key
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
            )}
          </div>

          {/* Nome personalizado apenas para etapas custom */}
          {((formData.type === 'custom' && !isTrafficOnly) || (selectedStrategy === 'custom' && isTrafficOnly)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Personalizado *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={isTrafficOnly ? "Ex: Parcerias com Influencers" : "Ex: Webinar de Apresentação"}
              />
            </div>
          )}

          {/* Produtos de Upsell (apenas para checkout) */}
          {formData.type === 'checkout' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produtos de Order Bump
              </label>
              <div className="space-y-3">
                {formData.upsellProducts.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Nenhum produto adicionado. Clique no botão abaixo para adicionar.
                  </p>
                )}
                {formData.upsellProducts.map((product, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={product}
                      onChange={(e) => updateUpsellProduct(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Nome do produto de order bump"
                    />
                    <button
                      type="button"
                      onClick={() => removeUpsellProduct(index)}
                      className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUpsellProduct}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Produto</span>
                </button>
              </div>
            </div>
          )}

          {/* Produtos Relacionados */}
          {['page', 'upsell', 'membership', 'subscription', 'mentoring', 'custom', 'capture', 'crosssell'].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.type === 'crosssell' ? 'Produto de Down-sell' : getProductFieldLabel()}
              </label>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={(formData.relatedProducts as RelatedProduct[]).map(getProductItemId)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {(formData.relatedProducts as RelatedProduct[]).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Nenhum produto adicionado. Clique no botão abaixo para adicionar.
                      </p>
                    )}
                    {(formData.relatedProducts as RelatedProduct[]).map((product: RelatedProduct, index: number) => {
                      const itemId = getProductItemId(product);
                      if (formData.type === 'crosssell') {
                        return (
                          <div key={itemId} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateRelatedProduct(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Nome do Produto"
                            />
                            <button
                              type="button"
                              onClick={() => removeRelatedProduct(index)}
                              className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <SortableProductInput
                          key={itemId}
                          id={itemId}
                          index={index}
                          value={product.name}
                          onChange={updateRelatedProduct}
                          onRemove={removeRelatedProduct}
                          canRemove={true}
                        />
                      );
                    })}
                    <button
                      type="button"
                      onClick={addRelatedProduct}
                      disabled={formData.type === 'crosssell' && formData.relatedProducts.length >= 1}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        formData.type === 'crosssell' && formData.relatedProducts.length >= 1
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Produto</span>
                    </button>
                  </div>
                </SortableContext>
              </DndContext>
              {/* Campo de valor para down-sell */}
              {formData.type === 'crosssell' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor do Produto de Down-sell (R$)</label>
                  <CurrencyInput
                    value={formData.downsellValue}
                    onChangeValue={(_, originalValue) => setFormData(prev => ({ ...prev, downsellValue: originalValue === '' ? undefined : Number(originalValue) }))}
                    currency="BRL"
                    locale="pt-BR"
                    hideSymbol={false}
                    InputElement={
                      <input
                        ref={downsellInputRef}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="R$ 0,00"
                      />
                    }
                  />
                </div>
              )}
            </div>
          )}

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
              id="detailed-description"
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
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isCreating ? 'Criar' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>
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

// No SortableProductInput, borda transparente por padrão, azul só ao arrastar
function SortableProductInput({ id, index, value, onChange, onRemove, canRemove }: any) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || undefined,
        zIndex: isDragging ? 50 : 'auto',
      }}
      className={`flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg`}
    >
      <button type="button" {...listeners} {...attributes} className="p-2 cursor-grab text-gray-400 hover:text-blue-600 focus:outline-none">
        <GripVertical className="w-4 h-4" />
      </button>
      <input
        type="text"
        value={value}
        onChange={e => onChange(index, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isDragging ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}
        placeholder="Nome do Produto"
        style={isDragging ? { boxShadow: '0 2px 8px 0 rgba(59,130,246,0.15)' } : {}}
      />
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}