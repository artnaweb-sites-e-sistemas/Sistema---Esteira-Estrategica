import { AudienceTarget, AudienceInsights } from './audience';

export interface Step {
  id: string;
  name: string;
  description: string;
  link?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'paused';
  notes?: string;
  order: number;
  type: 'traffic' | 'page' | 'checkout' | 'upsell' | 'membership' | 'subscription' | 'mentoring' | 'custom' | 'crosssell' | 'capture';
  parentId?: string;
  // Campos específicos para checkout
  upsellProducts?: string[];
  // Campos específicos para páginas de vendas e upsell
  relatedProducts?: string[];
  // Campo para detalhes em markdown
  detailedDescription?: string;
  // Para etapas customizadas
  isCustom?: boolean;
  // Valor do produto de down-sell (apenas para crosssell)
  downsellValue?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  status: 'todo' | 'in-progress' | 'completed';
  modules?: Module[];
  lessons?: Lesson[];
  bonuses?: Bonus[];
  whatsappGroup?: string;
  telegramGroup?: string;
  hasAffiliates?: boolean;
  notes?: string;
  value?: number;
  promessa?: string; // Campo para a promessa do produto
  offerType?: 'inicial' | 'upsell'; // NOVO: tipo de oferta
}

export interface Module {
  id: string;
  name: string;
  status: 'todo' | 'in-progress' | 'completed' | 'paused';
  description?: string;
}

export interface Lesson {
  id: string;
  name: string;
  status: 'todo' | 'in-progress' | 'completed';
  description?: string;
  moduleId?: string; // Para associar a aula a um módulo
  link?: string; // Link da aula
}

export interface Bonus {
  id: string;
  name: string;
  status: 'todo' | 'in-progress' | 'completed';
  description?: string;
  link?: string; // Link do bônus
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  promessa?: string; // Campo para a promessa do produto
  status: 'todo' | 'in-progress' | 'completed' | 'paused';
  order: number;
  steps: Step[];
  // Campos adicionais para edição
  link?: string;
  detailedDescription?: string;
  notes?: string;
  // Tipo do produto (ex: "Produto de Entrada", "Curso Completo")
  type: string;
  // Produtos específicos deste tipo
  productItems?: ProductItem[];
  value?: number;
}

export interface Funnel {
  id: string;
  name: string;
  description?: string;
  products: Product[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  publicUrl?: string;
  audienceTarget?: AudienceTarget;
  audienceInsights?: AudienceInsights;
}

export type StepStatus = 'todo' | 'in-progress' | 'completed' | 'paused';
export type StepType = 'traffic' | 'page' | 'checkout' | 'upsell' | 'membership' | 'subscription' | 'mentoring' | 'custom' | 'crosssell' | 'capture';

export interface StepTypeConfig {
  label: string;
  icon: any;
  color: string;
  description: string;
}