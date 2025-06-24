import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Funnel } from '../types';
import { defaultProducts } from '../data/defaultProducts';
import UnsavedChangesModal from './UnsavedChangesModal';

interface CreateFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (funnel: Funnel) => void;
}

export function CreateFunnelModal({ isOpen, onClose, onSave }: CreateFunnelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    useTemplate: true // Novo campo para controlar se usa template ou não
  });
  const [initialData, setInitialData] = useState({
    name: '',
    description: '',
    useTemplate: true
  });
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Resetar o formulário quando o modal é fechado
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      useTemplate: true
    });
    setInitialData({
      name: '',
      description: '',
      useTemplate: true
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setInitialData({
        name: formData.name,
        description: formData.description,
        useTemplate: formData.useTemplate
      });
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const isDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFunnel: Funnel = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      products: formData.useTemplate ? defaultProducts.map(product => ({
        ...product,
        id: crypto.randomUUID(),
        productItems: product.productItems?.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          modules: item.modules?.map(module => ({ ...module, id: crypto.randomUUID() })) || [],
          lessons: item.lessons?.map(lesson => ({ ...lesson, id: crypto.randomUUID() })) || [],
          bonuses: item.bonuses?.map(bonus => ({ ...bonus, id: crypto.randomUUID() })) || []
        })) || [],
        steps: product.steps.map(step => ({
          ...step,
          id: crypto.randomUUID()
        }))
      })) : [], // Se não usar template, começa com array vazio
      userId: '', // Será preenchido pelo hook useFunnels
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newFunnel);
    handleClose(); // Usar handleClose ao invés de onClose
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      if (isDirty()) {
        setShowUnsavedModal(true);
      } else {
        handleClose();
      }
    }
  };

  const handleDiscard = () => {
    setShowUnsavedModal(false);
    handleClose();
  };

  const handleSaveFromModal = () => {
    setShowUnsavedModal(false);
    // Simular submit do formulário
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Criar Novo Funil
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Funil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Funil *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Funil de Vendas de Curso Online"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]"
                placeholder="Descreva o objetivo deste funil..."
              />
            </div>

            {/* Opção de Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Como deseja criar o funil?
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="radio"
                    checked={formData.useTemplate}
                    onChange={() => setFormData(prev => ({ ...prev, useTemplate: true }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-medium text-gray-900 dark:text-white">Usar Modelo Pré-definido</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Cria um funil com páginas de captura, vendas e checkout já configuradas
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="radio"
                    checked={!formData.useTemplate}
                    onChange={() => setFormData(prev => ({ ...prev, useTemplate: false }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-medium text-gray-900 dark:text-white">Criar do Zero</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Cria um funil vazio para você adicionar as páginas manualmente
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Criar Funil
              </button>
            </div>
          </form>
        </div>
      </div>
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleSaveFromModal}
        onDiscard={handleDiscard}
        onClose={() => setShowUnsavedModal(false)}
      />
    </div>
  );
}