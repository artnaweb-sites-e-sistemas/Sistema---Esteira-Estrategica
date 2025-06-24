import React from 'react';
import { X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onClose,
  isDarkMode = false,
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
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Alterações não salvas</h3>
        <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tem certeza que deseja sair sem salvar?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onDiscard}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sair sem salvar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal; 