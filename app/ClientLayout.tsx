'use client'
import { Providers } from "./providers";
import BottomContainer from '@/components/BottomContainer';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Determine if the current path is the login page or loading page
    const isLoginPage = pathname === '/login';
    const isLoadingPage = pathname === '/'; // Assuming '/' is your loading page route

    // Show BottomContainer only if not on login page and not on loading page
    const showBottomContainer = !isLoginPage && !isLoadingPage;

    return (
        <Providers>
            {children}
            {showBottomContainer && <BottomContainer />}
        </Providers>
    );
}