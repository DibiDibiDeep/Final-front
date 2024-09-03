import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers";
import Header from '@/components/Header'
import BottomContainer from '@/components/BottomContainer';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mongeul Mongeul',
  description: 'Write down a day for you and your child',
}

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
            {children}
          </Providers>
        </div>
        <BottomContainer />
      </body>
    </html>
  )
}
