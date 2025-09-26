// app/sections/AreaCliente.tsx
export default function AreaCliente() {
  return (
    <section className="p-10 text-center bg-green-900">
      <h3 className="text-3xl font-bold text-yellow-400">Área do Cliente</h3>
      <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
        Acesse sua área exclusiva para visualizar documentos, relatórios e acompanhar
        serviços contratados. Plataforma digital em constante evolução para oferecer
        praticidade e segurança aos nossos clientes.
      </p>
      <a
        href="/cliente/login"
        className="mt-6 inline-block bg-yellow-400 text-black font-bold px-6 py-3 rounded hover:bg-yellow-300 transition"
      >
        Entrar na Área do Cliente
      </a>
    </section>
  );
}
