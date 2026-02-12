'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Bot, User, Clock, Radio } from 'lucide-react'
import Link from 'next/link'

export default function WhatsAppRadar() {
    const [pendingCount, setPendingCount] = useState(0)
    const [latestMessage, setLatestMessage] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(true)

    useEffect(() => {
        fetchStatus()

        const channel = supabase
            .channel('radar_atendimento')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'atendimentos'
            }, () => {
                fetchStatus()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchStatus() {
        try {
            // Conta pendentes
            const { count, error: countErr } = await supabase
                .from('atendimentos')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pendente')

            if (countErr) {
                if (countErr.code === '42P01') {
                    console.warn('[Radar] Tabela atendimentos não localizada. Aguardando migration.');
                    setPendingCount(0);
                    return;
                }
                throw countErr;
            }

            setPendingCount(count || 0)

            // Busca a última mensagem pendente
            const { data, error: msgErr } = await supabase
                .from('atendimentos')
                .select(`
                    id,
                    mensagem,
                    pushName,
                    created_at,
                    clientes ( nome )
                `)
                .eq('status', 'pendente')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (msgErr && msgErr.code !== 'PGRST116') { // Ignora se não houver registros
                console.error('[Radar] Erro ao buscar mensagem:', msgErr.message);
            }

            if (data) setLatestMessage(data)
        } catch (err) {
            console.error('Erro no Radar:', err)
        }
    }

    if (pendingCount === 0) return (
        <div className="flex items-center gap-3 px-4 py-1.5 bg-neutral-900/50 border border-neutral-800 rounded-full">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Radar Limpo</span>
        </div>
    )

    return (
        <Link
            href="/admin/atendimento"
            className="flex items-center gap-4 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full hover:bg-amber-500/20 transition-all group"
        >
            <div className="relative">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-tighter">
                        {pendingCount} PENDENTE{pendingCount > 1 ? 'S' : ''}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-[9px] font-mono text-neutral-300 truncate max-w-[120px]">
                        {latestMessage?.clientes?.nome || latestMessage?.pushName || 'Desconhecido'}
                    </span>
                </div>
            </div>

            <Radio className="w-3 h-3 text-amber-500 animate-pulse ml-2" />
        </Link>
    )
}
