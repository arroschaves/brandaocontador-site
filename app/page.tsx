// app/page.tsx
import QuemSomos from './sections/quemSomos';
import AreaCliente from './sections/AreaCliente';
import Contato from './sections/Contato';

export default function HomePage() {
  return (
    <main className="bg-green-900 text-white min-h-screen">
      {/* Seção principal */}
      <section className="p-10 text-center">
        <h2 className="text-4xl font-bold text-yellow-400">Brandão Contabilidade</h2>
        <p className="mt-4 text-lg text-gray-200">
          Soluções em Escrituração Fiscal, Abertura de Empresas, Área Trabalhista,
          Imposto de Renda e Gestão Empresarial.
        </p>
      </section>

      {/* Quem Somos */}
      <QuemSomos />

      {/* Área do Cliente */}
      <AreaCliente />

      {/* Contato */}
      <Contato />
    </main>
  );
}
