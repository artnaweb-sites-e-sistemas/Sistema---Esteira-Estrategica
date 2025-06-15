import React, { useState } from 'react';
import { Funnel, Product } from '../types';
import { ProductNode } from './ProductNode';
import { FunnelConnector } from './FunnelConnector';
import { ProductDetailsModal } from './ProductDetailsModal';
import { Plus, Eye, TrendingUp } from 'lucide-react';

interface VisualFunnelBoardProps {
  funnel: Funnel;
  onUpdateProduct: (productId: string, updates: any) => void;
  onUpdateStep: (productId: string, stepId: string, updates: any) => void;
  onDeleteStep: (productId: string, stepId: string) => void;
  onAddStep: (productId: string, stepData: any) => void;
  onAddProduct: (productData: any) => void;
  onMoveProduct: (productId: string, direction: 'up' | 'down') => void;
  onDeleteProduct: (productId: string) => void;
  isDarkMode: boolean;
  isReadOnly?: boolean; // Nova prop para modo somente leitura
}

export const VisualFunnelBoard: React.FC<VisualFunnelBoardProps> = ({
  funnel,
  onUpdateProduct,
  onUpdateStep,
  onDeleteStep,
  onAddStep,
  onAddProduct,
  onMoveProduct,
  onDeleteProduct,
  isDarkMode,
  isReadOnly = false
}) => {
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  
  const sortedProducts = [...funnel.products].sort((a, b) => a.order - b.order);

  const handleCreateProduct = (productData: Partial<Product>) => {
    if (isReadOnly) return;
    
    const newProduct = {
      ...productData,
      name: productData.name || 'Novo Produto',
      promessa: productData.promessa || '',
      value: productData.value || 0,
      status: 'todo' as const,
      order: funnel.products.length + 1,
      steps: [],
      productItems: productData.productItems || []
    };
    onAddProduct(newProduct);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowCreateProductModal(false);
    }
  };

  return (
    <div className="flex-1 relative">
      <div className="max-w-7xl mx-auto p-6 sm:p-12">
        <div className="relative">
          <div className="mb-0">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {funnel.name}
                    </h1>
                  </div>
                  {funnel.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg ml-12">
                      {funnel.description}
                    </p>
                  )}
                </div>
                
                {/* Indicador de modo somente leitura */}
                {isReadOnly && (
                  <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800/50 hidden sm:flex">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Visualização Pública</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative mt-16">
            <div className="space-y-4">
              {sortedProducts.map((product, index) => (
                <div key={product.id} className="relative">
                  <ProductNode
                    product={product}
                    onUpdateProduct={(updates) => onUpdateProduct(product.id, updates)}
                    onUpdateStep={(stepId, updates) => onUpdateStep(product.id, stepId, updates)}
                    onDeleteStep={(stepId) => onDeleteStep(product.id, stepId)}
                    onAddStep={(stepData) => onAddStep(product.id, stepData)}
                    onMoveProduct={(direction) => onMoveProduct(product.id, direction)}
                    onDeleteProduct={onDeleteProduct}
                    canMoveUp={index > 0}
                    canMoveDown={index < funnel.products.length - 1}
                    isDarkMode={isDarkMode}
                    isReadOnly={isReadOnly}
                  />
                  
                  {index < sortedProducts.length - 1 && (
                    <FunnelConnector isDarkMode={isDarkMode} />
                  )}
                </div>
              ))}
              
              {/* Botão para adicionar novo produto - apenas se não for somente leitura */}
              {!isReadOnly && (
                <div className="flex justify-center pt-12 pb-8">
                  <button
                    onClick={() => setShowCreateProductModal(true)}
                    className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full p-4 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group shadow-lg"
                    title="Adicionar novo produto"
                  >
                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal com backdrop clicável - apenas se não for somente leitura */}
          {!isReadOnly && showCreateProductModal && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={handleBackdropClick}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <ProductDetailsModal
                  product={null}
                  isOpen={showCreateProductModal}
                  onClose={() => setShowCreateProductModal(false)}
                  onSave={handleCreateProduct}
                  isCreating={true}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};