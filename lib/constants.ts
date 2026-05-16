/**
 * Constantes do Projeto
 * Configurações centralizadas
 */

// URLs e domínios
export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'brandaocontador.com.br';
export const BASE_URL = `https://${DOMAIN}`;
export const API_URL = `${BASE_URL}/api`;

// Informações de contato
export const CONTATO = {
  telefone: '+55-67-99601-1356',
  whatsapp: '5567996011356',
  email: 'contato@brandaocontador.com.br',
  emailAdm: 'adm@brandaocontador.com.br',
  endereco: {
    cidade: 'Sidrolândia',
    estado: 'MS',
    pais: 'BR',
  },
  horarios: {
    segSex: '08:00 - 18:00',
    sab: '08:00 - 12:00',
  },
};

// Redes sociais
export const REDES_SOCIAIS = {
  whatsapp: `https://wa.me/${CONTATO.whatsapp}`,
  instagram: 'https://instagram.com/brandaocontador',
  facebook: 'https://facebook.com/brandaocontador',
  linkedin: 'https://linkedin.com/company/brandaocontador',
};

// Serviços oferecidos
export const SERVICOS = {
  contabilidade: {
    titulo: 'Serviços Contábeis',
    descricao: 'Gestão contábil completa para sua empresa',
    items: [
      'Escrituração fiscal e contábil',
      'Declarações Tributárias (DIRPF, DCTF, SPED)',
      'Balancetes e demonstrações financeiras',
      'Planejamento tributário',
      'Consultoria contábil especializada',
    ],
  },
  fiscal: {
    titulo: 'Inteligência Fiscal',
    descricao: 'Otimização fiscal e compliance tributário',
    items: [
      'Planejamento tributário',
      'Gestão de impostos (ICMS, ISS, IPI, PIS, COFINS)',
      'Regimes tributários (Simples, Lucro Presumido, Lucro Real)',
      'Revisão fiscal preventiva',
      'Emissão de notas fiscais',
    ],
  },
  trabalhista: {
    titulo: 'Recursos Humanos',
    descricao: 'Gestão completa de pessoas',
    items: [
      'Folha de pagamento',
      'Admissão e demissão',
      'Contratos de trabalho',
      'CAGED e RAIS',
      'eSocial',
      'Gestão de benefícios',
    ],
  },
  consultoria: {
    titulo: 'Estratégia e Dados',
    descricao: 'Consultoria gerencial e business intelligence',
    items: [
      'Análise de resultados',
      'DRE gerencial',
      'Indicadores de performance (KPIs)',
      'Planejamento financeiro',
      'Viabilidade de investimentos',
    ],
  },
};

// Categorias de notícias
export const CATEGORIAS_NOTICIAS = [
  'contabilidade',
  'fiscal',
  'trabalhista',
  'juridico',
  'agronegocio',
  'reforma-tributaria',
  'dicas',
];

// Configurações de paginação
export const PAGINACAO = {
  noticiasPorPagina: 10,
  maxPorPagina: 50,
};

// Configurações de upload
export const UPLOAD = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
};

// Rate limiting
export const RATE_LIMIT = {
  api: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100,
  },
  contato: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 3,
  },
  upload: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10,
  },
};

// Timeout para requisições externas (ms)
export const TIMEOUTS = {
  smtp: 10000,
  api: 30000,
  external: 15000,
};

// Configurações de cache
export const CACHE = {
  static: 60 * 60 * 24 * 30, // 30 dias para arquivos estáticos
  dynamic: 60 * 60, // 1 hora para conteúdo dinâmico
  api: 60 * 5, // 5 minutos para APIs
};

// Versão do app
export const APP_VERSION = process.env.npm_package_version || '0.2.0';