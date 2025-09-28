import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

export default function ContatoPage() {
  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100 min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container-custom text-center">
          <div className="inline-flex items-center bg-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            Entre em Contato
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Fale <span className="text-gradient">Conosco</span>
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Estamos prontos para atender você e sua empresa. 
            Entre em contato e solicite um orçamento personalizado.
          </p>
        </div>
      </section>

      {/* Contato e Formulário */}
      <section className="py-20">
        <div className="container-custom grid lg:grid-cols-2 gap-12">
          
          {/* Informações de Contato */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-6">
                Informações de Contato
              </h2>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                Nossa equipe está sempre disponível para esclarecer suas dúvidas 
                e oferecer as melhores soluções contábeis para seu negócio.
              </p>
            </div>

            <div className="space-y-6">
              <div className="card flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <Phone className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100 mb-2">Telefones</h3>
                  <p className="text-neutral-300">(67) 3272-1356</p>
                  <p className="text-neutral-300">(67) 99601-1356</p>
                </div>
              </div>

              <div className="card flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <Mail className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100 mb-2">E-mail</h3>
                  <p className="text-neutral-300">contato@brandaocontador.com.br</p>
                </div>
              </div>

              <div className="card flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100 mb-2">Endereço</h3>
                  <a 
                    href="https://maps.google.com/maps?q=Campo+Grande,+MS,+Brasil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-300 hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    Rua Exemplo, 123<br />
                    Centro - Campo Grande/MS<br />
                    CEP: 79000-000
                  </a>
                  <p className="text-sm text-primary-400 mt-2">
                    📍 Clique para ver no Google Maps
                  </p>
                </div>
              </div>

              <div className="card flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <Clock className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100 mb-2">Horário de Funcionamento</h3>
                  <p className="text-neutral-300">
                    Segunda a Sexta: 8h às 18h<br />
                    Sábado: 8h às 12h
                  </p>
                </div>
              </div>
            </div>

            {/* CTA WhatsApp */}
            <div className="mt-8 p-6 bg-gradient-to-r from-success-600 to-success-700 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">
                Precisa de atendimento imediato?
              </h3>
              <p className="text-success-100 mb-4 leading-relaxed">
                Fale conosco pelo WhatsApp e receba atendimento personalizado.
              </p>
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-success-600 px-6 py-3 rounded-lg font-semibold hover:bg-success-50 transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </a>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="card">
            <h2 className="text-2xl font-bold text-neutral-100 mb-6">
              Envie sua Mensagem
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="(67) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Assunto
                </label>
                <select className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors">
                  <option value="">Selecione um assunto</option>
                  <option value="contabilidade">Serviços Contábeis</option>
                  <option value="fiscal">Questões Fiscais</option>
                  <option value="trabalhista">Questões Trabalhistas</option>
                  <option value="consultoria">Consultoria</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Mensagem
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition-colors"
                  placeholder="Descreva como podemos ajudá-lo..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
