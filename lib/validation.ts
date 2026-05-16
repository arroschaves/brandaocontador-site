/**
 * Validadores de Entrada - Brandão Contador
 * Schema validation usando Zod
 */

import { z } from 'zod';

// Schema para contato
export const contatoSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z\sÀ-ÿ]+$/, 'Nome inválido'),
  email: z
    .string()
    .email('Email inválido')
    .max(254, 'Email muito longo'),
  subject: z
    .enum(['contabilidade', 'fiscal', 'trabalhista', 'consultoria', 'outros'], {
      errorMap: () => ({ message: 'Assunto inválido' }),
    }),
  message: z
    .string()
    .min(10, 'Mensagem muito curta')
    .max(2000, 'Mensagem muito longa')
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      'Conteúdo inválido detectado'
    ),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s()-]{10,}$/.test(val),
      'Telefone inválido'
    ),
});

// Schema para inscrição newsletter
export const newsletterSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(254, 'Email muito longo'),
  nome: z
    .string()
    .max(100, 'Nome muito longo')
    .optional(),
  interesse: z
    .enum(['contabilidade', 'fiscal', 'trabalhista', 'juridico', 'all'])
    .optional(),
});

// Schema para avaliação
export const avaliacaoSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  nota: z.number().min(1).max(5),
  comentario: z.string().max(500).optional(),
});

// Schema para busca de notícias
export const buscaNoticiasSchema = z.object({
  busca: z.string().max(100).optional(),
  categoria: z.string().max(50).optional(),
  page: z.coerce.number().min(1).max(100).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

// Schema para webhook
export const webhookSchema = z.object({
  tipo: z.string().min(1).max(50),
  payload: z.record(z.unknown()),
  timestamp: z.number().optional(),
  signature: z.string().optional(),
});

// Tipos inferidos
export type ContatoInput = z.infer<typeof contatoSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;
export type BuscaNoticiasInput = z.infer<typeof buscaNoticiasSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;

// Função de validação com erro tipado
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return { valid: false, errors, data: null };
  }

  return { valid: true, errors: [], data: result.data };
}

// Validador de API key
export function validateApiKey(apiKey: string | null | undefined): boolean {
  if (!apiKey) return false;
  if (apiKey.length < 20) return false;
  if (apiKey.includes(' ') || apiKey.includes('\n')) return false;
  return true;
}

// Verificar tamanho do corpo da requisição
export function validateRequestSize(
  body: unknown,
  maxSizeBytes: number = 1024 * 1024 // 1MB default
): boolean {
  const size = JSON.stringify(body).length;
  return size <= maxSizeBytes;
}