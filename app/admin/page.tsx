"use client";

import React from 'react';
import { Users, AlertCircle, CheckCircle2, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total de Clientes', value: '248', icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Prazos para Hoje', value: '12', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { name: 'Concluídos (Mês)', value: '85', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { name: 'Pedidos WhatsApp', value: '7', icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">Visão Geral</h1>
        <p className="text-neutral-400 mt-1">Bem-vindo ao painel da Brandão Contabilidade.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-neutral-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}