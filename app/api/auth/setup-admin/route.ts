import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    console.log('[Setup Admin] Iniciando protocolo de criação...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('[Debug] URL configurada:', !!supabaseUrl)
    console.log('[Debug] Key configurada:', !!supabaseKey)

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        return NextResponse.json({
            error: 'NÚCLEO OFFLINE: As variáveis do Supabase não foram encontradas pela Vercel. Faça um novo Deploy no painel da Vercel para ativá-las.'
        }, { status: 500 })
    }

    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Identificação e Chave são obrigatórias' }, { status: 400 })
        }

        // Teste de conectividade pura
        try {
            const testFetch = await fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET' })
            console.log('[Debug] Conectividade Supabase:', testFetch.status)
        } catch (fetchErr: any) {
            console.error('[Debug] Falha na rede servidor-servidor:', fetchErr.message)
            return NextResponse.json({
                error: `ERRO DE REDE: O servidor da Vercel não conseguiu alcançar o Supabase (${fetchErr.message}). Verifique se a URL está correta.`
            }, { status: 500 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'admin',
                    full_name: 'Administrador Maestro'
                }
            }
        })

        if (error) {
            console.error('[Setup Admin] Erro Supabase:', error.message)
            return NextResponse.json({
                error: `Erro no Supabase: ${error.message}.`
            }, { status: 500 })
        }

        return NextResponse.json({
            message: 'PROTOCOLO CONCLUÍDO!',
            details: 'Usuário registrado. IMPORTANTE: Confirme o e-mail enviado antes de logar.',
            user: data.user?.email
        })
    } catch (err: any) {
        console.error('[Setup Admin] Falha Crítica:', err.message)
        return NextResponse.json({
            error: `FALHA NO NÚCLEO: ${err.message}.`
        }, { status: 500 })
    }
}

export async function GET() {
    return new NextResponse(`
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Setup Admin - Maestro</title>
                <style>
                    body { 
                        background: #050505; 
                        color: #e5e5e5; 
                        font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        height: 100vh; 
                        margin: 0; 
                    }
                    .card { 
                        background: #0a0a0a; 
                        padding: 2.5rem; 
                        border: 1px solid #222; 
                        width: 100%; 
                        max-width: 400px; 
                        border-radius: 4px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    h1 { color: #f59e0b; font-size: 1.2rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
                    p { font-size: 0.8rem; color: #737373; margin-bottom: 2rem; }
                    label { font-size: 0.7rem; font-weight: bold; text-transform: uppercase; color: #404040; display: block; margin-bottom: 0.4rem; }
                    input { 
                        width: 100%; 
                        padding: 1rem; 
                        margin-bottom: 1.5rem; 
                        background: #000; 
                        border: 1px solid #1a1a1a; 
                        color: white; 
                        box-sizing: border-box; 
                        font-family: monospace;
                        outline: none;
                    }
                    input:focus { border-color: #f59e0b; }
                    button { 
                        width: 100%; 
                        padding: 1rem; 
                        background: #f59e0b; 
                        border: none; 
                        color: black;
                        font-weight: 900; 
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        cursor: pointer; 
                        transition: all 0.2s;
                    }
                    button:hover { background: #d97706; }
                    button:disabled { background: #404040; cursor: not-allowed; }
                    #msg { margin-top: 1.5rem; font-size: 0.8rem; line-height: 1.4; border-radius: 4px; display: none; padding: 1rem; }
                    .success { display: block !important; border: 1px solid #064e3b; color: #10b981; background: rgba(16, 185, 129, 0.05); }
                    .error { display: block !important; border: 1px solid #7f1d1d; color: #ef4444; background: rgba(239, 68, 68, 0.05); }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Maestro Admin Setup</h1>
                    <p>Crie sua credencial de acesso mestre ao sistema.</p>
                    <form id="setupForm">
                        <label>E-mail Corporativo</label>
                        <input type="email" id="email" placeholder="ex: admin@brandaocontador.com.br" required>
                        <label>Senha de Acesso</label>
                        <input type="password" id="password" placeholder="••••••••" required>
                        <button type="submit" id="btn">EXECUTAR PROTOCOLO</button>
                    </form>
                    <div id="msg"></div>
                </div>
                <script>
                    document.getElementById('setupForm').onsubmit = async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('email').value;
                        const password = document.getElementById('password').value;
                        const msg = document.getElementById('msg');
                        const btn = document.getElementById('btn');
                        
                        btn.disabled = true;
                        msg.className = '';
                        msg.innerText = 'Processando requisição no núcleo...';
                        msg.style.display = 'block';
                        
                        try {
                            const res = await fetch('/api/auth/setup-admin', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                msg.className = 'success';
                                msg.innerHTML = '<strong>' + data.message + '</strong><br><br>' + data.details;
                                document.getElementById('setupForm').style.display = 'none';
                            } else {
                                msg.className = 'error';
                                msg.innerText = 'Falha no cadastro: ' + data.error;
                                btn.disabled = false;
                            }
                        } catch (err) {
                            msg.className = 'error';
                            msg.innerText = 'Erro crítico de rede ou timeout.';
                            btn.disabled = false;
                        }
                    }
                </script>
            </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html' } })
}
