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

    // Determine if the current path is the login page/loading page/initial setting page
    const isLoginPage = pathname === '/login';
    const isLoadingPage = pathname === '/'; // Assuming '/' is your loading page route
    const isInitialSettingPage = pathname === '/initialSettings';

    // Show BottomContainer only if not on login page and not on loading page ans not on initial setting page
    const showBottomContainer = !isLoginPage && !isLoadingPage && !isInitialSettingPage;

    return (
        <Providers>
            {children}
            {showBottomContainer && <BottomContainer />}
        </Providers>
    );
}