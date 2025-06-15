import { Product } from '../types';

export const defaultProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Funil de Entrada',
    type: 'entryProduct',
    description: 'Produtos simples que destravam a confiança do público e ativam a primeira venda.',
    status: 'todo',
    order: 1,
    productItems: [
      {
        id: '',
        name: 'Volte a Agachar Sem Dor',
        promessa: 'Rotina de 7 Min para Alívio no Joelho',
        value: 24.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      },
      {
        id: '',
        name: 'Solte os Ombros',
        promessa: 'Alívio Rápido para para Dor e Rigidez',
        value: 24.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      },
      {
        id: '',
        name: 'Respire e Libere',
        promessa: 'Curso de Mobilidade para Alívio Profundo',
        value: 47.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      },
      {
        id: '',
        name: 'Pare de Piorar a Dor',
        promessa: 'Checklist dos 7 Erros Mais Comuns',
        value: 47.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      }
    ],
    steps: [
      // Página de Captura (sempre primeira)
      {
        id: '',
        name: 'Página de Captura',
        description: 'Página para captura de leads',
        status: 'todo',
        order: 1,
        type: 'page',
        relatedProducts: [],
        notes: 'Página de captura de leads'
      },
      {
        id: '',
        name: 'Meta Ads',
        description: 'Tráfego pago no Facebook e Instagram',
        status: 'todo',
        order: 2,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Página de Vendas',
        description: 'Produto de Entrada (Low Ticket)',
        status: 'todo',
        order: 3,
        type: 'page',
        relatedProducts: ['Volte a Agachar Sem Dor', 'Solte os Ombros'],
        notes: 'Copy e oferta irresistível'
      },
      {
        id: '',
        name: 'Checkout',
        description: 'Página de pagamento com order bumps',
        status: 'todo',
        order: 4,
        type: 'checkout',
        upsellProducts: ['Respire e Libere', 'Pare de Piorar a Dor'],
        relatedProducts: [],
        notes: 'Ofertas complementares'
      },
      {
        id: '',
        name: 'Upsell',
        description: 'Oferta do curso completo',
        status: 'todo',
        order: 5,
        type: 'upsell',
        relatedProducts: ['Sem Dor em 21 Dias'],
        notes: 'Levar para o próximo nível'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Aulas + Oferta',
        status: 'todo',
        order: 6,
        type: 'membership',
        relatedProducts: ['Sem Dor em 21 Dias', 'Clube Movimento Sem Dor', 'Mentoria Corrige & Alivia', 'Grupo VIP - Mentoria PREIMUM'],
        notes: 'Ofertar produto, se não comprado.'
      }
    ]
  },
  {
    name: 'Curso completo',
    type: 'fullCourse',
    description: 'Aqui a promessa é maior, o resultado é mais profundo — e o faturamento começa a escalar.',
    status: 'todo',
    order: 2,
    productItems: [
      {
        id: '',
        name: 'Sem Dor em 21 Dias',
        promessa: 'Método Clássico de Pilates para Coluna, Joelho, Ombros, costas e Lombar',
        value: 247.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      }
    ],
    steps: [
      // Página de Captura (sempre primeira)
      {
        id: '',
        name: 'Página de Captura',
        description: 'Página para captura de leads',
        status: 'todo',
        order: 1,
        type: 'page',
        relatedProducts: [],
        notes: 'Página de captura de leads'
      },
      {
        id: '',
        name: 'Meta Ads',
        description: 'Tráfego pago no Facebook e Instagram',
        status: 'todo',
        order: 2,
        type: 'traffic',
        relatedProducts: [],
        notes: 'facebook-ads'
      },
      {
        id: '',
        name: 'Página de links',
        description: 'Instagram',
        status: 'todo',
        order: 3,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Low Ticket',
        status: 'todo',
        order: 4,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do assinante',
        description: 'Dentro do app',
        status: 'todo',
        order: 5,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Página de Vendas',
        description: 'Landing page do produto principal',
        status: 'todo',
        order: 6,
        type: 'page',
        relatedProducts: ['Sem Dor em 21 Dias'],
        notes: 'Copy e oferta irresistível'
      },
      {
        id: '',
        name: 'Checkout',
        description: 'Página de pagamento com order bumps',
        status: 'todo',
        order: 7,
        type: 'checkout',
        upsellProducts: ['Ebook Pilates Clássico'],
        notes: 'Ofertas complementares'
      },
      {
        id: '',
        name: 'Upsell',
        description: 'Oferta da assinatura',
        status: 'todo',
        order: 8,
        type: 'upsell',
        relatedProducts: ['Clube Movimento Sem Dor'],
        notes: 'Levar para o próximo nível'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Aulas + Oferta',
        status: 'todo',
        order: 9,
        type: 'membership',
        relatedProducts: ['Clube Movimento Sem Dor', 'Mentoria Corrige & Alivia', 'Grupo VIP - Mentoria PREIMUM'],
        notes: 'Ofertar produto, se não comprado.'
      }
    ]
  },
  {
    name: 'App de assinatura',
    type: 'subscriptionApp',
    description: 'Aqui o aluno continua aprendendo, praticando e consumindo. E você monetiza todo mês.',
    status: 'todo',
    order: 3,
    productItems: [
      {
        id: '',
        name: 'Clube Movimento Sem Dor',
        promessa: 'Aulas Semanais para se Manter Sem Dor',
        value: 47.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      }
    ],
    steps: [
      // Página de Captura (sempre primeira)
      {
        id: '',
        name: 'Página de Captura',
        description: 'Página para captura de leads',
        status: 'todo',
        order: 1,
        type: 'page',
        relatedProducts: [],
        notes: 'Página de captura de leads'
      },
      {
        id: '',
        name: 'Página de links',
        description: 'Instagram',
        status: 'todo',
        order: 2,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Low Ticket - Produto Principal - Mentoria em Grupo - Mentoria Individual',
        status: 'todo',
        order: 3,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do assinante',
        description: 'Dentro do app',
        status: 'todo',
        order: 4,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Página de Vendas',
        description: 'Landing page do produto por assinatura',
        status: 'todo',
        order: 5,
        type: 'page',
        relatedProducts: ['Clube Movimento Sem Dor'],
        notes: 'Copy e oferta irresistível'
      },
      {
        id: '',
        name: 'Checkout',
        description: 'Página de pagamento',
        status: 'todo',
        order: 6,
        type: 'checkout',
        upsellProducts: ['Ebook Pilates Clássico'],
        notes: 'Ofertas complementares'
      },
      {
        id: '',
        name: 'Upsell',
        description: 'Oferta da mentoria em grupo',
        status: 'todo',
        order: 7,
        type: 'upsell',
        relatedProducts: ['Upgrade para mentoria em Grupo'],
        notes: 'Levar para o próximo nível'
      },
      {
        id: '',
        name: 'Assinatura',
        description: 'Aulas + Oferta',
        status: 'todo',
        order: 8,
        type: 'subscription',
        relatedProducts: ['Clube Movimento Sem Dor', 'Mentoria Corrige & Alivia', 'Grupo VIP - Mentoria PREIMUM'],
        notes: 'Conteúdo exclusivo mensal'
      }
    ]
  },
  {
    name: 'Mentoria em Grupo',
    type: 'groupMentoring',
    description: 'Aqui o cliente já te vê como referência e está pronto para pagar mais por acesso e personalização.',
    status: 'todo',
    order: 4,
    productItems: [
      {
        id: '',
        name: 'Mentoria Corrige & Alivia',
        promessa: 'Acompanhamento para Corrigir Movimentos e Eliminar Dores',
        value: 997.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      }
    ],
    steps: [
      // Página de Captura (sempre primeira)
      {
        id: '',
        name: 'Página de Captura',
        description: 'Página para captura de leads',
        status: 'todo',
        order: 1,
        type: 'page',
        relatedProducts: [],
        notes: 'Página de captura de leads'
      },
      {
        id: '',
        name: 'Página de links',
        description: 'Instagram',
        status: 'todo',
        order: 2,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Low Ticket, curso completo - app assinatura',
        status: 'todo',
        order: 3,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do assinante',
        description: 'Dentro do app',
        status: 'todo',
        order: 4,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Página de Vendas',
        description: 'Landing page da mentoria em Grupo',
        status: 'todo',
        order: 5,
        type: 'page',
        relatedProducts: ['Mentoria Corrige & Alivia'],
        notes: 'Copy e oferta irresistível'
      },
      {
        id: '',
        name: 'Checkout',
        description: 'Página de pagamento',
        status: 'todo',
        order: 6,
        type: 'checkout',
        upsellProducts: [],
        notes: 'Ofertas complementares se aplicável'
      },
      {
        id: '',
        name: 'Upsell',
        description: 'Oferta da mentoria individual',
        status: 'todo',
        order: 7,
        type: 'upsell',
        relatedProducts: ['Reversão Pessoal da Dor'],
        notes: 'Levar para o próximo nível'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Mentoria/Grupo Fechado',
        status: 'todo',
        order: 8,
        type: 'membership',
        relatedProducts: ['Clube Movimento Sem Dor', 'Reversão PEssoal da Dor'],
        notes: 'Calls em grupo - Grupo no Whatsapp'
      }
    ]
  },
  {
    name: 'Mentoria Individual',
    type: 'individualMentoring',
    description: 'Aqui você fecha com quem quer ir fundo. É o espaço da alta confiança e retorno máximo.',
    status: 'todo',
    order: 5,
    productItems: [
      {
        id: '',
        name: 'Reversão Pessoal da Dor',
        promessa: 'Sessões 1:1 com Plano Correto para seu Corpo',
        value: 2297.00,
        status: 'todo',
        modules: [],
        lessons: [],
        bonuses: [],
        hasAffiliates: false
      }
    ],
    steps: [
      // Página de Captura (sempre primeira)
      {
        id: '',
        name: 'Página de Captura',
        description: 'Página para captura de leads',
        status: 'todo',
        order: 1,
        type: 'page',
        relatedProducts: [],
        notes: 'Página de captura de leads'
      },
      {
        id: '',
        name: 'Página de links',
        description: 'Instagram',
        status: 'todo',
        order: 2,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do aluno',
        description: 'Low ticket - Curso completo - App assinatura',
        status: 'todo',
        order: 3,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Área do assinante',
        description: 'Dentro do app',
        status: 'todo',
        order: 4,
        type: 'traffic',
        relatedProducts: [],
        notes: 'custom'
      },
      {
        id: '',
        name: 'Página de Vendas',
        description: 'Landing page da mentoria premium',
        status: 'todo',
        order: 5,
        type: 'page',
        relatedProducts: ['Reversão Pessoal da Dor'],
        notes: 'Copy e oferta irresistível'
      },
      {
        id: '',
        name: 'Checkout',
        description: 'Página de pagamento',
        status: 'todo',
        order: 6,
        type: 'checkout',
        upsellProducts: [],
        notes: 'Ofertas complementares se aplicável'
      },
      {
        id: '',
        name: 'Mentoria',
        description: 'Acompanhamento personalizado',
        status: 'todo',
        order: 7,
        type: 'mentoring',
        relatedProducts: ['Clube Movimento Sem Dor', 'Aulas Presenciais'],
        notes: 'Calls individuais - Suporte'
      }
    ]
  }
];