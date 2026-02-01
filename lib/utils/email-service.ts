import nodemailer from 'nodemailer';

/**
 * Serviço de E-mail Multi-Contas Zoho
 * Gerencia envios profissionais via SMTP.
 */

interface EmailOptions {
    from: 'RH' | 'ADM' | 'COMERCIAL';
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: any[];
}

const ACCOUNTS = {
    RH: {
        user: 'rh@brandaocontador.com.br',
    },
    ADM: {
        user: 'adm@brandaocontador.com.br',
    },
    COMERCIAL: {
        user: 'cjbrandao@brandaocontador.com.br',
    }
};

export async function sendProfessionalEmail({ from, to, subject, text, html, attachments }: EmailOptions) {
    const pass = from === 'RH' ? process.env.ZOHO_PASS_RH :
        from === 'ADM' ? process.env.ZOHO_PASS_ADM :
            process.env.ZOHO_PASS_CJ;

    const account = ACCOUNTS[from];

    if (!pass) {
        console.error(`Senha de app não configurada para a conta ${from} no .env`);
        return { success: false, error: `Configuração de senha (${from}) ausente` };
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: account.user,
            pass: pass,
        },
    });

    try {
        console.log(`[Email Service] Tentando enviar e-mail via ${from} para ${to}...`);
        const info = await transporter.sendMail({
            from: `"${from} - Brandão Contabilidade" <${account.user}>`,
            to,
            subject,
            text,
            html,
            attachments
        });

        console.log(`[Email Service] SUCESSO via ${from}: ${info.messageId}`);
        console.log(`[Email Service] Resposta:`, info.response);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error(`[Email Service] FALHA CRÍTICA via ${from} para ${to}:`, error);
        return {
            success: false,
            error: `Falha na conexão SMTP: ${error.message}`
        };
    }
}
