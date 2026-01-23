import { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contato | Brandão Contabilidade',
  description: 'Entre em contato com a Brandão Contabilidade em Sidrolândia - MS. Telefone, WhatsApp, E-mail e localização. Solicite seu orçamento personalizado.',
}

export default function ContatoPage() {

  return (
    <div className="bg-obsidian text-neutral-100 min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 border-b border-neutral-800">
        <div className="container-custom">
          <div className="mono-label mb-6">PROTOCOLO_DE_CONTATO // NÚCLEO_OPERACIONAL</div>
          <h1 className="mb-6 text-reveal active">
            FALE <span className="text-amber-electric italic">CONOSCO</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mb-8 leading-relaxed font-sans">
            Infraestrutura de atendimento preparada para sua empresa.
            Conecte-se aos nossos especialistas através dos canais oficiais bloqueados.
          </p>
        </div>
      </section>

      {/* Contato e Formulário */}
      <section className="py-24">
        <div className="container-custom grid lg:grid-cols-2 gap-20">

          {/* Informações de Contato */}
          <div className="space-y-12">
            <div>
              <div className="mono-label mb-4">CANAL_DIRETO</div>
              <h2 className="mb-6 text-reveal active">
                NOSSOS <span className="text-amber-electric italic">VETORES</span>.
              </h2>
              <p className="text-neutral-400 mb-8 leading-relaxed font-sans">
                Nossa equipe está disponível para processar suas demandas com a solidez de 30 anos e a agilidade da era digital.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Phone, title: "TELEFONES", data: ["(67) 3272-1356", "(67) 99601-1356"], label: "VOZ_E_DADOS" },
                { icon: Mail, title: "E-MAIL", data: ["adm@brandaocontador.com.br"], label: "COMMS_ASSÍNC_ENCRYPT" },
                { icon: MapPin, title: "ENDEREÇO", data: ["RUA SANTA CATARINA, 1010", "CENTRO - SIDROLÂNDIA/MS"], label: "COORDENADAS_FÍSICAS" },
                { icon: Clock, title: "DISPONIBILIDADE", data: ["SEG A SEX: 8H ÀS 18H", "SÁB: 8H ÀS 12H"], label: "UPTIME_SCHEDULE" },
              ].map((item, i) => (
                <div key={i} className="brutalist-card flex items-start gap-6 border-transparent border-l-amber-electric/20 hover:border-l-amber-electric">
                  <div className="p-4 bg-amber-electric/5 border border-amber-electric/10 text-amber-electric">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <div className="mono-label !text-[10px] mb-1">{item.label}</div>
                    <h3 className="font-display font-bold text-neutral-100 mb-2 uppercase text-lg">{item.title}</h3>
                    {item.data.map(line => <p key={line} className="text-neutral-400 font-mono text-sm">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <div className="p-10 bg-amber-electric border border-amber-electric">
              <h3 className="text-2xl font-display font-bold text-obsidian mb-4 uppercase">
                ATENDIMENTO_IMEDIATO.EXE
              </h3>
              <p className="text-obsidian/80 mb-8 font-mono text-sm">
                RECEBA SUPORTE EM TEMPO REAL VIA PROTOCOLO WHATSAPP.
              </p>
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-obsidian text-amber-electric px-8 py-4 font-mono font-bold tracking-widest hover:scale-105 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
              >
                <MessageCircle className="w-5 h-5" />
                CONECTAR_AGORA
              </a>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="brutalist-card bg-neutral-900/40">
            <div className="mono-label mb-4">MENSAGEM_INICIAL</div>
            <h2 className="text-3xl mb-12 font-display uppercase italic">Terminal de Envio</h2>
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="mono-label !text-[10px] mb-2 block">ID_USUÁRIO</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-4 bg-obsidian border border-neutral-800 text-neutral-100 placeholder-neutral-700 focus:outline-none focus:border-amber-electric transition-all font-mono text-sm"
                    placeholder="DIGITE SEU NOME"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email_contato" className="mono-label !text-[10px] mb-2 block">PONTO_DE_RETORNO</label>
                  <input
                    id="email_contato"
                    type="email"
                    className="w-full px-4 py-4 bg-obsidian border border-neutral-800 text-neutral-100 placeholder-neutral-700 focus:outline-none focus:border-amber-electric transition-all font-mono text-sm"
                    placeholder="EMAIL_DE_CONTATO"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mono-label !text-[10px] mb-2 block">TIPO_DE_SOLICITAÇÃO</label>
                <select
                  id="subject"
                  className="w-full px-4 py-4 bg-obsidian border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-electric transition-all font-mono text-sm appearance-none"
                  required
                >
                  <option value="">SELECIONE UM VETOR</option>
                  <option value="contabilidade">SERVIÇOS_CONTÁBEIS</option>
                  <option value="fiscal">INTELIGÊNCIA_FISCAL</option>
                  <option value="trabalhista">RECURSOS_HUMANOS</option>
                  <option value="consultoria">ESTRATÉGIA_E_DADOS</option>
                  <option value="outros">OUTROS_PROTOCOLOS</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mono-label !text-[10px] mb-2 block">PACOTE_DE_DADOS</label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-4 bg-obsidian border border-neutral-800 text-neutral-100 placeholder-neutral-700 focus:outline-none focus:border-amber-electric resize-none transition-all font-mono text-sm"
                  placeholder="DESCREVA SUA DEMANDA..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-brutal w-full py-5 text-lg group"
              >
                <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                TRANSMITIR_DADOS.EXE
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}