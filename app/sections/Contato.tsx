'use client';
import { useState } from 'react';

export default function Contato() {
  const [formData, setFormData] = useState({ nome: '', email: '', mensagem: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mensagem enviada por ${formData.nome}`);
  };

  return (
    <section className="p-10 bg-green-600 text-white text-center">
      <h3 className="text-3xl font-bold text-yellow-400 mb-4">Contato</h3>
      <form className="max-w-md mx-auto space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="w-full p-2 rounded text-black"
        />
        <input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 rounded text-black"
        />
        <textarea
          placeholder="Mensagem"
          value={formData.mensagem}
          onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
          className="w-full p-2 rounded text-black"
        />
        <button type="submit" className="bg-yellow-400 text-green-900 px-4 py-2 rounded font-bold">
          Enviar
        </button>
      </form>
    </section>
  );
}
