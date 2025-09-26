import QuemSomos from "./sections/QuemSomos";
import AreaCliente from "./sections/AreaCliente";
import Contato from "./sections/Contato";
import Image from "next/image";
import Link from "next/link";

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

      {/* Seções do site */}
      <section id="servicos">
        {/* Conteúdo dos serviços existente */}
      </section>

      <QuemSomos />
      <AreaCliente />
      <Contato />
    </main>
  );
}
