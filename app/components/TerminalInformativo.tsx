"use client";

import { useState } from 'react';
import { Newspaper, TrendingUp, Link as LinkIcon, ExternalLink } from 'lucide-react';

const NOTICIAS = [
    { title: "Receita Federal atualiza regras do IRPF 2026", date: "23/01", link: "https://www.gov.br/receitafederal" },
    { title: "SEFAZ-MS: Novas diretrizes para produtor rural", date: "22/01", link: "https://www.sefaz.ms.gov.br" },
    { title: "Mudanças no FGTS Digital entram em vigor", date: "21/01", link: "https://www.gov.br/trabalho-e-emprego" },
    { title: "Simples Nacional: Prazo para regularização", date: "20/01", link: "https://www.gov.br/receitafederal" },
];

const COTACOES = [
    { item: "BOI GORDO (ARROBA)", price: "R$ 315,50", trend: "+0.5%", location: "MS" },
    { item: "SOJA (SACA 60KG)", price: "R$ 138,20", trend: "-1.2%", location: "Dourados" },
    { item: "MILHO (SACA 60KG)", price: "R$ 58,40", trend: "+0.8%", location: "Sidrolândia" },
    { item: "BEZERRO (Macho)", price: "R$ 2.450,00", trend: "stable", location: "Interior" },
    { item: "VACAS (Fêmea)", price: "R$ 1.950,00", trend: "-0.3%", location: "Interior" },
];

const LINKS_UTEIS = [
    { name: "Portal e-CAC", href: "https://cav.receita.fazenda.gov.br/" },
    { name: "Portal do Empreendedor", href: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" },
    { name: "Consulta NF-e", href: "http://www.nfe.fazenda.gov.br/portal/principal.aspx" },
    { name: "FGTS Digital", href: "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/fgts-digital" },
    { name: "Sintegra MS", href: "http://www.sintegra.ms.gov.br/" },
];

export default function TerminalInformativo() {
    const [activeTab, setActiveTab] = useState<'noticias' | 'agro' | 'links'>('agro');

    return (
        <div className="brutalist-card bg-obsidian/80 border border-neutral-800 p-0 overflow-hidden glow-amber">
            {/* Tab Header */}
            <div className="flex border-b border-neutral-800 bg-neutral-900/50">
                <button
                    onClick={() => setActiveTab('agro')}
                    className={`flex-1 py-4 font-sans text-xs font-bold tracking-wider transition-all border-r border-neutral-800/50 ${activeTab === 'agro' ? 'bg-amber-electric text-obsidian' : 'text-neutral-500 hover:text-amber-electric'}`}
                >
                    MERCADO AGRO
                </button>
                <button
                    onClick={() => setActiveTab('noticias')}
                    className={`flex-1 py-4 font-sans text-xs font-bold tracking-wider transition-all border-r border-neutral-800/50 ${activeTab === 'noticias' ? 'bg-amber-electric text-obsidian' : 'text-neutral-500 hover:text-amber-electric'}`}
                >
                    NOTÍCIAS
                </button>
                <button
                    onClick={() => setActiveTab('links')}
                    className={`flex-1 py-4 font-sans text-xs font-bold tracking-wider transition-all ${activeTab === 'links' ? 'bg-amber-electric text-obsidian' : 'text-neutral-500 hover:text-amber-electric'}`}
                >
                    LINKS ÚTEIS
                </button>
            </div>

            <div className="p-6 min-h-[300px]">
                {activeTab === 'agro' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-mono text-amber-electric/50 uppercase tracking-widest">Indicadores de Mercado</span>
                            <span className="text-[10px] font-mono text-neutral-600 italic">Ref: Sidrolândia/MS</span>
                        </div>
                        <div className="space-y-4">
                            {COTACOES.map((c, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-neutral-800/50 pb-3 group">
                                    <div>
                                        <div className="text-[10px] text-neutral-500 font-mono mb-1 uppercase">{c.item}</div>
                                        <div className="text-xl font-display font-bold group-hover:text-amber-electric transition-colors">{c.price}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-mono font-bold ${c.trend.startsWith('+') ? 'text-green-500' : c.trend.startsWith('-') ? 'text-red-500' : 'text-neutral-500'}`}>
                                            {c.trend}
                                        </div>
                                        <div className="text-[9px] text-neutral-600 font-mono italic">{c.location}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'noticias' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-6 text-[10px] font-mono text-amber-electric/50 uppercase tracking-widest">
                            <Newspaper size={12} className="text-amber-electric" />
                            Últimas Atualizações Fiscais
                        </div>
                        <div className="space-y-6">
                            {NOTICIAS.map((n, i) => (
                                <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block group border-l border-neutral-800 pl-4 hover:border-amber-electric transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] text-amber-electric/60 font-mono">[{n.date}]</span>
                                        <ExternalLink size={10} className="text-neutral-700 group-hover:text-amber-electric transition-colors" />
                                    </div>
                                    <h4 className="text-sm font-sans font-medium text-neutral-300 group-hover:text-neutral-50 leading-tight">
                                        {n.title}
                                    </h4>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="text-[10px] font-mono text-amber-electric/50 uppercase tracking-widest mb-6">Portais e Ferramentas</div>
                        <div className="grid grid-cols-1 gap-2">
                            {LINKS_UTEIS.map((l, i) => (
                                <a
                                    key={i}
                                    href={l.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 border border-neutral-800 hover:border-amber-electric/30 bg-neutral-900/30 hover:bg-amber-electric/5 transition-all flex justify-between items-center group"
                                >
                                    <span className="font-mono text-xs text-neutral-400 group-hover:text-neutral-100 uppercase tracking-tight">{l.name}</span>
                                    <LinkIcon size={14} className="text-neutral-700 group-hover:text-amber-electric" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-neutral-900 px-6 py-2 flex justify-between items-center border-t border-neutral-800">
                <span className="font-mono text-[8px] text-neutral-600 italic">Atualizado em: {new Date().toLocaleDateString()}</span>
                <div className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="font-mono text-[8px] text-green-500/50 uppercase tracking-tighter text-glow">Feed Ativo</span>
                </div>
            </div>
        </div>
    );
}
