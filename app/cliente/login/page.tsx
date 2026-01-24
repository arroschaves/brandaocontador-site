'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, ArrowRight, ShieldCheck, FileText, Clock, ShieldAlert, Loader2 } from 'lucide-react'

/**
 * PÁGINA DE LOGIN DO CLIENTE - BRANDÃO CONTABILIDADE
 * Design: Brutalista Premium de Alta Definição
 */
export default function ClienteLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulação de delay para efeito UX de segurança
    setTimeout(() => {
      setError('CREDENCIAIS NÃO LOCALIZADAS. ENTRE EM CONTATO COM O SUPORTE.')
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col md:flex-row">
      {/* Coluna de Impacto Visual (Esquerda) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 border-r border-neutral-800 p-20 flex-col justify-between relative overflow-hidden">
        <div className="bg-noise absolute inset-0 opacity-10"></div>

        <div className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-1000">
          <img src="/logo-full.jpg" alt="Brandão" className="h-16 w-auto brightness-125 mb-10" />
          <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">
            PORTAL DO <br />
            <span className="text-amber-electric">CLIENTE.</span>
          </h1>
        </div>

        <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <div className="flex items-center gap-6 group">
            <div className="p-4 border-2 border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-all">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="font-black uppercase text-xs tracking-widest text-neutral-100">Documentação Ágil</h4>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Acesso direto a balancetes e guias fiscais</p>
            </div>
          </div>
          <div className="flex items-center gap-6 group">
            <div className="p-4 border-2 border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-all">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-black uppercase text-xs tracking-widest text-neutral-100">Segurança de Dados</h4>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Criptografia de nível bancário (SSL 256-bit)</p>
            </div>
          </div>
        </div>

        {/* Linha decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-electric opacity-20"></div>
      </div>

      {/* Coluna do Formulário (Direita) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 relative">
        <div className="w-full max-w-md space-y-12 relative z-10">
          <div className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 text-amber-electric font-mono text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              <span className="w-10 h-[1px] bg-amber-electric"></span> AMBIENTE PROTEGIDO
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">IDENTIFIQUE-SE</h2>
            <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest leading-relaxed">
              Insira suas credenciais corporativas para acessar o painel de controle.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-5 flex items-center gap-4 animate-shake">
                <ShieldAlert size={24} className="text-red-500 flex-shrink-0" />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1 group-focus-within:text-amber-electric transition-colors">E-mail Registrado</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-900 border-2 border-neutral-800 p-5 pl-14 text-white font-bold focus:border-amber-electric outline-none transition-all placeholder:text-neutral-700"
                    placeholder="INSIRA SEU E-MAIL"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1 group-focus-within:text-amber-electric transition-colors">Chave Privada</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-900 border-2 border-neutral-800 p-5 pl-14 text-white font-bold focus:border-amber-electric outline-none transition-all placeholder:text-neutral-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal w-full py-6 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="text-base tracking-[0.2em]">SISTEMA_AUTENTICAR</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-neutral-900">
            <button className="text-[10px] font-black text-neutral-600 hover:text-amber-electric uppercase tracking-widest transition-colors">
              Recuperar Acesso
            </button>
            <a href="/contato" className="text-[10px] font-black text-neutral-600 hover:text-amber-electric uppercase tracking-widest transition-colors">
              Solicitar Registro
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 text-[8px] font-mono text-neutral-800 uppercase tracking-[0.5em] hidden md:block">
          Brandao // Core_Release // 2026
        </div>
      </div>
    </div>
  )
}
