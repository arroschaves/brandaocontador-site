/**
 * Tipos e Interfaces do Projeto
 */

// Tipos de usuário
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de contato
export interface Contato {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: 'contabilidade' | 'fiscal' | 'trabalhista' | 'consultoria' | 'outros';
  message: string;
  createdAt?: Date;
  ip?: string;
}

// Tipos de notícia
export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo?: string;
  categoria: string;
  imagem?: string;
  autor?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  tags?: string[];
}

export interface NoticiaInput {
  titulo: string;
  conteudo: string;
  categoria: string;
  resumo?: string;
  imagem?: string;
  tags?: string[];
}

export interface NoticiaFilter {
  busca?: string;
  categoria?: string;
  page?: number;
  limit?: number;
}

// Tipos de Serviços
export interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  items: string[];
  ordem: number;
  ativo: boolean;
}

// Tipos de FAQ
export interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
}

// Tipos de API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Tipos de erro
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Tipos de Configuração
export interface SiteConfig {
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  estado: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

// Tipos de formulário
export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos de Upload
export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

// Tipos de Log
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

// Tipos de Rate Limit
export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// Tipos de CSP
export interface CSPReport {
  'csp-report': {
    'blocked-uri': string;
    'document-uri': string;
    'original-policy': string;
    'referrer': string;
    'violated-directive': string;
  };
}