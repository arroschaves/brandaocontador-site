import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'brandao_super_secret_key_32_chars_!' // Deve ter 32 caracteres no env
const IV_LENGTH = 16

/**
 * Módulo de Segurança de Elite - Brandão Maestro
 * Implementa criptografia AES-256-GCM (padrão bancário)
 */

export function encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(text: string) {
    const [ivHex, authTagHex, encryptedText] = text.split(':')

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv)

    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

/**
 * Registra atividade de auditoria com metadados de segurança
 */
export async function auditAction(supabase: any, {
    executor_id,
    cliente_id,
    acao,
    detalhes,
    request
}: any) {
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const ua = request.headers.get('user-agent') || 'unknown'

    await supabase.from('auditoria_crm').insert({
        cliente_id,
        executor_id,
        acao,
        detalhes,
        ip_address: ip,
        user_agent: ua
    })
}
