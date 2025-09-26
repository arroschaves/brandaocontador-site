'use client'; // necessário para usar useState

import { useState } from 'react';

export default function Contato() {
  const [formData, setFormData] = useState({ nome: '', email: '', mensagem: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mensagem enviada! Nome: ${formData.nome}, Email: ${formData.email}`);
  };

  return (
    <section className="p-10 text-center bg-green-800">
      <h3 className="text-2xl font-bold text-yellow-400">Contato</h3>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center space-y-3 max-w-md mx-auto">
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full p-2 rounded text-black"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded text-black"
        />
        <textarea
          name="mensagem"
          placeholder="Mensagem"
          value={formData.mensagem}
          onChange={handleChange}
          className="w-full p-2 rounded text-black"
        />
        <button type="submit" className="bg-yellow-400 text-black font-bold px-4 py-2 rounded">
          Enviar
        </button>
      </form>
    </section>
  );
}
