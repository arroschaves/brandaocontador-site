// app/sections/Contato.tsx
"use client";

import { useState } from "react";

export default function Contato() {
  const [formData, setFormData] = useState({ nome: "", email: "", mensagem: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <section className="p-10">
      <h2 className="text-3xl font-bold mb-4">Contato</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-w-md">
        <input
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <textarea
          name="mensagem"
          placeholder="Mensagem"
          value={formData.mensagem}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="bg-yellow-400 text-black p-2 rounded">
          Enviar
        </button>
      </form>
    </section>
  );
}
