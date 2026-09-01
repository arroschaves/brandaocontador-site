import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from 'lucide-react';

/**
 * Footer moderno e profissional com informações de contato,
 * links rápidos e identidade visual premium.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/70 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero pointer-events-none opacity-70" />
      {/* Conteúdo principal */}
      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Coluna 1: Marca */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black ring-2 ring-primary/40">
                <Image src="/logo-icon.jpg" alt="Logo" fill className="object-cover" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">Brandão</p>
                <p className="text-[11px] font-semibold text-primary tracking-wider uppercase">Contabilidade</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mais de 30 anos transformando números em decisões estratégicas para empresas e produtores rurais em Sidrolândia e região.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Online — Respondemos em minutos</span>
            </div>
          </div>

          {/* Coluna 2: Serviços */}
          <div className="space-y-5">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">Serviços</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                'Contabilidade Empresarial',
                'Departamento Pessoal',
                'Legalização de Empresas',
                'Agronegócio & Rural',
                'Planejamento Tributário',
                'Certificado Digital',
              ].map((item) => (
                <Link key={item} href="/servicos" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* Coluna 3: Links */}
          <div className="space-y-5">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">Links Rápidos</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { name: 'Sobre Nós', href: '/sobre' },
                { name: 'Ferramentas', href: '/ferramentas' },
                { name: 'Notícias Contábeis', href: '/noticias-contabeis' },
                { name: 'Links Úteis', href: '/links-uteis' },
                { name: 'Reforma Tributária', href: '/reforma-tributaria' },
                { name: 'Contato', href: '/contato' },
              ].map((link) => (
                <Link key={link.name} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Coluna 4: Contato */}
          <div className="space-y-5">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">Contato</h3>
            <div className="space-y-4">

              <a href="https://wa.me/5567996011356" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">(67) 99601-1356</p>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                </div>
              </a>
              <a href="mailto:adm@brandaocontador.com.br" className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground break-all">adm@brandaocontador.com.br</p>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Rua Santa Catarina, 1010</p>
                  <p className="text-xs text-muted-foreground">Centro - Sidrolândia/MS - CEP: 79.170-000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Seg - Sex: 07:30 às 17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé legal */}
      <div className="border-t border-border relative z-10">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Brandão Contabilidade. Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-muted-foreground/60 font-mono">
            Site institucional Brandão Contabilidade
          </p>
        </div>
      </div>
    </footer>
  );
}
