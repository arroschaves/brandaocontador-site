import Header from '../components/Header';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

export default function ContatoPage() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            Entre em Contato
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fale <span className="text-yellow-500">Conosco</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Estamos prontos para atender você e sua empresa. 
            Entre em contato e solicite um orçamento personalizado.
          </p>
        </div>
      </section>

      {/* Contato e Formulário */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          
          {/* Informações de Contato */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-yellow-500 mb-6">
                Informações de Contato
              </h2>
              <p className="text-gray-300 mb-8">
                Nossa equipe está sempre disponível para esclarecer suas dúvidas 
                e oferecer as melhores soluções contábeis para seu negócio.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Phone className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Telefones</h3>
                  <p className="text-gray-300">(67) 3272-1356</p>
                  <p className="text-gray-300">(67) 99601-1356</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">E-mail</h3>
                  <p className="text-gray-300">contato@brandaocontador.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Endereço</h3>
                  <p className="text-gray-300">
                    Rua Exemplo, 123<br />
                    Centro - Sidrolândia/MS<br />
                    CEP: 79170-000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Horário de Funcionamento</h3>
                  <p className="text-gray-300">
                    Segunda a Sexta: 8h às 18h<br />
                    Sábado: 8h às 12h
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="p-6 bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">
                Atendimento Rápido via WhatsApp
              </h3>
              <p className="text-gray-300 mb-4">
                Para um atendimento mais ágil, entre em contato conosco pelo WhatsApp
              </p>
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chamar no WhatsApp
              </a>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6">
              Envie sua Mensagem
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="(67) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Serviço
                </label>
                <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <option value="">Selecione um serviço</option>
                  <option value="abertura">Abertura de Empresa</option>
                  <option value="contabilidade">Contabilidade Geral</option>
                  <option value="fiscal">Escrituração Fiscal</option>
                  <option value="trabalhista">Área Trabalhista</option>
                  <option value="ir">Imposto de Renda</option>
                  <option value="rural">Contabilidade Rural</option>
                  <option value="consultoria">Consultoria</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensagem *
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="Descreva como podemos ajudá-lo..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
