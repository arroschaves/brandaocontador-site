import crypto from 'crypto'

/**
 * Módulo Vault - Sistema de Criptografia Elite (AES-256-GCM)
 * 
 * Este módulo é responsável por proteger dados ultra-sensíveis,
 * como Certificados Digitais A1, garantindo que mesmo um vazamento
 * do banco de dados não exponha as chaves do cliente.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Obtém a chave de criptografia do ambiente.
 * Deve ser uma string de 32 bytes (64 caracteres hex ou string normal de 32).
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
        // Fallback apenas para não quebrar em dev, mas avisar no console
        if (process.env.NODE_ENV === 'production') {
            throw new Error('CRITICAL: ENCRYPTION_KEY não configurada no ambiente de produção!')
        }
        return Buffer.alloc(KEY_LENGTH, 'dev-placeholder-key-32-chars-long')
    }

    // Se for Hex (64 caracteres), converte. Se for string, preenche/corta.
    if (key.length === 64) {
        return Buffer.from(key, 'hex')
    }

    return Buffer.from(key.padEnd(KEY_LENGTH, '0').slice(0, KEY_LENGTH))
}

export interface EncryptedData {
    data: string; // Base64
    iv: string;   // Hex
    tag: string;  // Hex
}

/**
 * Criptografa um dado (string ou buffer) usando AES-256-GCM.
 */
export function encrypt(data: string | Buffer): EncryptedData {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    const tag = cipher.getAuthTag()

    return {
        data: encrypted.toString('base64'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
    }
}

/**
 * Descriptografa um dado usando AES-256-GCM.
 */
export function decrypt(encrypted: EncryptedData): Buffer {
    const key = getEncryptionKey()
    const iv = Buffer.from(encrypted.iv, 'hex')
    const tag = Buffer.from(encrypted.tag, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    decipher.setAuthTag(tag)

    const data = Buffer.from(encrypted.data, 'base64')
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])

    return decrypted
}

/**
 * Utility para converter string em hash seguro (irreversível)
 * Útil para comparar senhas ou chaves de serviço se necessário.
 */
export function hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
}
