"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Zap,
  Briefcase
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
    { name: 'Maestro AI', icon: Cpu, path: '/admin/maestro' },
    { name: 'Master Control', icon: ShieldCheck, path: '/admin/master' },
    { name: 'Equipe', icon: Users, path: '/admin/equipe' },
    { name: 'Clientes', icon: Users, path: '/admin/clientes' },
    { name: 'Departamento Pessoal', icon: Briefcase, path: '/admin/departamento-pessoal' },
    { name: 'Cronograma', icon: ClipboardList, path: '/admin/cronograma' },
    { name: 'Calendário', icon: Calendar, path: '/admin/calendario' },
    { name: 'Atendimento', icon: MessageSquare, path: '/admin/atendimento' },
    { name: 'Financeiro', icon: BarChart3, path: '/admin/financeiro' },
    { name: 'Vencimentos', icon: Bell, path: '/admin/vencimentos' },
    { name: 'Automação', icon: Zap, path: '/admin/automacao' },
    { name: 'Configurações', icon: Settings, path: '/admin/configuracoes' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex page-fade-in">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'
          } bg-card border-r border-border/50 transition-all duration-500 flex flex-col fixed h-full z-50 shadow-sm`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="flex items-center gap-3 px-2">
                <div className="relative w-full h-12">
                  <Image
                    src="/logo-full.jpg"
                    alt="Brandão Contabilidade"
                    width={180}
                    height={48}
                    className="h-full w-auto object-contain brightness-0 dark:brightness-100 invert-0 dark:invert-0"
                    priority
                  />
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                {isSidebarOpen && <span className="ml-4 font-semibold text-[13px] tracking-tight">{item.name}</span>}
                {isActive && isSidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-4 font-semibold text-[13px]">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 glass sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar no Maestro..."
                className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/30 focus:bg-white transition-all shadow-none focus:shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <WhatsAppRadar />
            <div className="flex items-center space-x-4">
              <button className="p-2.5 relative text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
              </button>
              <div className="h-6 w-px bg-border/50 mx-2" />
              <div className="flex items-center space-x-3 group cursor-pointer p-1.5 hover:bg-secondary rounded-xl transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-foreground leading-none">Alessandro</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Administrador Master</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm shadow-primary/5">
                  <UserIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="w-full px-6 py-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
