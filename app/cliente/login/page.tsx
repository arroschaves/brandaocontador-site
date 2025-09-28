import Header from '../../components/Header';
import { User, Lock, LogIn, Shield, FileText, Clock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-6 py-16">
        <div className="max-w-md w-full">
          
          {/* Header da Área do Cliente */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Área Segura
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Área do <span className="text-yellow-500">Cliente</span>
            </h1>
            <p className="text-gray-300">
              Acesse seus documentos e informações contábeis
            </p>
          </div>

          {/* Formulário de Login */}
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 backdrop-blur-sm">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
                  />
                  Lembrar de mim
                </label>
                <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Entrar na Área do Cliente
              </button>
            </form>
          </div>

          {/* Informações sobre a Área do Cliente */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-yellow-500 text-center">
              O que você encontra na área do cliente:
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-gray-300">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Documentos contábeis e fiscais</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Acompanhamento de prazos</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span>Ambiente seguro e protegido</span>
              </div>
            </div>
          </div>

          {/* Não tem acesso? */}
          <div className="mt-8 text-center p-6 bg-slate-800/30 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-white mb-2">
              Ainda não tem acesso?
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              Entre em contato conosco para solicitar suas credenciais de acesso
            </p>
            <a
              href="/contato"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
            >
              Solicitar Acesso
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
