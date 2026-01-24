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

export default function ClientesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [formData, setFormData] = useState({
        nome: '',
        cnpj_cpf: '',
        telefone_whatsapp: '',
        email: '',
        cidade: 'Sidrolândia'
    });

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
                nome: client.nome,
                cnpj_cpf: client.cnpj_cpf?.toString() || '',
                telefone_whatsapp: client.telefone_whatsapp || '',
                email: client.email || '',
                cidade: client.cidade || 'Sidrolândia'
            });
        } else {
            setEditingClient(null);
            setFormData({ nome: '', cnpj_cpf: '', telefone_whatsapp: '', email: '', cidade: 'Sidrolândia' });
        }
        setIsModalOpen(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            // Remover o campo 'cidade' que não existe na tabela
            const { cidade, ...dataToSave } = formData;

            if (editingClient) {
                const { error } = await supabase
                    .from('clientes')
                    .update(dataToSave)
                    .eq('id', editingClient.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('clientes')
                    .insert([dataToSave]);
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
                                                    <Link href={`/admin/clientes/${c.id}`} className="hover:text-primary-400 hover:underline transition-colors decoration-2 underline-offset-4">
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
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase">Nome / Razão Social</label>
                                <input required className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 focus:border-primary-500 outline-none"
                                    value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase">CNPJ / CPF</label>
                                    <input required className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 focus:border-primary-500 outline-none"
                                        value={formData.cnpj_cpf} onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase">WhatsApp</label>
                                    <input className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 focus:border-primary-500 outline-none"
                                        value={formData.telefone_whatsapp} onChange={e => setFormData({ ...formData, telefone_whatsapp: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase">E-mail</label>
                                <input type="email" className="w-full bg-neutral-800 border-neutral-700 rounded-lg mt-1 p-2 focus:border-primary-500 outline-none"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 mt-4 text-neutral-950 font-bold uppercase tracking-wider">
                                {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
