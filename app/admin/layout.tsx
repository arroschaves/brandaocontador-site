"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ClipboardList,
  Menu,
  X,
  Bell,
  Search,
  User as UserIcon,
  ShieldCheck,
  Cpu,
  Zap
} from 'lucide-react';
import WhatsAppRadar from '../components/WhatsAppRadar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }


  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin' },
    { name: 'Master Control', icon: ShieldCheck, path: '/admin/master' },
    { name: 'Equipe', icon: Users, path: '/admin/equipe' },
    { name: 'Clientes', icon: Users, path: '/admin/clientes' },
    { name: 'Cronograma', icon: ClipboardList, path: '/admin/cronograma' },
    { name: 'Calendário', icon: Calendar, path: '/admin/calendario' },
    { name: 'Atendimento', icon: MessageSquare, path: '/admin/atendimento' },
    { name: 'Vencimentos', icon: Bell, path: '/admin/vencimentos' },
    { name: 'Automação', icon: Zap, path: '/admin/automacao' },
    { name: 'Configurações', icon: Settings, path: '/admin/configuracoes' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'
          } bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/admin" className="flex items-center space-x-2">
              {/* Replaced Brandão CRM text with image */}
              <div className="flex items-center gap-3 px-2">
                <div className="relative w-full h-12">
                  <img
                    src="/logo-full.jpg"
                    alt="Brandão Contabilidade"
                    className="h-full w-auto object-contain"
                  />
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5 text-neutral-900" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                {isSidebarOpen && <span className="ml-4 font-medium">{item.name}</span>}
                {isActive && isSidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-neutral-400 hover:text-error-400 hover:bg-error-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-4 font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 bg-neutral-950/50 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Pesquisar cliente, CNPJ ou prazo..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <WhatsAppRadar />
            <div className="flex items-center space-x-4">
              <button className="p-2 relative text-neutral-400 hover:text-neutral-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full border-2 border-neutral-950" />
              </button>
              <div className="h-8 w-px bg-neutral-800 mx-2" />
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-neutral-100">Alessandro</p>
                  <p className="text-xs text-neutral-500">Administrador</p>
                </div>
                <div className="w-9 h-9 bg-neutral-800 rounded-full border border-neutral-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-8 mt-4">
          {children}
        </div>
      </main>
    </div >
  );
}
