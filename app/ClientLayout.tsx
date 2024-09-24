'use client'

import { Providers } from "./providers";
import BottomContainer from "@/components/BottomContainer";
import { usePathname } from 'next/navigation';
import { BottomContainerProvider } from '@/contexts/BottomContainerContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLoadingPage = pathname === '/';
  const isInitialSettingPage = pathname === '/initialSettings';
  const isAddEventPage = pathname === '/addEvent';
  const isEditEventPage = pathname?.startsWith('/editEvent/');
  const showBottomContainer = !isLoginPage && !isLoadingPage && !isInitialSettingPage && !isAddEventPage && !isEditEventPage;

  return (
    <Providers>
      <BottomContainerProvider>
        {children}
        {showBottomContainer && <BottomContainer />}
      </BottomContainerProvider>
    </Providers>
  );
}