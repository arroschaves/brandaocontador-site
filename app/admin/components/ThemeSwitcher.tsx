"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Zap } from 'lucide-react';

type Theme = 'light' | 'dark' | 'dark-light';

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<Theme>('dark');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('maestro-theme') as Theme;
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            applyTheme('dark');
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'dark-light');

        if (newTheme === 'dark-light') {
            root.classList.add('dark');
            root.classList.add('dark-light');
        } else {
            root.classList.add(newTheme);
        }

        setTheme(newTheme);
        localStorage.setItem('maestro-theme', newTheme);
    };

    const themes = [
        { id: 'light', label: 'Claro', icon: Sun, color: 'text-amber-500' },
        { id: 'dark', label: 'Dark', icon: Moon, color: 'text-indigo-400' },
        { id: 'dark-light', label: 'Dark Light', icon: Zap, color: 'text-emerald-400' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 bg-secondary/50 border border-border/50 rounded-xl hover:bg-secondary transition-all flex items-center gap-2 group"
                title="Alterar Tema (LUZ)"
            >
                {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
                {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
                {theme === 'dark-light' && <Zap className="w-5 h-5 text-emerald-400" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground hidden md:block">
                    LUZ
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-40 glass rounded-2xl border border-border/50 shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 space-y-1">
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const isActive = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            applyTheme(t.id as Theme);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : t.color}`} />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
