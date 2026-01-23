import Link from 'next/link';
import { ShieldCheck, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-obsidian border-t border-neutral-800 pt-20 pb-10">
            <div className="container-custom">
                <div className="grid md:grid-cols-12 gap-16 mb-20">
                    <div className="md:col-span-5">
                        <Link href="/" className="inline-block mb-8">
                            <img src="/logo-full.jpg" alt="Brandão Logo" className="h-12 w-auto grayscale contrast-125 brightness-110" />
                        </Link>
                        <p className="text-neutral-500 font-sans text-sm leading-relaxed max-w-sm mb-8 uppercase tracking-tight">
                            Desde 1993, transformando a complexidade contábil em vantagem estratégica para o agronegócio e empresas em Mato Grosso do Sul.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-neutral-600 hover:text-amber-electric transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-neutral-600 hover:text-amber-electric transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-neutral-600 hover:text-amber-electric transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="text-xs font-mono text-amber-electric uppercase tracking-widest mb-8">Navegação</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-neutral-400 hover:text-neutral-50 text-sm font-sans uppercase transition-colors">Início</Link></li>
                            <li><Link href="/servicos" className="text-neutral-400 hover:text-neutral-50 text-sm font-sans uppercase transition-colors">Serviços</Link></li>
                            <li><Link href="/noticias-contabeis" className="text-neutral-400 hover:text-neutral-50 text-sm font-sans uppercase transition-colors">Notícias</Link></li>
                            <li><Link href="/contato" className="text-neutral-400 hover:text-neutral-50 text-sm font-sans uppercase transition-colors">Contato</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="text-xs font-mono text-amber-electric uppercase tracking-widest mb-8">Segurança & Conformidade</h4>
                        <div className="bg-neutral-900/40 border border-neutral-800 p-6">
                            <div className="flex items-center gap-4 mb-4 text-emerald-500/80">
                                <ShieldCheck size={28} />
                                <span className="text-[10px] font-mono leading-tight tracking-widest uppercase">Conexão Criptografada <br /> Protocolo SSL Ativo</span>
                            </div>
                            <p className="text-[10px] text-neutral-600 font-mono leading-relaxed uppercase">
                                Seus dados estão protegidos por criptografia de ponta a ponta em conformidade com a LGPD.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-neutral-900 gap-6">
                    <p className="text-[10px] font-mono text-neutral-700 uppercase tracking-widest">
                        © {currentYear} BRANDÃO CONTABILIDADE. TODOS OS DIREITOS RESERVADOS.
                    </p>
                    <p className="text-[10px] font-mono text-neutral-800 uppercase tracking-widest">
                        SDR // MS // 20.9391° S, 54.9658° W
                    </p>
                </div>
            </div>
        </footer>
    );
}
