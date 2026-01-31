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
        pass: process.env.ZOHO_PASS_RH,
    },
    ADM: {
        user: 'adm@brandaocontador.com.br',
        pass: process.env.ZOHO_PASS_ADM,
    },
    COMERCIAL: {
        user: 'cjbrandao@brandaocontador.com.br',
        pass: process.env.ZOHO_PASS_CJ,
    }
};

export async function sendProfessionalEmail({ from, to, subject, text, html, attachments }: EmailOptions) {
    const account = ACCOUNTS[from];

    if (!account.pass) {
        console.error(`Senha de app não configurada para a conta ${from}`);
        return { success: false, error: 'Configuração ausente' };
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com.br',
        port: 465,
        secure: true,
        auth: {
            user: account.user,
            pass: account.pass,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"${from} - Brandão Contabilidade" <${account.user}>`,
            to,
            subject,
            text,
            html,
            attachments
        });

        console.log(`E-mail enviado via ${from}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error(`Erro ao enviar e-mail via ${from}:`, error);
        return { success: false, error: error.message };
    }
}
