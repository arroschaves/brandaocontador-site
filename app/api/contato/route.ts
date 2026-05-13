import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * API de Contato - Brandão Contabilidade
 * Envia email e gera link de notificação WhatsApp
 */

// Rate limiting simples em memória
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 3; // máximo 3 envios por minuto

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
        return false;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return true;
    }

    entry.count++;
    return false;
}

// Sanitização básica contra XSS
function sanitize(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Muitas tentativas. Aguarde um momento antes de enviar novamente.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validação dos campos obrigatórios
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios.' },
                { status: 400 }
            );
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'E-mail inválido.' },
                { status: 400 }
            );
        }

        // Sanitização
        const safeName = sanitize(name);
        const safeEmail = sanitize(email);
        const safeSubject = sanitize(subject);
        const safeMessage = sanitize(message);

        // Mapeamento de assuntos
        const subjectMap: Record<string, string> = {
            contabilidade: 'Serviços Contábeis',
            fiscal: 'Inteligência Fiscal',
            trabalhista: 'Recursos Humanos',
            consultoria: 'Estratégia e Dados',
            outros: 'Outros Assuntos',
        };

        const subjectLabel = subjectMap[safeSubject] || safeSubject;
        const whatsappMessage = encodeURIComponent(
            `Nova mensagem do site%0A%0A` +
            `Nome: ${safeName}%0A` +
            `Email: ${safeEmail}%0A` +
            `Assunto: ${subjectLabel}%0A` +
            `Mensagem: ${safeMessage.substring(0, 400)}${safeMessage.length > 400 ? '...' : ''}`
        );
        const whatsappLink = `https://wa.me/5567996011356?text=${whatsappMessage}`;

        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

        if (!smtpUser || !smtpPass) {
            return NextResponse.json({
                success: true,
                fallback: true,
                message: 'Recebemos sua mensagem. Para concluir o contato agora, continue pelo WhatsApp.',
                whatsappLink,
            });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Template do email em HTML
        const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0B; color: #e5e5e5; padding: 40px;">
        <div style="border-bottom: 3px solid #FFB000; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #FFB000; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
            Nova Mensagem do Site
          </h1>
          <p style="color: #666; font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">
            Formulário de Contato — brandaocontador.com.br
          </p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #FFB000; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; width: 120px;">Nome</td>
            <td style="padding: 12px 0; color: #e5e5e5; font-size: 15px;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #FFB000; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">E-mail</td>
            <td style="padding: 12px 0;"><a href="mailto:${safeEmail}" style="color: #FFB000; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #FFB000; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Assunto</td>
            <td style="padding: 12px 0; color: #e5e5e5; font-size: 15px;">${subjectLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #FFB000; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Mensagem</td>
            <td style="padding: 12px 0; color: #e5e5e5; font-size: 15px; line-height: 1.6;">${safeMessage.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
          <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
            Brandão Contabilidade © ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `;

        // Enviar email
        await transporter.sendMail({
            from: `"Site Brandão Contabilidade" <${smtpUser}>`,
            to: 'adm@brandaocontador.com.br',
            replyTo: safeEmail,
            subject: `[Site] ${subjectLabel} — ${safeName}`,
            html: htmlContent,
        });

        return NextResponse.json({
            success: true,
            message: 'Mensagem enviada com sucesso! Retornaremos em breve.',
            whatsappLink,
        });

    } catch (error) {
        console.error('Erro ao enviar mensagem de contato:', error);
        return NextResponse.json(
            { error: 'Erro ao enviar mensagem. Tente novamente ou entre em contato via WhatsApp.' },
            { status: 500 }
        );
    }
}
