import { 
  Globe, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Star,
  Mail,
  MessageCircle,
  Megaphone,
  Target,
  Video,
  Calendar,
  Plus,
  LinkIcon,
  TrendingDown,
  Infinity,
  ClipboardList
} from 'lucide-react';
import { MetaAdsIcon } from '../icons/MetaAdsIcon';
import { GoogleAdsIcon } from '../icons/GoogleAdsIcon';

export const stepTypes = {
  traffic: {
    label: 'Tráfego/Marketing',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600',
    description: 'Estratégias de aquisição de tráfego',
    order: 0
  },
  capture: {
    label: 'Página de Captura',
    icon: ClipboardList,
    color: 'bg-green-100 text-green-600',
    description: 'Páginas para captura de leads e emails',
    order: 0.5
  },
  page: {
    label: 'Página de Vendas',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
    description: 'Landing pages e páginas de captura',
    order: 1
  },
  checkout: {
    label: 'Checkout',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-600',
    description: 'Páginas de pagamento e finalização',
    order: 2
  },
  upsell: {
    label: 'Upsell',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600',
    description: 'Ofertas para aumentar o valor do pedido',
    order: 3
  },
  crosssell: {
    label: 'Cross-sell',
    icon: TrendingDown,
    color: 'bg-green-100 text-green-600',
    description: 'Ofertas complementares a produtos já adquiridos',
    order: 3.5
  },
  subscription: {
    label: 'Assinatura',
    icon: CreditCard,
    color: 'bg-green-100 text-green-600',
    description: 'Produtos recorrentes e clubes',
    order: 4
  },
  mentoring: {
    label: 'Mentoria',
    icon: Star,
    color: 'bg-green-100 text-green-600',
    description: 'Acompanhamento personalizado',
    order: 5
  },
  membership: {
    label: 'Área do Aluno',
    icon: Users,
    color: 'bg-green-100 text-green-600',
    description: 'Plataforma de conteúdo ou comunidade',
    order: 4
  },
  custom: {
    label: 'Personalizado',
    icon: Plus,
    color: 'bg-green-100 text-green-600',
    description: 'Etapa personalizada',
    order: 999
  }
};

export const marketingStrategies = [
  {
    id: 'facebook-ads',
    name: 'Meta Ads',
    icon: MetaAdsIcon,
    description: 'Anúncios pagos no Facebook e Instagram'
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    icon: GoogleAdsIcon,
    description: 'Anúncios no Google Search e Display'
  },
  {
    id: 'email-marketing',
    name: 'E-mail Marketing',
    icon: Mail,
    description: 'Campanhas para base de e-mails'
  },
  {
    id: 'whatsapp-group',
    name: 'Grupo WhatsApp',
    icon: MessageCircle,
    description: 'Divulgação em grupos do WhatsApp'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Video,
    description: 'Conteúdo orgânico e anúncios no YouTube'
  },
  {
    id: 'webinar',
    name: 'Webinar',
    icon: Calendar,
    description: 'Apresentações ao vivo para vendas'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    icon: Megaphone,
    description: 'Estratégia personalizada'
  }
];