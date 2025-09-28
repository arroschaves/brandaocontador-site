import Header from '../../components/Header';
import { User, Lock, LogIn, Shield, FileText, Clock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white min-h-screen">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-6 py-16">
        <div className="max-w-md w-full">
          
          {/* Header da Área do Cliente */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Área Segura
            </div>
            <h1 className="text-3xl font-bold text-neutral-100 mb-2">
              Área do <span className="text-gradient">Cliente</span>
            </h1>
            <p className="text-neutral-300 leading-relaxed">
              Acesse seus documentos e informações contábeis
            </p>
          </div>

          {/* Formulário de Login */}
          <div className="card backdrop-blur-sm">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-neutral-300">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-primary-500"
                  />
                  Lembrar de mim
                </label>
                <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Entrar na Área do Cliente
              </button>
            </form>
          </div>

          {/* Informações sobre a Área do Cliente */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gradient text-center">
              O que você encontra na área do cliente:
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-neutral-300">
                <FileText className="w-5 h-5 text-primary-400" />
                <span>Documentos contábeis e fiscais</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Clock className="w-5 h-5 text-success-400" />
                <span>Acompanhamento de prazos</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Shield className="w-5 h-5 text-warning-400" />
                <span>Ambiente seguro e protegido</span>
              </div>
            </div>
          </div>

          {/* Não tem acesso? */}
          <div className="mt-8 text-center p-6 bg-neutral-800/30 rounded-lg border border-neutral-700">
            <h4 className="font-semibold text-neutral-100 mb-2">
              Ainda não tem acesso?
            </h4>
            <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
              Entre em contato conosco para solicitar suas credenciais de acesso
            </p>
            <a
              href="/contato"
              className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              Solicitar Acesso
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
