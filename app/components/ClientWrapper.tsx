"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <>
            {!isAdmin && <Header />}
            <main className={!isAdmin ? "pt-16" : ""}>
                <div key={pathname} className="page-transition">
                    {children}
                </div>
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
