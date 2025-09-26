// app/page.tsx
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

      {/* Nossos Serviços */}
      <section id="servicos" className="py-16 px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-10">Nossos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Escrituração Fiscal</h3>
            <p>Controle completo da contabilidade e obrigações fiscais da sua empresa.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Abertura de Empresas</h3>
            <p>Assessoria completa para iniciar seu negócio de forma legal e segura.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Área Trabalhista</h3>
            <p>Folha de pagamento, contratos e gestão de colaboradores de forma segura.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Imposto de Renda</h3>
            <p>Assessoria completa para pessoas físicas e jurídicas na declaração de IR.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Gestão Empresarial</h3>
            <p>Consultoria estratégica para otimizar processos e resultados da sua empresa.</p>
          </div>
        </div>
      </section>

      {/* Por que a Brandão Contabilidade */}
      <section className="py-16 px-5 text-center bg-gray-800">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-10">Por que a Brandão Contabilidade?</h2>
        <ul className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 space-y-4">
          <li>✅ Equipe especializada em contabilidade e fiscal.</li>
          <li>✅ Plataforma digital em desenvolvimento (em breve emissão de NF-e).</li>
          <li>✅ Atendimento rápido via WhatsApp e e-mail.</li>
          <li>✅ Segurança no armazenamento de documentos e certificados.</li>
        </ul>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 py-12 px-5 text-center text-gray-300">
        <h3 className="text-xl font-bold mb-4">Fale Conosco</h3>
        <p>Telefone: 67 3272-3266 | WhatsApp: <a href="https://wa.me/5567996011356" className="text-yellow-500 hover:underline">67 99601-1356</a> | E-mail: <a href="mailto:adm@brandaocontador.com.br" className="text-yellow-500 hover:underline">adm@brandaocontador.com.br</a></p>
        <p className="mt-4">Rua Santa Catarina, 1010 – Centro • Sidrolândia • MS</p>
        <p className="mt-4 text-sm">Atendimento por horário agendado. <a href="https://goo.gl/maps/..." className="text-yellow-500 hover:underline">Clique no endereço para abrir no Google Maps</a>.</p>
        <p className="mt-6 text-sm">© 2025 Brandão Contabilidade • Todos os direitos reservados</p>
        <p className="mt-2 text-sm">Política de Privacidade • Termos de Uso (em breve)</p>
      </footer>
    </main>
  );
}
