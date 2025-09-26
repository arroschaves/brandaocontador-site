// app/page.tsx
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100">
      {/* Seção principal */}
      <section className="flex flex-col items-center justify-center py-20 px-5 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Logo Brandão Contabilidade"
            width={180}
            height={180}
            className="mx-auto"
          />
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-500 mb-6">
          Brandão Contabilidade
        </h1>

        {/* Descrição */}
        <p className="max-w-3xl text-lg md:text-xl text-gray-200">
          Soluções completas em Escrituração Fiscal, Abertura de Empresas, Área Trabalhista, Imposto de Renda e Gestão Empresarial.
        </p>
      </section>

      {/* Seção de serviços (opcional) */}
      <section className="py-16 px-5 text-center">
        <h2 className="text-3xl font-bold text-yellow-500 mb-8">Nossos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Escrituração Fiscal</h3>
            <p>Controle completo da contabilidade e obrigações fiscais da sua empresa.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Área Trabalhista</h3>
            <p>Folha de pagamento, contratos e gestão de colaboradores de forma segura.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Imposto de Renda</h3>
            <p>Assessoria completa para pessoas físicas e jurídicas na declaração de IR.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
