"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <>
            {!isAdmin && <Header />}
            <main className={!isAdmin ? "pt-16" : ""}>
                {children}
            </main>
        </>
    );
}
