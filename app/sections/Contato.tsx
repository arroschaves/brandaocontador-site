// app/sections/Contato.tsx
import { useState } from "react";

export default function Contato() {
  const [formData, setFormData] = useState({ nome: "", email: "", mensagem: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      // Aqui você pode integrar com API/Next.js API route para envio de e-mail
      // Exemplo fictício:
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("Mensagem enviada com sucesso!");
      setFormData({ nome: "", email: "", mensagem: "" });
    } catch (error) {
      setStatus("Erro ao enviar a mensagem. Tente novamente.");
    }
  };

  return (
    <section id="contato" className="py-16 px-5 text-center bg-gray-800">
      <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-6">Contato</h2>
      <p className="max-w-3xl mx-auto text-gray-200 text-lg md:text-xl mb-8">
        Entre em contato conosco. Responderemos o mais rápido possível!
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col gap-4 text-left">
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <textarea
          name="mensagem"
          placeholder="Mensagem"
          value={formData.mensagem}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded hover:bg-yellow-400 transition"
        >
          Enviar
        </button>
      </form>

      {status && <p className="mt-4 text-gray-200">{status}</p>}
    </section>
  );
}
