import React from 'react';
import type { AudienceInsights, CommunicationTone } from '../types/audience';
import { Plus, X } from 'lucide-react';

interface AudienceInsightsProps {
  insights: AudienceInsights;
  onChange: (newInsights: AudienceInsights) => void;
  isDarkMode: boolean;
  isReadOnly?: boolean;
}

export const AudienceInsightsCard: React.FC<AudienceInsightsProps> = ({
  insights,
  onChange,
  isDarkMode,
  isReadOnly = false,
}) => {
  const inputClassName = `w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600'
  }`;

  const labelClassName = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  const radioLabelClassName = `text-sm font-medium ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  const handlePainChange = (index: number, value: string) => {
    const newPains = [...insights.mainPains];
    newPains[index] = value;
    onChange({ ...insights, mainPains: newPains });
  };

  const handleAddPain = () => {
    onChange({ ...insights, mainPains: [...insights.mainPains, ''] });
  };

  const handleRemovePain = (index: number) => {
    const newPains = insights.mainPains.filter((_, i) => i !== index);
    onChange({ ...insights, mainPains: newPains });
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...insights, communicationTone: e.target.value as CommunicationTone });
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        Insights do Público Alvo
      </h2>
      
      <div className="mb-4">
        <label className={labelClassName}>Dores principais:</label>
        {insights.mainPains.map((pain, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={pain}
              onChange={isReadOnly ? undefined : (e) => handlePainChange(index, e.target.value)}
              placeholder={`Dor ${index + 1}`}
              className={inputClassName}
              disabled={isReadOnly}
            />
            {insights.mainPains.length > 1 && !isReadOnly && (
              <button
                onClick={() => handleRemovePain(index)}
                className={`p-2 rounded-md transition-colors ${
                  isDarkMode
                    ? 'text-red-400 hover:bg-gray-700'
                    : 'text-red-600 hover:bg-gray-100'
                }`}
                title="Remover dor"
                disabled={isReadOnly}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {index === insights.mainPains.length - 1 && !isReadOnly && (
              <button
                onClick={handleAddPain}
                className={`p-2 rounded-md transition-colors ${
                  isDarkMode
                    ? 'text-blue-400 bg-gray-700 hover:bg-gray-600'
                    : 'text-blue-600 bg-gray-100 hover:bg-gray-200'
                }`}
                title="Adicionar nova dor"
                disabled={isReadOnly}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className={labelClassName}>Tom de Comunicação Ideal:</label>
        <select
          id="communicationTone"
          name="communicationTone"
          value={insights.communicationTone}
          onChange={isReadOnly ? undefined : handleToneChange}
          className={inputClassName}
          disabled={isReadOnly}
        >
          <option value="">Selecione</option>
          <option value="human_motivational">🌟 Humano e motivador</option>
          <option value="formal_technical">💼 Formal e técnico</option>
          <option value="clear_practical">✍️ Claro e prático</option>
          <option value="friendly_light">😄 Amigável e leve</option>
          <option value="educational_explanatory">🎓 Educativo e explicativo</option>
          <option value="persuasive_commercial">🔥 Persuasivo e comercial</option>
          <option value="urgent_impactful">⏰ Urgente e impactante</option>
          <option value="advisory_consultative">🧭 Aconselhador e consultivo</option>
        </select>
      </div>
    </div>
  );
}; 