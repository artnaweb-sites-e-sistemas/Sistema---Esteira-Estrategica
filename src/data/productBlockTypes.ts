import { 
  Package, 
  BookOpen, 
  CreditCard, 
  Users, 
  Star, 
  Plus, 
  Lightbulb
} from 'lucide-react';

export const productBlockTypes = {
  entryProduct: {
    label: 'Produto de Entrada',
    icon: Lightbulb,
    color: 'bg-blue-100 text-blue-600',
    description: 'Produto inicial para aquisição de clientes'
  },
  fullCourse: {
    label: 'Curso Completo',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600',
    description: 'Um curso abrangente com múltiplos módulos'
  },
  subscriptionApp: {
    label: 'App de Assinatura',
    icon: CreditCard,
    color: 'bg-purple-100 text-purple-600',
    description: 'Aplicativo ou serviço baseado em assinatura'
  },
  groupMentoring: {
    label: 'Mentoria em Grupo',
    icon: Users,
    color: 'bg-yellow-100 text-yellow-600',
    description: 'Sessões de mentoria para múltiplos participantes'
  },
  individualMentoring: {
    label: 'Mentoria Individual',
    icon: Star,
    color: 'bg-red-100 text-red-600',
    description: 'Sessões de mentoria personalizada um-para-um'
  },
  custom: {
    label: 'Personalizado',
    icon: Plus,
    color: 'bg-gray-100 text-gray-600',
    description: 'Defina um tipo de bloco personalizado'
  }
}; 