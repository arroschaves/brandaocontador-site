export default function LoginPage() {
  return (
    <div className="p-10 min-h-screen bg-green-900 text-white">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">Área do Cliente</h2>
      <form className="space-y-4 max-w-md mx-auto">
        <input type="email" placeholder="E-mail" className="w-full p-2 rounded text-black" />
        <input type="password" placeholder="Senha" className="w-full p-2 rounded text-black" />
        <button type="submit" className="bg-yellow-400 text-green-900 px-4 py-2 rounded font-bold">Entrar</button>
      </form>
    </div>
  );
}
