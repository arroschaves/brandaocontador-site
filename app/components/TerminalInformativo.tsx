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
                    className={`flex-1 py-4 font-mono text-[10px] tracking-widest transition-all ${activeTab === 'agro' ? 'bg-amber-electric text-obsidian font-bold' : 'text-neutral-500 hover:text-amber-electric'}`}
                >
                    MERCADO_AGRO
                </button>
                <button
                    onClick={() => setActiveTab('noticias')}
                    className={`flex-1 py-4 font-mono text-[10px] tracking-widest transition-all ${activeTab === 'noticias' ? 'bg-amber-electric text-obsidian font-bold' : 'text-neutral-500 hover:text-amber-electric'}`}
                >
                    NOTICIAS_DATA
                </button>
                <button
                    onClick={() => setActiveTab('links')}
                    className={`flex-1 py-4 font-mono text-[10px] tracking-widest transition-all ${activeTab === 'links' ? 'bg-amber-electric text-obsidian font-bold' : 'text-neutral-500 hover:text-amber-electric'}`}
                >
                    LINKS_FERRAMENTAS
                </button>
            </div>

            <div className="p-6 min-h-[300px]">
                {activeTab === 'agro' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mono-label text-[10px] mb-6 flex items-center justify-between">
                            <span>INDICADORES_BOVMES_v1</span>
                            <span className="text-amber-electric/50">REF: SIDROLÂNDIA/MS</span>
                        </div>
                        <div className="space-y-4">
                            {COTACOES.map((c, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-neutral-800/50 pb-3 group">
                                    <div>
                                        <div className="text-[10px] text-neutral-500 font-mono mb-1">{c.item}</div>
                                        <div className="text-xl font-display font-bold group-hover:text-amber-electric transition-colors">{c.price}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-mono ${c.trend.startsWith('+') ? 'text-green-500' : c.trend.startsWith('-') ? 'text-red-500' : 'text-neutral-500'}`}>
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
                        <div className="mono-label text-[10px] mb-6 flex items-center gap-2">
                            <Newspaper size={12} className="text-amber-electric" />
                            ULTIMAS_ATUALIZAÇÕES
                        </div>
                        <div className="space-y-6">
                            {NOTICIAS.map((n, i) => (
                                <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block group">
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
                        <div className="mono-label text-[10px] mb-6">PORTAIS_E_FERRAMENTAS</div>
                        <div className="grid grid-cols-1 gap-2">
                            {LINKS_UTEIS.map((l, i) => (
                                <a
                                    key={i}
                                    href={l.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 border border-neutral-800 hover:border-amber-electric/30 bg-neutral-900/30 hover:bg-amber-electric/5 transition-all flex justify-between items-center group"
                                >
                                    <span className="font-mono text-xs text-neutral-400 group-hover:text-neutral-100">{l.name}</span>
                                    <LinkIcon size={14} className="text-neutral-700 group-hover:text-amber-electric" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-neutral-900 px-6 py-2 flex justify-between items-center border-t border-neutral-800">
                <span className="font-mono text-[8px] text-neutral-600 italic">SYSTEM_TIME: {new Date().toLocaleTimeString()}</span>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-[8px] text-green-500/50 uppercase">LIVE_LINK</span>
                </div>
            </div>
        </div>
    );
}
