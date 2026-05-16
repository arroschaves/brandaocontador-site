/**
 * Módulo de Segurança - Brandão Contador
 * Funções utilitárias para validação e sanitização
 */

// Validador de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validador de CPF
export function isValidCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');

  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }

  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }

  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  return digit1 === parseInt(cleanCpf[9]) && digit2 === parseInt(cleanCpf[10]);
}

// Validador de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, '');

  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;

  const weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj[i]) * weights[i];
  }

  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  weights.unshift(6);
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj[i]) * weights[i];
  }

  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  return digit1 === parseInt(cleanCnpj[12]) && digit2 === parseInt(cleanCnpj[13]);
}

// Sanitização HTML básica
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Sanitização para URLs
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Apenas permitir http e https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

// Sanitização de texto geral
export function sanitizeText(input: string, maxLength: number = 1000): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Validação de telefone brasileiro
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
}

// Normalizar telefone brasileiro
export function normalizePhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `+55${clean}`;
  }
  if (clean.length === 10) {
    return `+55${clean}`;
  }
  return phone;
}

// Validação de senha segura
export function isSecurePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo de 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Pelo menos um caractere especial');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Limpar dados sensíveis para logs
export function sanitizeForLogs(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'api_key',
    'apikey',
    'authorization',
    'credit_card',
    'cpf',
    'cnpj',
    'rg',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

// Gerar token seguro aleatório
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Verificar se string contém SQL injection
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(union\s+select|union\s+all)/i,
    /(\bor\b\s+\d+\s*=\s*\d+)/i,
    /(\band\b\s+\d+\s*=\s*\d+)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// Verificar se string contém XSS
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /expression\s*\(/gi,
    /data:\s*text\/html/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

// Validar entrada de formulário
export function validateFormInput(data: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  cpf?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (data.name) {
    if (data.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    if (data.name.length > 100) {
      errors.name = 'Nome muito longo';
    }
    if (containsSqlInjection(data.name) || containsXSS(data.name)) {
      errors.name = 'Caracteres inválidos detectados';
    }
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Telefone inválido';
  }

  if (data.cpf && !isValidCPF(data.cpf)) {
    errors.cpf = 'CPF inválido';
  }

  if (data.message) {
    if (data.message.length < 10) {
      errors.message = 'Mensagem muito curta';
    }
    if (data.message.length > 2000) {
      errors.message = 'Mensagem muito longa (máximo 2000 caracteres)';
    }
    if (containsSqlInjection(data.message) || containsXSS(data.message)) {
      errors.message = 'Conteúdo inválido detectado';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Rate Limiter para APIs
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.maxRequests;
    return Math.max(0, this.maxRequests - record.count);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Singleton do rate limiter global
export const globalRateLimiter = new RateLimiter(100, 60000);