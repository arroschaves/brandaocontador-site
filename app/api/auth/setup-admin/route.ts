import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const { email, password } = await request.json()

    if (!email || !password) {
        return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const supabase = createClient()

    // Tentar criar o usuário
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'admin'
            }
        }
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        message: 'Usuário administrador criado com sucesso! Agora você pode fazer login.',
        user: data.user?.email
    })
}

export async function GET() {
    return new NextResponse(`
        <html>
            <head>
                <title>Setup Admin - Brandão Maestro</title>
                <style>
                    body { background: #050505; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: #111; padding: 2rem; border: 1px solid #333; width: 100%; max-width: 400px; }
                    input { width: 100%; padding: 0.8rem; margin: 0.5rem 0; background: #000; border: 1px solid #444; color: white; box-sizing: border-box; }
                    button { width: 100%; padding: 1rem; margin-top: 1rem; background: #f59e0b; border: none; font-weight: bold; cursor: pointer; }
                    h1 { color: #f59e0b; font-size: 1.5rem; margin-bottom: 1.5rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Maestro Admin Setup</h1>
                    <p>Crie sua conta de acesso mestre.</p>
                    <form id="setupForm">
                        <input type="email" id="email" placeholder="Seu e-mail corporativo" required>
                        <input type="password" id="password" placeholder="Sua senha mestre" required>
                        <button type="submit">CRIAR ACESSO</button>
                    </form>
                    <p id="msg" style="margin-top: 1rem; font-size: 0.8rem;"></p>
                </div>
                <script>
                    document.getElementById('setupForm').onsubmit = async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('email').value;
                        const password = document.getElementById('password').value;
                        const msg = document.getElementById('msg');
                        msg.innerText = 'Processando...';
                        
                        try {
                            const res = await fetch('/api/auth/setup-admin', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                msg.style.color = '#10b981';
                                msg.innerText = data.message;
                            } else {
                                msg.style.color = '#ef4444';
                                msg.innerText = 'Erro: ' + data.error;
                            }
                        } catch (err) {
                            msg.innerText = 'Falha crítica na rede.';
                        }
                    }
                </script>
            </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html' } })
}
