import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { validateInput, contatoSchema } from '@/lib/validation';
import { globalRateLimiter, sanitizeText } from '@/lib/security';

/**
 * API de Contato - Brandão Contabilidade
 * Versão segurançada com validação robusta
 */

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Global
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    if (!globalRateLimiter.isAllowed(ip)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um momento.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 2. Parse e validação com Zod
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Formato de requisição inválido.' },
        { status: 400 }
      );
    }

    // 3. Validar entrada com schema
    const validation = validateInput(contatoSchema, body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Dados inválidos.',
          details: validation.errors.map(e => `${e.field}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, phone } = validation.data!;

    // 4. Sanitização adicional (backup)
    const safeName = sanitizeText(name, 100);
    const safeEmail = email.toLowerCase().trim();
    const safeSubject = subject;
    const safeMessage = sanitizeText(message, 2000);

    // 5. Verificar tamanho da mensagem (prevenir DoS)
    if (JSON.stringify(body).length > 1024 * 1024) {
      return NextResponse.json(
        { error: 'Requisição muito grande.' },
        { status: 413 }
      );
    }

    // 6. Mapeamento de assuntos
    const subjectMap: Record<string, string> = {
      contabilidade: 'Serviços Contábeis',
      fiscal: 'Inteligência Fiscal',
      trabalhista: 'Recursos Humanos',
      consultoria: 'Estratégia e Dados',
      outros: 'Outros Assuntos',
    };

    const subjectLabel = subjectMap[safeSubject] || safeSubject;

    // 7. Criar link WhatsApp (sanitizado)
    const whatsappMessage = encodeURIComponent(
      `Nova mensagem do site%0A%0A` +
      `Nome: ${safeName}%0A` +
      `Email: ${safeEmail}${phone ? `%0ATelefone: ${phone}` : ''}%0A` +
      `Assunto: ${subjectLabel}%0A` +
      `Mensagem: ${safeMessage.substring(0, 400)}${safeMessage.length > 400 ? '...' : ''}`
    );
    const whatsappLink = `https://wa.me/5567996011356?text=${whatsappMessage}`;

    // 8. Configuração do email
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

    // Fallback se SMTP não configurado
    if (!smtpUser || !smtpPass) {
      console.warn('[CONTATO] SMTP não configurado, usando fallback WhatsApp');
      return NextResponse.json({
        success: true,
        fallback: true,
        message: 'Recebemos sua mensagem. Continue pelo WhatsApp.',
        whatsappLink,
      });
    }

    // 9. Enviar email com timeout
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
    });

    // Template HTML seguro
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
          ${phone ? `
          <tr>
            <td style="padding: 12px 0; color: #FFB000; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Telefone</td>
            <td style="padding: 12px 0; color: #e5e5e5; font-size: 15px;">${phone}</td>
          </tr>
          ` : ''}
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

    // Enviar com timeout
    const sendPromise = transporter.sendMail({
      from: `"Site Brandão Contabilidade" <${smtpUser}>`,
      to: 'adm@brandaocontador.com.br',
      replyTo: safeEmail,
      subject: `[Site] ${subjectLabel} — ${safeName}`,
      html: htmlContent,
    });

    // Timeout de 10 segundos para envio
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout sending email')), 10000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`[CONTATO] Mensagem enviada com sucesso de ${safeEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      whatsappLink,
    });

  } catch (error: unknown) {
    console.error('[CONTATO] Erro:', error);

    // Não expor detalhes do erro ao cliente
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}

// GET handler para health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rateLimitRemaining: 'N/A via GET',
  });
}