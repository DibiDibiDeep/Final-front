'use client'

import { SessionProvider } from "next-auth/react";
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
    // 모든 페이지와 컴포넌트에서 NextAuth의 세션 기능 사용 가능, useSession 훅 사용하여 현재 세션 정보에 접근
    <SessionProvider>
      <Providers>
        <BottomContainerProvider>
          {children}
          {showBottomContainer && <BottomContainer />}
        </BottomContainerProvider>
      </Providers>
    </SessionProvider>
  );
}