"use client";

import React, { useState } from 'react';
import { Search, Plus, Filter, Phone, Mail } from 'lucide-react';

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Aqui no futuro puxaremos do seu banco de dados
  const clientes = [
    { nome: 'AASS', cnpj: '3997574000174', telefone: '(67) 9249-3403', email: 'sidrolandia@aabb.com.br' },
    { nome: 'BARBEQ', cnpj: '48016429000101', telefone: '(67) 9864-5031', email: 'eliaquim@gmail.com' },
    // ... os outros que você enviou
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <button className="flex items-center gap-2 bg-primary-500 text-neutral-900 px-4 py-2 rounded-lg font-bold">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..." 
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-neutral-500 text-xs uppercase border-b border-neutral-800">
              <th className="pb-4">Nome / Empresa</th>
              <th className="pb-4">CNPJ/CPF</th>
              <th className="pb-4">Contato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {clientes.map((c, i) => (
              <tr key={i} className="hover:bg-neutral-800/30">
                <td className="py-4 font-medium">{c.nome}</td>
                <td className="py-4 text-neutral-400 font-mono text-sm">{c.cnpj}</td>
                <td className="py-4">
                  <div className="text-xs text-neutral-400"><Phone className="inline w-3 h-3 mr-1" />{c.telefone}</div>
                  <div className="text-xs text-neutral-400"><Mail className="inline w-3 h-3 mr-1" />{c.email}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}