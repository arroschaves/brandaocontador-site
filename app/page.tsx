import Image from "next/image";
import Link from "next/link";
import QuemSomos from "./sections/QuemSomos";
import AreaCliente from "./sections/AreaCliente";
import Contato from "./sections/Contato";

export default function HomePage() {
  return (
    <main className="bg-gray-900 text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <Image
          src="/logo-square.jpg"
          alt="Logo Brandão Contabilidade"
          width={180}
          height={180}
          className="mx-auto mb-6"
        />
        <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-500 mb-4">
          Brandão Contabilidade
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-200 mb-6">
          Soluções contábeis modernas e digitais
        </h2>
        <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-8">
          Escrituração fiscal, abertura de empresas, área trabalhista, imposto de renda e gestão empresarial — com tecnologia e segurança.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="https://wa.me/5567996011356" target="_blank" className="px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded hover:bg-yellow-400 transition">
            Fale pelo WhatsApp
          </Link>
          <a href="#servicos" className="px-6 py-3 border border-yellow-500 text-yellow-500 font-bold rounded hover:bg-yellow-500 hover:text-gray-900 transition">
            Conheça os serviços
          </a>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="py-16 px-5 text-center bg-gray-800">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-6">Nossos Serviços</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-700 rounded hover:bg-gray-700 transition">
            <h3 className="text-xl font-semibold mb-2">Escrituração Fiscal</h3>
            <p>Controle completo de documentos fiscais e contábeis para sua empresa.</p>
          </div>
          <div className="p-6 border border-gray-700 rounded hover:bg-gray-700 transition">
            <h3 className="text-xl font-semibold mb-2">Abertura de Empresas</h3>
            <p>Agilidade e segurança na abertura de novos negócios, sem burocracia.</p>
          </div>
          <div className="p-6 border border-gray-700 rounded hover:bg-gray-700 transition">
            <h3 className="text-xl font-semibold mb-2">Área Trabalhista</h3>
            <p>Gestão completa de folha, admissões, rescisões e obrigações trabalhistas.</p>
          </div>
          <div className="p-6 border border-gray-700 rounded hover:bg-gray-700 transition">
            <h3 className="text-xl font-semibold mb-2">Imposto de Renda</h3>
            <p>Declarações e planejamento tributário para pessoas físicas e jurídicas.</p>
          </div>
          <div className="p-6 border border-gray-700 rounded hover:bg-gray-700 transition">
            <h3 className="text-xl font-semibold mb-2">Gestão Empresarial</h3>
            <p>Consultoria e suporte para melhorar resultados e processos da sua empresa.</p>
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <QuemSomos />

      {/* Área do Cliente Section */}
      <AreaCliente />

      {/* Contato Section */}
      <Contato />
    </main>
  );
}
