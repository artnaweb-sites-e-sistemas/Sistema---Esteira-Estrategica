import React from 'react';
import { AudienceTarget } from '../types/audience';

interface AudienceTargetingProps {
  audience: AudienceTarget;
  onChange: (newAudience: AudienceTarget) => void;
  isDarkMode: boolean;
  isReadOnly?: boolean;
}

export const AudienceTargeting: React.FC<AudienceTargetingProps> = ({
  audience,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    if (name === 'minAge' || name === 'maxAge') {
      onChange({
        ...audience,
        ageRange: {
          ...audience.ageRange,
          [name === 'minAge' ? 'min' : 'max']: value === '' ? null : Number(value),
        },
      });
    } else {
      onChange({ ...audience, [name]: value });
    }
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
        Público alvo
      </h2>
      <div className="mb-4 space-y-4">
        <div>
          <label htmlFor="niche" className={labelClassName}>
            Nicho:
          </label>
          <input
            type="text"
            id="niche"
            name="niche"
            value={audience.niche}
            onChange={handleChange}
            placeholder="Ex: Marketing Digital"
            className={inputClassName + ' w-full'}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <label htmlFor="subNiche" className={labelClassName}>
            Sub-nicho:
          </label>
          <input
            type="text"
            id="subNiche"
            name="subNiche"
            value={audience.subNiche}
            onChange={handleChange}
            placeholder="Ex: Lançamentos de produtos"
            className={inputClassName + ' w-full'}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="minAge" className={labelClassName}>
            Idade De:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="minAge"
              name="minAge"
              value={audience.ageRange.min === null ? '' : audience.ageRange.min}
              onChange={handleChange}
              placeholder="Ex: 20"
              className={inputClassName + ' input-no-spinner'}
              min="0"
              disabled={isReadOnly}
            />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>a</span>
            <input
              type="number"
              id="maxAge"
              name="maxAge"
              value={audience.ageRange.max === null ? '' : audience.ageRange.max}
              onChange={handleChange}
              placeholder="Ex: 35"
              className={inputClassName + ' input-no-spinner'}
              min="0"
              disabled={isReadOnly}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="gender" className={labelClassName}>
            Gênero:
          </label>
          <select
            id="gender"
            name="gender"
            value={audience.gender}
            onChange={handleChange}
            className={inputClassName}
            disabled={isReadOnly}
          >
            <option value="">Selecione</option>
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
            <option value="both">Ambos</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 