export interface AudienceTarget {
  niche: string;
  subNiche: string;
  ageRange: {
    min: number | null;
    max: number | null;
  };
  gender: 'female' | 'male' | 'both' | '';
}

export type CommunicationTone =
  | 'human_motivational'
  | 'formal_technical'
  | 'clear_practical'
  | 'friendly_light'
  | 'educational_explanatory'
  | 'persuasive_commercial'
  | 'urgent_impactful'
  | 'advisory_consultative'
  | ''; // Adicionado para permitir valor inicial vazio

export interface AudienceInsights {
  mainPains: string[];
  communicationTone: CommunicationTone;
} 