'use client'

import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from "./providers";
import ClientSideComponent from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-r from-pink-200 to-blue-200 flex flex-col">
        <div className="flex flex-col flex-grow items-center justify-center overflow-auto">
            <Providers>
              <ClientSideComponent>
                {children}
              </ClientSideComponent>
            </Providers>
        </div>
      </body>
    </html>
  );
}