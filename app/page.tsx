export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black bg-opacity-95 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logocirculo.png"
              alt="Logo Brandão Contabilidade"
              className="h-12 w-12"
            />
            <h1 className="text-xl font-bold text-yellow-500">Brandão Contabilidade</h1>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#inicio" className="hover:text-yellow-500">Início</a>
            <a href="#servicos" className="hover:text-yellow-500">Serviços</a>
            <a href="#sobre" className="hover:text-yellow-500">Sobre</a>
            <a href="#contato" className="hover:text-yellow-500">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="inicio"
        className="flex flex-col items-center justify-center text-center flex-1 px-6 pt-28 pb-16 bg-black"
      >
        <img
          src="/logocirculo.png"
          alt="Logo"
          className="w-40 h-40 mb-6"
        />
        <h2 className="text-3xl md:text-5xl font-bold text-yellow-500 mb-4">
          Contabilidade com Excelência
        </h2>
        <p className="text-gray-300 max-w-xl mb-6">
          Escrituração Fiscal, Abertura de Empresas, Área Trabalhista, Imposto de Renda e Gestão Empresarial.
        </p>
        <div className="flex space-x-4">
          <a
            href="#contato"
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Entre em Contato
          </a>
          <a
            href="#servicos"
            className="border border-yellow-500 text-yellow-500 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 hover:text-black transition"
          >
            Nossos Serviços
          </a>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="bg-black py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-yellow-500 mb-10">Nossos Serviços</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Escrituração Fiscal",
              "Abertura de Empresas",
              "Área Trabalhista",
              "Imposto de Renda",
              "Gestão Empresarial",
            ].map((servico, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 rounded-xl p-6 shadow-md hover:shadow-yellow-500/30 border border-neutral-800"
              >
                <h4 className="text-xl font-semibold text-yellow-400 mb-3">{servico}</h4>
                <p className="text-gray-400 text-sm">
                  Soluções especializadas e personalizadas para o crescimento da sua empresa.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="bg-neutral-950 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-yellow-500 mb-6">Sobre Nós</h3>
          <p className="text-gray-300 leading-relaxed">
            A Brandão Contabilidade atua em Sidrolândia - MS, oferecendo serviços contábeis com qualidade,
            transparência e dedicação. Nosso objetivo é simplificar sua gestão empresarial e garantir
            tranquilidade no cumprimento das obrigações fiscais e trabalhistas.
          </p>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="bg-black py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-yellow-500 mb-6">Contato</h3>
          <p className="text-gray-300 mb-6">Entre em contato conosco pelos canais abaixo:</p>
          <div className="space-y-3 text-lg">
            <p>📞 <span className="text-yellow-400">(67) 3272-3266</span></p>
            <p>📱 <span className="text-yellow-400">(67) 99601-1356</span></p>
            <p>✉️ <span className="text-yellow-400">adm@brandaocontador.com.br</span></p>
            <p>📍 <span className="text-yellow-400">Rua Santa Catarina, 1010 - Centro - Sidrolândia - MS</span></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 py-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <img src="/logocirculo.png" alt="Logo" className="h-8 w-8" />
            <span>© {new Date().getFullYear()} Brandão Contabilidade</span>
          </div>
          <div className="mt-3 md:mt-0">
            Desenvolvido com ❤️ em Next.js + Tailwind
          </div>
        </div>
      </footer>
    </main>
  );
}
