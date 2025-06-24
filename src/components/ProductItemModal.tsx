import React, { useState, useEffect } from 'react';
import { ProductItem, Module, Lesson, Bonus } from '../types';
import { 
  X, 
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
  Link as LinkIcon
} from 'lucide-react';
import ReactDOM from 'react-dom';
import { CurrencyInput } from 'react-currency-mask';
import '../styles/modalStyles.css';
import UnsavedChangesModal from './UnsavedChangesModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ProductItemModalProps {
  productItem: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productItemData: Partial<ProductItem>) => void;
  isCreating?: boolean;
  isDarkMode: boolean;
}

const statusConfig = {
  todo: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' },
  'in-progress': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-600' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-600' }
};

const statusLabels = {
  todo: 'A fazer',
  'in-progress': 'Em andamento',
  completed: 'Concluído'
};

interface ProductItemFormState extends Omit<Partial<ProductItem>, 'modules' | 'lessons' | 'bonuses' | 'name' | 'status' | 'whatsappGroup' | 'telegramGroup' | 'hasAffiliates' | 'notes'> {
  name: string;
  status: 'todo' | 'in-progress' | 'completed';
  modules: Module[];
  lessons: Lesson[];
  bonuses: Bonus[];
  whatsappGroup: string;
  telegramGroup: string;
  hasAffiliates: boolean;
  notes: string;
  promessa?: string;
}

const initialFormData: ProductItemFormState = {
  name: '',
  status: 'todo',
  modules: [],
  lessons: [],
  bonuses: [],
  whatsappGroup: '',
  telegramGroup: '',
  hasAffiliates: false,
  notes: '',
  value: undefined,
  promessa: '',
};

export const ProductItemModal: React.FC<ProductItemModalProps> = ({
  productItem,
  isOpen,
  onClose,
  onSave,
  isCreating = false,
  isDarkMode
}) => {
  const [formData, setFormData] = useState<ProductItemFormState>(initialFormData);
  const [initialData, setInitialData] = useState<ProductItemFormState>(initialFormData);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [backdropEvent, setBackdropEvent] = useState<React.MouseEvent | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isCreating) {
        setFormData(initialFormData);
        setInitialData(initialFormData);
      } else if (productItem) {
        const data = {
          id: productItem.id,
          name: productItem.name || '',
          status: productItem.status || 'todo',
          modules: productItem.modules || [],
          lessons: productItem.lessons || [],
          bonuses: productItem.bonuses || [],
          whatsappGroup: productItem.whatsappGroup || '',
          telegramGroup: productItem.telegramGroup || '',
          hasAffiliates: productItem.hasAffiliates || false,
          notes: productItem.notes || '',
          value: productItem.value || undefined,
          promessa: productItem.promessa || '',
        } as ProductItemFormState;
        setFormData(data);
        setInitialData(data);
      }
    }
  }, [isOpen, isCreating, productItem]);

  // Função para comparar objetos profundamente
  const isDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSave = () => {
    const saveData: Partial<ProductItem> = {
      ...formData,
      modules: formData.modules.filter(m => m.name.trim()),
      lessons: formData.lessons.filter(l => l.name.trim()),
      bonuses: formData.bonuses.filter(b => b.name.trim()),
      promessa: formData.promessa || '',
      value: formData.value,
      notes: formData.notes || ''
    };
    onSave(saveData);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      if (isDirty()) {
        setBackdropEvent(e);
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

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), { id: crypto.randomUUID(), name: '', status: 'todo' }]
    }));
  };

  const addLesson = (moduleId?: string) => {
    setFormData(prev => ({
      ...prev,
      lessons: [...(prev.lessons || []), { id: crypto.randomUUID(), name: '', status: 'todo', moduleId: moduleId }]
    }));
  };

  const addBonus = () => {
    setFormData(prev => ({
      ...prev,
      bonuses: [...(prev.bonuses || []), { id: crypto.randomUUID(), name: '', status: 'todo' }]
    }));
  };

  const updateModule = (index: number, updates: Partial<Module>) => {
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).map((mod, i) => (i === index ? { ...mod, ...updates } : mod))
    }));
  };

  const updateLesson = (index: number, updates: Partial<Lesson>) => {
    setFormData(prev => ({
      ...prev,
      lessons: (prev.lessons || []).map((lesson, i) => (i === index ? { ...lesson, ...updates } : lesson))
    }));
  };

  const updateBonus = (index: number, updates: Partial<Bonus>) => {
    setFormData(prev => ({
      ...prev,
      bonuses: (prev.bonuses || []).map((bonus, i) => (i === index ? { ...bonus, ...updates } : bonus))
    }));
  };

  const removeModule = (index: number) => {
    const moduleIdToRemove = formData.modules[index]?.id;
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
      lessons: prev.lessons.filter(lesson => lesson.moduleId !== moduleIdToRemove)
    }));
  };

  const removeLesson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const removeBonus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter((_, i) => i !== index)
    }));
  };

  const getModuleName = (moduleId?: string) => {
    if (!moduleId) return 'Sem Módulo';
    const module = formData.modules.find(mod => mod.id === moduleId);
    return module?.name || 'Módulo Desconhecido';
  };

  const groupedLessons = formData.lessons!.reduce((acc, lesson, index) => {
    const moduleId = lesson.moduleId || 'no-module';
    if (!acc[moduleId]) {
      acc[moduleId] = [];
    }
    acc[moduleId].push({ lesson, index });
    return acc;
  }, {} as Record<string, Array<{ lesson: Lesson; index: number }>>);

  // Funções utilitárias para mover itens nas listas
  const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
    const newArr = [...arr];
    const item = newArr.splice(from, 1)[0];
    newArr.splice(to, 0, item);
    return newArr;
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const to = direction === 'up' ? index - 1 : index + 1;
      if (to < 0 || to >= prev.modules.length) return prev;
      return { ...prev, modules: moveItem(prev.modules, index, to) };
    });
  };

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const to = direction === 'up' ? index - 1 : index + 1;
      if (to < 0 || to >= prev.lessons.length) return prev;
      return { ...prev, lessons: moveItem(prev.lessons, index, to) };
    });
  };

  const moveBonus = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const to = direction === 'up' ? index - 1 : index + 1;
      if (to < 0 || to >= prev.bonuses.length) return prev;
      return { ...prev, bonuses: moveItem(prev.bonuses, index, to) };
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === 'module') {
      setFormData(prev => ({
        ...prev,
        modules: moveItem(prev.modules, source.index, destination.index)
      }));
    } else if (type === 'bonus') {
      setFormData(prev => ({
        ...prev,
        bonuses: moveItem(prev.bonuses, source.index, destination.index)
      }));
    } else if (type.startsWith('lesson-')) {
      const fromModuleId = type.replace('lesson-', '');
      const toModuleId = destination.droppableId.replace('lesson-', '');
      setFormData(prev => {
        const lessons = [...prev.lessons];
        const lessonsInFrom = lessons.filter(l => (l.moduleId || 'no-module') === fromModuleId);
        const lessonsInTo = lessons.filter(l => (l.moduleId || 'no-module') === toModuleId);
        const lessonToMove = lessonsInFrom[source.index];
        if (!lessonToMove) return prev;
        const lessonsWithout = lessons.filter(l => l.id !== lessonToMove.id);
        const updatedLesson = { ...lessonToMove, moduleId: toModuleId === 'no-module' ? undefined : toModuleId };
        const lessonsInToIds = lessonsInTo.map(l => l.id);
        let insertAt = 0;
        for (let i = 0, count = 0; i < lessonsWithout.length; i++) {
          if ((lessonsWithout[i].moduleId || 'no-module') === toModuleId) {
            if (count === destination.index) {
              insertAt = i;
              break;
            }
            count++;
          }
          if (i === lessonsWithout.length - 1) {
            insertAt = lessonsWithout.length;
          }
        }
        const newLessons = [
          ...lessonsWithout.slice(0, insertAt),
          updatedLesson,
          ...lessonsWithout.slice(insertAt)
        ];
        return {
          ...prev,
          lessons: newLessons
        };
      });
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <DragDropContext onDragEnd={onDragEnd}>
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
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isCreating ? 'Criar Novo Produto' : 'Editar Produto'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Nome do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Curso Básico de Pilates"
                autoFocus
              />
            </div>

            {/* Promessa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Promessa
              </label>
              <textarea
                value={formData.promessa}
                onChange={(e) => setFormData(prev => ({ ...prev, promessa: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Qual é a principal promessa deste produto?"
              />
            </div>

            {/* Valor do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor (R$)
              </label>
              <CurrencyInput
                value={formData.value}
                onChangeValue={(_, originalValue) => setFormData(prev => ({
                  ...prev,
                  value: originalValue === '' ? undefined : Number(originalValue)
                }))}
                currency="BRL"
                locale="pt-BR"
                hideSymbol={false}
                InputElement={
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="R$ 0,00"
                  />
                }
              />
            </div>

            {/* Status do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <div className="flex gap-2 flex-wrap">
                {(['todo', 'in-progress', 'completed'] as const).map((status) => {
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                        formData.status === status
                          ? `${config.bg} ${config.color} border-2 ${config.border}`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                      }`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusLabels[status]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grupos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Grupo WhatsApp
                </label>
                <input
                  type="url"
                  value={formData.whatsappGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsappGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Send className="w-4 h-4 inline mr-1" />
                  Grupo Telegram
                </label>
                <input
                  type="url"
                  value={formData.telegramGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegramGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>

            {/* Afiliados */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAffiliates}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAffiliates: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Terá programa de afiliados</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Marque se este produto terá um programa de afiliados</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Módulos */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6">
              <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <label className="text-lg font-medium text-gray-900 dark:text-white">Módulos</label>
                </div>
                <button
                  type="button"
                  onClick={addModule}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm mt-2 sm:mt-0 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Módulo</span>
                </button>
              </div>
              <Droppable droppableId="modules" type="module">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                    {formData.modules.map((module, index) => (
                      <Draggable key={module.id} draggableId={module.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700 shadow-sm ${snapshot.isDragging ? 'ring-2 ring-purple-400' : ''}`}
                          >
                            <div className="flex items-center space-x-2 mb-3">
                              <input
                                type="text"
                                value={module.name}
                                onChange={(e) => updateModule(index, { name: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Nome do módulo"
                              />
                              <button
                                type="button"
                                onClick={() => removeModule(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {(['todo', 'in-progress', 'completed'] as const).map((status) => {
                                const config = statusConfig[status];
                                const StatusIcon = config.icon;
                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => updateModule(index, { status })}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                                      module.status === status
                                        ? `${config.bg} ${config.color} border ${config.border}`
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    <span>{statusLabels[status]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {formData.modules.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p>Nenhum módulo adicionado</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Aulas */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6">
              <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <label className="text-lg font-medium text-gray-900 dark:text-white">Aulas</label>
                </div>
                <button
                  type="button"
                  onClick={() => addLesson(undefined)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm mt-2 sm:mt-0 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Aula</span>
                </button>
              </div>
              <div className="space-y-4">
                {/* Renderizar 'Sem Módulo' apenas se houver aulas sem módulo */}
                {formData.lessons.some(l => !l.moduleId) && (
                  <Droppable droppableId={`lesson-no-module`} type={`lesson-no-module`}>
                    {(provided) => {
                      const lessons = formData.lessons
                        .map((lesson, idx) => ({ lesson, idx }))
                        .filter(({ lesson }) => !lesson.moduleId);
                      return (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-700 shadow-sm">
                          <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2 mb-2 sm:mb-0">
                              <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span>Sem Módulo</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => addLesson(undefined)}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm mt-2 sm:mt-0"
                            >
                              + Adicionar aula neste módulo
                            </button>
                          </div>
                          <div className="space-y-2">
                            {lessons.map(({ lesson, idx }, index) => (
                              <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-green-100 dark:border-green-800 ${snapshot.isDragging ? 'ring-2 ring-green-400' : ''}`}
                                  >
                                    <div className="flex items-center space-x-2 mb-2">
                                      <input
                                        type="text"
                                        value={lesson.name}
                                        onChange={(e) => updateLesson(idx, { name: e.target.value })}
                                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Nome da aula"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeLesson(idx)}
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    {/* Link da aula */}
                                    <div className="flex items-center space-x-2 mb-2">
                                      <LinkIcon className="w-4 h-4 text-gray-400" />
                                      <input
                                        type="url"
                                        value={lesson.link || ''}
                                        onChange={(e) => updateLesson(idx, { link: e.target.value })}
                                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Link da aula"
                                      />
                                    </div>
                                    {/* Módulo da aula */}
                                    <div className="flex items-center space-x-2 mb-2">
                                      <select
                                        value={lesson.moduleId || ''}
                                        onChange={(e) => updateLesson(idx, { moduleId: e.target.value || undefined })}
                                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="">Sem módulo</option>
                                        {formData.modules.map((module) => (
                                          <option key={module.id} value={module.id}>
                                            {module.name || 'Módulo sem nome'}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex gap-1">
                                      <div className="flex gap-2 flex-wrap">
                                        {(['todo', 'in-progress', 'completed'] as const).map((status) => {
                                          const config = statusConfig[status];
                                          const StatusIcon = config.icon;
                                          return (
                                            <button
                                              key={status}
                                              type="button"
                                              onClick={() => updateLesson(idx, { status })}
                                              className={`px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1 ${
                                                lesson.status === status
                                                  ? `${config.bg} ${config.color} border ${config.border}`
                                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                              }`}
                                            >
                                              <StatusIcon className="w-3 h-3" />
                                              <span>{statusLabels[status]}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      );
                    }}
                  </Droppable>
                )}
                {/* Renderizar blocos de módulos apenas se houver aulas naquele módulo */}
                {formData.modules.map(module => {
                  const lessons = formData.lessons
                    .map((lesson, idx) => ({ lesson, idx }))
                    .filter(({ lesson }) => lesson.moduleId === module.id);
                  if (lessons.length === 0) return null;
                  return (
                    <Droppable key={module.id} droppableId={`lesson-${module.id}`} type={`lesson-${module.id}`}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-700 shadow-sm">
                          <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2 mb-2 sm:mb-0">
                              <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span>{`Módulo - ${module.name || 'Módulo sem nome'}`}</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => addLesson(module.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm mt-2 sm:mt-0"
                            >
                              + Adicionar aula neste módulo
                            </button>
                          </div>
                          <div className="space-y-2">
                            {lessons.map(({ lesson, idx }, index) => (
                              <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-green-100 dark:border-green-800 ${snapshot.isDragging ? 'ring-2 ring-green-400' : ''}`}
                                  >
                                    <div className="flex items-center space-x-2 mb-2">
                                      <input
                                        type="text"
                                        value={lesson.name}
                                        onChange={(e) => updateLesson(idx, { name: e.target.value })}
                                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Nome da aula"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeLesson(idx)}
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    {/* Link da aula */}
                                    <div className="flex items-center space-x-2 mb-2">
                                      <LinkIcon className="w-4 h-4 text-gray-400" />
                                      <input
                                        type="url"
                                        value={lesson.link || ''}
                                        onChange={(e) => updateLesson(idx, { link: e.target.value })}
                                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Link da aula"
                                      />
                                    </div>
                                    {/* Módulo da aula */}
                                    <div className="flex items-center space-x-2 mb-2">
                                      <select
                                        value={lesson.moduleId || ''}
                                        onChange={(e) => updateLesson(idx, { moduleId: e.target.value || undefined })}
                                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="">Sem módulo</option>
                                        {formData.modules.map((m) => (
                                          <option key={m.id} value={m.id}>
                                            {m.name || 'Módulo sem nome'}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex gap-1">
                                      <div className="flex gap-2 flex-wrap">
                                        {(['todo', 'in-progress', 'completed'] as const).map((status) => {
                                          const config = statusConfig[status];
                                          const StatusIcon = config.icon;
                                          return (
                                            <button
                                              key={status}
                                              type="button"
                                              onClick={() => updateLesson(idx, { status })}
                                              className={`px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1 ${
                                                lesson.status === status
                                                  ? `${config.bg} ${config.color} border ${config.border}`
                                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                              }`}
                                            >
                                              <StatusIcon className="w-3 h-3" />
                                              <span>{statusLabels[status]}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  );
                })}
                {/* Se não houver nenhuma aula, mostrar mensagem geral */}
                {formData.lessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Play className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Nenhuma aula adicionada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bônus */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
              <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                    <Gift className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <label className="text-lg font-medium text-gray-900 dark:text-white">Bônus</label>
                </div>
                <button
                  type="button"
                  onClick={addBonus}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-sm mt-2 sm:mt-0 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Bônus</span>
                </button>
              </div>
              <Droppable droppableId="bonuses" type="bonus">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                    {formData.bonuses.map((bonus, index) => (
                      <Draggable key={bonus.id} draggableId={bonus.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-700 shadow-sm ${snapshot.isDragging ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            <div className="flex items-center space-x-2 mb-3">
                              <input
                                type="text"
                                value={bonus.name}
                                onChange={(e) => updateBonus(index, { name: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Nome do bônus"
                              />
                              <button
                                type="button"
                                onClick={() => removeBonus(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Link do bônus */}
                            <div className="flex items-center space-x-2 mb-3">
                              <LinkIcon className="w-4 h-4 text-gray-400" />
                              <input
                                type="url"
                                value={bonus.link || ''}
                                onChange={(e) => updateBonus(index, { link: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Link do bônus"
                              />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {(['todo', 'in-progress', 'completed'] as const).map((status) => {
                                const config = statusConfig[status];
                                const StatusIcon = config.icon;
                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => updateBonus(index, { status })}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                                      bonus.status === status
                                        ? `${config.bg} ${config.color} border ${config.border}`
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    <span>{statusLabels[status]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {formData.bonuses.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p>Nenhum bônus adicionado</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Adicione quaisquer observações importantes sobre este produto..."
                rows={15}
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
                disabled={!formData.name!.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Criar Produto' : 'Salvar Alterações'}
              </button>
            </div>
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
    </DragDropContext>,
    document.body
  );
};