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
    X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
                    <p className="text-neutral-400 mt-1">{clientes.length} clientes cadastrados no banco real.</p>
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
                                    <th className="px-4 pb-4">Nome</th>
                                    <th className="px-4 pb-4">Documento</th>
                                    <th className="px-4 pb-4">Contato</th>
                                    <th className="px-4 pb-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {filteredClientes.map((c) => (
                                    <tr key={c.id} className="hover:bg-neutral-800/20 group">
                                        <td className="px-4 py-4 font-semibold text-neutral-200">{c.nome}</td>
                                        <td className="px-4 py-4 font-mono text-sm text-neutral-400">{c.cnpj_cpf}</td>
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
