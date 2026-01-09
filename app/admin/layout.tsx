"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Bell,
  Search,
  User as UserIcon
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin' },
    { name: 'Clientes', icon: Users, path: '/admin/clientes' },
    { name: 'Cronograma', icon: Calendar, path: '/admin/calendario' },
    { name: 'Atendimento', icon: MessageSquare, path: '/admin/pedidos' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex flex-col fixed h-full z-50`}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-neutral-900" />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg text-primary-400">Brandão CRM</span>}
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                <Icon className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-4 font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-neutral-950/50 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Pesquisar..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary-500 outline-none" />
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-neutral-400" />
            <div className="flex items-center space-x-3">
              <div className="text-right"><p className="text-sm font-medium">Alessandro</p><p className="text-xs text-neutral-500">Admin</p></div>
              <div className="w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-neutral-400" /></div>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}