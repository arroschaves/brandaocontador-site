'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown, MoreVertical } from 'lucide-react'

interface WidgetCardProps {
    title: string
    icon: ReactNode
    statusColor?: 'green' | 'yellow' | 'red' | 'neutral'
    badge?: string | number
    actions?: ReactNode
    children: ReactNode
    defaultCollapsed?: boolean
    className?: string
}

export default function WidgetCard({
    title,
    icon,
    statusColor = 'neutral',
    badge,
    actions,
    children,
    defaultCollapsed = false,
    className = ''
}: WidgetCardProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed)
    const [showMenu, setShowMenu] = useState(false)

    // Cores por status
    const colorClasses = {
        green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        yellow: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        neutral: 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }

    const badgeColors = {
        green: 'bg-emerald-500 text-black',
        yellow: 'bg-amber-500 text-black',
        red: 'bg-red-500 text-white',
        neutral: 'bg-neutral-700 text-neutral-300'
    }

    return (
        <div className={`bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden transition-all hover:border-neutral-700 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3 flex-1">
                    {/* Ícone com status color */}
                    <div className={`p-2.5 rounded-lg ${colorClasses[statusColor]}`}>
                        {icon}
                    </div>

                    {/* Título e Badge */}
                    <div className="flex items-center gap-2 flex-1">
                        <h3 className="text-white font-black text-[10px] uppercase tracking-wider">
                            {title}
                        </h3>
                        {badge !== undefined && (
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${badgeColors[statusColor]}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions (botões personalizados) */}
                <div className="flex items-center gap-2">
                    {actions}

                    {/* Botão Collapse/Expand */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
                        aria-label={collapsed ? 'Expandir' : 'Colapsar'}
                    >
                        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={`transition-all duration-200 overflow-hidden ${collapsed ? 'max-h-0' : 'max-h-[1000px]'}`}>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
