'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Mail, Phone, MapPin, Clock, ArrowLeft, Loader2, Calendar,
    FileCheck, ShieldAlert, AlertTriangle, Edit, Trash2, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ClientPageProps {
    params: Promise<{ id: string }>
}

export default function ClientDetailsPage({ params }: ClientPageProps) {
    const { id } = use(params)
    const [client, setClient] = useState<any>(null)
    const [unidades, setUnidades] = useState<any[]>([])
    const [validades, setValidades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'dados' | 'unidades' | 'vencimentos' | 'fiscal'>('dados')

    const supabase = createClient()

    useEffect(() => {
        let isMounted = true;

        async function getFullClientData() {
            if (!id) return;

            try {
                setLoading(true)
                // 1. Dados Vitais
                const { data: clientData, error: clientErr } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle()
                if (clientErr) throw clientErr;

                // 2. Unidades (Fazendas/Filiais)
                const { data: unidadesData } = await supabase
                    .from('unidades_fiscais')
                    .select('*')
                    .eq('cliente_id', id);

                // 3. Vencimentos
                const { data: validadesData } = await supabase
                    .from('controle_validades')
                    .select('*, unidade:unidades_fiscais(nome_identificador)')
                    .eq('cliente_id', id)
                    .order('data_vencimento', { ascending: true });

                if (isMounted) {
                    setClient(clientData);
                    setUnidades(unidadesData || []);
                    setValidades(validadesData || []);
                }
            } catch (err: any) {
                console.error('Erro na carga profunda:', err)
                if (isMounted) setFetchError(err.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        getFullClientData()
        return () => { isMounted = false };
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-amber-500 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="font-mono text-xs uppercase tracking-[0.3em]">Mapeando Ativos Digitais...</span>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-6">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-2" />
                <h2 className="text-2xl font-black italic uppercase text-neutral-100">CONFLITO DE DADOS</h2>
                <p className="text-neutral-500 max-w-sm font-mono text-xs opacity-70">ERRO: {fetchError}</p>
                <Link href="/admin/clientes" className="btn-brutal px-10">REINSTALAR CONEXÃO</Link>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-6">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-2" />
                <h2 className="text-2xl font-black italic uppercase text-neutral-100">CLIENTE NÃO LOCALIZADO</h2>
                <Link href="/admin/clientes" className="btn-brutal px-10">VOLTAR À BASE</Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Pro Max */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-neutral-800 pb-8">
                <div className="space-y-4">
                    <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-neutral-500 hover:text-amber-500 transition-colors uppercase font-black text-[10px] tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> VOLTAR À BASE
                    </Link>
                    <h1 className="text-5xl font-black text-neutral-100 italic tracking-tighter uppercase leading-tight">
                        {client.nome}
                        <span className="block text-amber-500 text-lg not-italic mt-1 opacity-80">{client.razao_social || 'CONTRATO INDIVIDUAL'}</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-neutral-300 text-[10px] font-black uppercase transition-all rounded-xl">EDITAR PERFIL</button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-neutral-950 text-[10px] font-black uppercase transition-all rounded-xl hover:bg-amber-400">ORGANIZAR DRIVE</button>
                </div>
            </div>

            {/* Abas Brutalistas */}
            <div className="flex gap-4 border-b border-neutral-800">
                {[
                    { id: 'dados', label: 'DADOS VITAIS', icon: ShieldAlert },
                    { id: 'unidades', label: 'FAZENDAS / FILIAIS', icon: MapPin },
                    { id: 'vencimentos', label: 'VENCIMENTOS', icon: Clock },
                    { id: 'fiscal', label: 'FISCAL & NF', icon: FileCheck }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-amber-500 border-amber-500'
                                : 'text-neutral-500 border-transparent hover:text-neutral-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-8">
                {activeTab === 'dados' && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl space-y-6">
                            <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Informações Gerais</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-neutral-600 uppercase">Documento Base</label>
                                    <p className="text-sm font-mono text-neutral-300">{client.cnpj_cpf}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-neutral-600 uppercase">Regime Tributário</label>
                                    <p className="text-sm font-bold text-amber-500">{client.regime_tributario || 'NÃO DEFINIDO'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-neutral-600 uppercase">Data Nascimento / Abertura</label>
                                    <p className="text-sm text-neutral-300">{client.data_nascimento ? new Date(client.data_nascimento).toLocaleDateString('pt-BR') : '---'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-neutral-600 uppercase">Último Registro Junta</label>
                                    <p className="text-sm text-neutral-300">{client.data_ultimo_registro_junta ? new Date(client.data_ultimo_registro_junta).toLocaleDateString('pt-BR') : 'Sem Alerta'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl space-y-6">
                            <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Contatos e Localização</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-neutral-400">
                                    <Mail className="w-5 h-5 text-amber-500" />
                                    <span>{client.email || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-neutral-400">
                                    <Phone className="w-5 h-5 text-amber-500" />
                                    <span>{client.telefone_whatsapp || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-neutral-400">
                                    <MapPin className="w-5 h-5 text-amber-500" />
                                    <span>{client.logradouro}, {client.cidade} - {client.estado}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'unidades' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Unidades, Fazendas e Filiais</h3>
                            <button className="px-4 py-2 bg-neutral-800 text-[10px] font-black uppercase rounded-lg border border-neutral-700 hover:border-amber-500 transition-all">+ Nova Unidade</button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {unidades.length === 0 ? (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                                    <p className="text-neutral-600 font-mono text-xs uppercase text-center">Nenhuma fazenda ou filial cadastrada.</p>
                                </div>
                            ) : (
                                unidades.map(u => (
                                    <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-amber-500 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 px-2 py-1 rounded">{u.tipo_unidade}</span>
                                            <button className="text-neutral-700 group-hover:text-amber-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                        </div>
                                        <h4 className="text-lg font-black text-neutral-100 uppercase italic mb-2 tracking-tighter">{u.nome_identificador}</h4>
                                        <div className="space-y-2 font-mono text-[10px] text-neutral-500 uppercase">
                                            <p><span className="text-neutral-700">CAEPF/ID:</span> {u.documento_id || '---'}</p>
                                            <p><span className="text-neutral-700">I.E:</span> {u.inscricao_estadual || '---'}</p>
                                            <p><span className="text-neutral-700">NIRF:</span> {u.numero_nirf_sib || '---'}</p>
                                            <p><span className="text-neutral-700">INCRA:</span> {u.numero_incra || '---'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'vencimentos' && (
                    <div className="space-y-6">
                        <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Controle de Validades e Alarmes</h3>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden text-[10px]">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-950 border-b border-neutral-800">
                                    <tr className="font-black text-neutral-500 uppercase tracking-widest">
                                        <th className="p-4">Documento / Certificado</th>
                                        <th className="p-4">Unidade Vinculada</th>
                                        <th className="p-4">Vencimento</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {validades.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-neutral-600 uppercase font-mono">Sem alarmes ativos</td></tr>
                                    ) : (
                                        validades.map(v => {
                                            const days = Math.ceil((new Date(v.data_vencimento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                            const isExpiring = days <= 30;
                                            return (
                                                <tr key={v.id} className="hover:bg-neutral-800/20 text-neutral-300">
                                                    <td className="p-4 font-bold">{v.tipo_documento?.replace(/_/g, ' ')}</td>
                                                    <td className="p-4 uppercase text-neutral-500">{v.unidade?.nome_identificador || 'Geral (Titular)'}</td>
                                                    <td className="p-4 font-mono">{new Date(v.data_vencimento).toLocaleDateString('pt-BR')}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded font-black ${isExpiring ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                                            {isExpiring ? `VENCE EM ${days} DIAS` : 'REGULAR'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button className="text-amber-500 hover:underline">ABRIR</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
