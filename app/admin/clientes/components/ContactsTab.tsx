'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Phone, Mail, User, Shield, Briefcase, X, Save, AlertCircle } from 'lucide-react'

interface Contact {
    id?: string
    empresa_id: string
    nome: string
    cpf: string
    email: string
    telefone: string
    cargo: string
    principal: boolean
    ativo: boolean
}

export default function ContactsTab({ clientId }: { clientId: string }) {
    const supabase = createClient()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Contact>>({
        nome: '', cpf: '', email: '', telefone: '', cargo: '', principal: false
    })

    const fetchContacts = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .schema('core')
            .from('empresa_contatos')
            .select('*')
            .eq('empresa_id', clientId)
            .eq('ativo', true)
            .order('principal', { ascending: false })
            .order('nome', { ascending: true })

        if (error) {
            console.error('Erro ao buscar contatos:', error)
        } else {
            setContacts(data || [])
        }
        setLoading(false)
    }, [clientId, supabase])

    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.nome || (!formData.email && !formData.telefone)) {
            setError('Nome e ao menos um contato (email ou telefone) são obrigatórios.')
            return
        }

        try {
            const payload = {
                ...formData,
                empresa_id: clientId,
                ativo: true
            }

            if (editingId) {
                const { error: updErr } = await supabase
                    .schema('core')
                    .from('empresa_contatos')
                    .update(payload)
                    .eq('id', editingId)

                if (updErr) throw updErr
            } else {
                const { error: insErr } = await supabase
                    .schema('core')
                    .from('empresa_contatos')
                    .insert([payload])

                if (insErr) throw insErr
            }

            setShowForm(false)
            setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', principal: false })
            setEditingId(null)
            fetchContacts()
        } catch (err: any) {
            setError(err.message || 'Falha ao salvar contato')
        }
    }

    const handleEdit = (c: Contact) => {
        setFormData({
            nome: c.nome,
            cpf: c.cpf,
            email: c.email,
            telefone: c.telefone,
            cargo: c.cargo,
            principal: c.principal
        })
        setEditingId(c.id!)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Desativar este contato?')) return

        try {
            await supabase
                .schema('core')
                .from('empresa_contatos')
                .update({ ativo: false })
                .eq('id', id)

            fetchContacts()
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-emerald-500" />
                        Quadro Societário & Contatos
                    </h3>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">Gerencie os interlocutores homologados desta empresa</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingId(null)
                            setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', principal: false })
                            setShowForm(true)
                        }}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase rounded hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Novo Contato
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex justify-between mb-4">
                            <h4 className="text-[12px] font-bold text-white uppercase">{editingId ? 'Editar Contato' : 'Novo Contato'}</h4>
                            <button type="button" onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] flex items-center gap-2 rounded">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500">Nome Completo *</label>
                                <input
                                    type="text"
                                    value={formData.nome || ''}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-xs text-white uppercase focus:border-emerald-500 transition-colors outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500">CPF</label>
                                <input
                                    type="text"
                                    value={formData.cpf || ''}
                                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-xs text-white uppercase focus:border-emerald-500 transition-colors outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1"><Mail className="w-3 h-3" /> E-mail</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-xs text-white focus:border-emerald-500 transition-colors outline-none lowercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp / Tel</label>
                                <input
                                    type="text"
                                    value={formData.telefone || ''}
                                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-xs text-white uppercase focus:border-emerald-500 transition-colors outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Cargo / Função</label>
                                <input
                                    type="text"
                                    value={formData.cargo || ''}
                                    onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-xs text-white uppercase focus:border-emerald-500 transition-colors outline-none"
                                    placeholder="Ex: Sócio Administrador, Analista Fiscal"
                                />
                            </div>
                            <div className="space-y-2 flex items-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border ${formData.principal ? 'bg-emerald-500 border-emerald-500' : 'bg-black border-neutral-700'} flex items-center justify-center transition-colors`}>
                                        {formData.principal && <Shield className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-neutral-400 group-hover:text-emerald-500 transition-colors">Contato Principal (Responsável)</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.principal || false}
                                        onChange={e => setFormData({ ...formData, principal: e.target.checked })}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-transparent text-[10px] font-bold text-neutral-500 uppercase hover:text-white transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
                                <Save className="w-4 h-4" /> Salvar Ficha
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && contacts.length === 0 && (
                <div className="p-12 border-2 border-dashed border-neutral-900 rounded-xl flex flex-col items-center text-center">
                    <User className="w-10 h-10 text-neutral-800 mb-4" />
                    <p className="text-[10px] font-black uppercase text-neutral-600 mb-2">Nenhum contato cadastrado</p>
                    <p className="text-[9px] uppercase text-neutral-700 max-w-sm">Adicione sócios, diretores ou contatos do departamento financeiro e RH para homologar a comunicação deste cliente no CRM.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map(c => (
                    <div key={c.id} className={`p-5 rounded-xl border ${c.principal ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-black border-neutral-800'} relative group hover:border-neutral-600 transition-colors`}>
                        {c.principal && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5" /> Responsável
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm uppercase ${c.principal ? 'bg-emerald-500/20 text-emerald-500' : 'bg-neutral-900 text-neutral-500'}`}>
                                {c.nome.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-white uppercase truncate pr-4">{c.nome}</h4>
                                <p className="text-[9px] font-bold text-neutral-500 uppercase mt-0.5">{c.cargo || 'Membro'}</p>

                                <div className="mt-3 space-y-1.5">
                                    {c.telefone && (
                                        <p className="text-[10px] text-neutral-400 flex items-center gap-2"><Phone className="w-3 h-3 text-neutral-600" /> {c.telefone}</p>
                                    )}
                                    {c.email && (
                                        <p className="text-[10px] text-neutral-400 flex items-center gap-2 truncate"><Mail className="w-3 h-3 text-neutral-600 shrink-0" /> {c.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                            <button onClick={() => handleEdit(c)} className="p-1.5 bg-neutral-900 text-neutral-400 hover:text-white rounded border border-neutral-800 hover:border-neutral-600 transition-all">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!c.principal && (
                                <button onClick={() => handleDelete(c.id!)} className="p-1.5 bg-neutral-900 text-neutral-400 hover:text-red-500 rounded border border-neutral-800 hover:border-red-900 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
