import React from 'react';
import { X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  isDarkMode: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded-full ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Confirmar Exclusão</h3>
        <p className={`mb-6 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}; 