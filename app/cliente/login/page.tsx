export default function LoginPage() {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl font-bold text-brandGold mb-4">Área do Cliente</h2>
      <form className="max-w-sm mx-auto space-y-4">
        <input type="email" placeholder="Email" className="w-full p-2 border rounded text-black" />
        <input type="password" placeholder="Senha" className="w-full p-2 border rounded text-black" />
        <button className="bg-brandGold text-black px-4 py-2 rounded font-bold hover:opacity-80">Entrar</button>
      </form>
    </section>
  );
}