"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Phone,
    Mail,
    Trash2,
    Edit,
    Eye,
    Loader2,
    AlertCircle,
    X,
    CheckCircle2,
    FolderOpen,
    ExternalLink,
    FolderX
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const dynamic = 'force-dynamic'

export default function ClientesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        nome: '',
        cnpj_cpf: '',
        telefone_whatsapp: '',
        email: '',
        razao_social: '',
        regime_tributario: '',
        cnae_principal: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cep: '',
        cidade: 'Sidrolândia',
        estado: 'MS',
        inscricao_estadual: '',
        inscricao_municipal: '',
        status_rfb: 'ATIVA',
        drive_folder_id: ''
    });
    const [consulting, setConsulting] = useState(false);

    // Função para consultar CNPJ via API pública (OpenCNPJ)
    async function handleConsultarCNPJ() {
        const cnpj = formData.cnpj_cpf.replace(/\D/g, '');
        if (cnpj.length !== 14) {
            alert('Digite um CNPJ válido com 14 dígitos para consultar.');
            return;
        }

        setConsulting(true);
        try {
            const response = await fetch(`https://open.cnpja.com/office/${cnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado ou limite de consultas atingido.');

            const data = await response.json();

            // Preenchimento Automático do Formulário
            setFormData((prev: any) => ({
                ...prev,
                nome: data.name || data.alias || prev.nome,
                email: data.emails?.[0]?.address || prev.email,
                razao_social: data.name,
                cnae_principal: data.mainActivity ? `${data.mainActivity.code} - ${data.mainActivity.text}` : null,
                status_rfb: data.status?.text || 'ATIVA',
                logradouro: data.address?.street,
                numero: data.address?.number,
                bairro: data.address?.district,
                cep: data.address?.zip
            }));

            alert('Dados da Receita Federal importados! Confira e salve os dados.');
        } catch (err: any) {
            console.error(err);
            alert('Falha na consulta: ' + err.message);
        } finally {
            setConsulting(false);
        }
    }

    useEffect(() => {
        fetchClientes();
    }, []);

    async function fetchClientes() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            setClientes(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    }

    const filteredClientes = clientes.filter(c =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj_cpf?.toString().includes(searchTerm)
    );

    const handleOpenModal = (client: any = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                nome: client.nome || '',
                cnpj_cpf: client.cnpj_cpf?.toString() || '',
                telefone_whatsapp: client.telefone_whatsapp || '',
                email: client.email || '',
                razao_social: client.razao_social || '',
                regime_tributario: client.regime_tributario || '',
                cnae_principal: client.cnae_principal || '',
                logradouro: client.logradouro || '',
                numero: client.numero || '',
                bairro: client.bairro || '',
                cep: client.cep || '',
                cidade: client.cidade || 'Sidrolândia',
                estado: client.estado || 'MS',
                inscricao_estadual: client.inscricao_estadual || '',
                inscricao_municipal: client.inscricao_municipal || '',
                status_rfb: client.status_rfb || 'ATIVA',
                drive_folder_id: client.drive_folder_id || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                nome: '', cnpj_cpf: '', telefone_whatsapp: '', email: '',
                razao_social: '', regime_tributario: '', cnae_principal: '',
                logradouro: '', numero: '', bairro: '', cep: '',
                cidade: 'Sidrolândia', estado: 'MS',
                inscricao_estadual: '', inscricao_municipal: '',
                status_rfb: 'ATIVA', drive_folder_id: ''
            });
        }
        setIsModalOpen(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editingClient) {
                const { error } = await supabase
                    .from('clientes')
                    .update(formData)
                    .eq('id', editingClient.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('clientes')
                    .insert([formData]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            fetchClientes();
            alert(editingClient ? 'Atualizado!' : 'Cadastrado!');
        } catch (err: any) {
            alert('Erro: ' + err.message);
        }
    }

    async function handleDelete(id: string, nome: string) {
        if (!confirm(`Excluir ${nome}?`)) return;
        try {
            const { error } = await supabase.from('clientes').delete().eq('id', id);
            if (error) throw error;
            setClientes(clientes.filter(c => c.id !== id));
        } catch (err: any) {
            alert('Erro ao excluir');
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 italic">Gestão de Clientes</h1>
                    <p className="text-neutral-400 mt-1">
                        {clientes.length} clientes cadastrados •
                        <span className="text-green-400">{clientes.filter(c => c.drive_folder_id).length} com pasta</span> •
                        <span className="text-amber-400">{clientes.filter(c => !c.drive_folder_id).length} sem pasta</span>
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Novo Cliente
                </button>
            </div>

            <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CNPJ ou CPF..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-neutral-500 text-xs uppercase border-b border-neutral-800">
                                    <th className="px-4 pb-4">Nome / Status</th>
                                    <th className="px-4 pb-4">Documento</th>
                                    <th className="px-4 pb-4">Regime Tributário</th>
                                    <th className="px-4 pb-4">Google Drive</th>
                                    <th className="px-4 pb-4">Situação Fiscal</th>
                                    <th className="px-4 pb-4">Contato</th>
                                    <th className="px-4 pb-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {filteredClientes.map((c) => (
                                    <tr key={c.id} className="hover:bg-neutral-800/20 group">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <div className="font-semibold text-neutral-200 flex items-center gap-2">
                                                    <Link href={`/admin/clientes/detalhes/${String(c.id).trim()}`} className="hover:text-primary-400 hover:underline transition-colors decoration-2 underline-offset-4">
                                                        {c.razao_social || c.nome}
                                                    </Link>
                                                    {c.status_rfb === 'ATIVA' && (
                                                        <div className="text-green-500 p-1 bg-green-500/10 rounded-full" title="Status Receita: ATIVA">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                {c.razao_social && c.razao_social !== c.nome && (
                                                    <div className="text-[10px] text-neutral-400 font-medium">
                                                        Apelido: {c.nome}
                                                    </div>
                                                )}
                                            </div>
                                            {c.cnae_principal && (
                                                <div className="text-[10px] text-neutral-500 truncate max-w-[200px]" title={c.cnae_principal}>
                                                    {c.cnae_principal}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-mono text-sm text-neutral-400">{c.cnpj_cpf}</td>
                                        <td className="px-4 py-4">
                                            {c.regime_tributario ? (
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${c.regime_tributario.toLowerCase().includes('simples')
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : c.regime_tributario.toLowerCase().includes('presumido') || c.regime_tributario.toLowerCase().includes('real')
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    }`}>
                                                    {c.regime_tributario.replace(/_/g, ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-600 italic">Não identificado</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {c.drive_folder_id ? (
                                                <a
                                                    href={`https://drive.google.com/drive/folders/${c.drive_folder_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors group/drive"
                                                    title="Abrir pasta no Google Drive"
                                                >
                                                    <FolderOpen className="w-4 h-4" />
                                                    <span className="text-xs">Pasta criada</span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/drive:opacity-100 transition-opacity" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-500" title="Pasta não criada">
                                                    <FolderX className="w-4 h-4" />
                                                    <span className="text-xs">Sem pasta</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2">
                                                    <span title="Federal" className={`w-3 h-3 rounded-full ${c.situacao_federal === 'REGULAR' ? 'bg-green-500' : c.situacao_federal === 'PENDENTE' ? 'bg-red-500' : 'bg-neutral-600'}`}></span>
                                                    <span title="Estadual" className={`w-3 h-3 rounded-full ${c.situacao_estadual === 'REGULAR' ? 'bg-green-500' : c.situacao_estadual === 'PENDENTE' ? 'bg-red-500' : 'bg-neutral-600'}`}></span>
                                                    <span title="Municipal" className={`w-3 h-3 rounded-full ${c.situacao_municipal === 'REGULAR' ? 'bg-green-500' : c.situacao_municipal === 'PENDENTE' ? 'bg-red-500' : 'bg-neutral-600'}`}></span>
                                                </div>
                                                {c.data_ultima_consulta_fiscal && (
                                                    <span className="text-[9px] text-neutral-500">
                                                        {new Date(c.data_ultima_consulta_fiscal).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-neutral-400">
                                            <div>{c.telefone_whatsapp}</div>
                                            <div className="opacity-60">{c.email}</div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(c)} className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(c.id, c.nome)} className="p-2 hover:bg-error-500/10 text-error-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Novo/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* DADOS BÁSICOS */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-widest border-b border-primary-500/20 pb-2">Identificação</h3>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">CNPJ / CPF</label>
                                        <input required className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none font-mono"
                                            placeholder="00.000.000/0000-00"
                                            value={formData.cnpj_cpf} onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })} />
                                    </div>
                                    {formData.cnpj_cpf.replace(/\D/g, '').length === 14 && (
                                        <button
                                            type="button"
                                            onClick={handleConsultarCNPJ}
                                            disabled={consulting}
                                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-bold text-primary-400 flex items-center gap-2 transition-all disabled:opacity-50 h-[38px]"
                                        >
                                            {consulting ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>🔍 Consultar</span>}
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">Nome Comercial / Apelido</label>
                                    <input required className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none uppercase font-bold italic"
                                        value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">Razão Social</label>
                                    <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none uppercase"
                                        value={formData.razao_social || ''} onChange={e => setFormData({ ...formData, razao_social: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Regime Tributário</label>
                                        <select className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.regime_tributario || ''} onChange={e => setFormData({ ...formData, regime_tributario: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            <option value="SIMPLES_NACIONAL">SIMPLES NACIONAL</option>
                                            <option value="LUCRO_PRESUMIDO">LUCRO PRESUMIDO</option>
                                            <option value="LUCRO_REAL">LUCRO REAL</option>
                                            <option value="MEI">MEI</option>
                                            <option value="PF_FAZENDA">PF (FAZENDA)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Status RFB</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none italic font-bold text-green-500"
                                            value={formData.status_rfb || 'ATIVA'} onChange={e => setFormData({ ...formData, status_rfb: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* CONTATO */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-widest border-b border-primary-500/20 pb-2">Contato</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">WhatsApp</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.telefone_whatsapp || ''} onChange={e => setFormData({ ...formData, telefone_whatsapp: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">E-mail</label>
                                        <input type="email" className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* ENDEREÇO */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-widest border-b border-primary-500/20 pb-2">Localização</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Logradouro</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.logradouro || ''} onChange={e => setFormData({ ...formData, logradouro: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Número</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.numero || ''} onChange={e => setFormData({ ...formData, numero: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Bairro</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.bairro || ''} onChange={e => setFormData({ ...formData, bairro: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">CEP</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.cep || ''} onChange={e => setFormData({ ...formData, cep: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Cidade</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none"
                                            value={formData.cidade || 'Sidrolândia'} onChange={e => setFormData({ ...formData, cidade: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase">Estado</label>
                                        <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-sm focus:border-primary-500 outline-none uppercase"
                                            maxLength={2}
                                            value={formData.estado || 'MS'} onChange={e => setFormData({ ...formData, estado: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* DRIVE CONFIG */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-widest border-b border-primary-500/20 pb-2">Sistema / Nuvem</h3>
                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">Google Drive Folder ID</label>
                                    <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 text-[10px] font-mono focus:border-primary-500 outline-none text-neutral-400"
                                        placeholder="ID da pasta raiz no Drive"
                                        value={formData.drive_folder_id || ''} onChange={e => setFormData({ ...formData, drive_folder_id: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-neutral-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.98]">
                                {editingClient ? 'Salvar Registro' : 'Efetuar Cadastro'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
