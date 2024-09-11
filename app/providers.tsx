'use client'

import { NextUIProvider } from '@nextui-org/react'
import { GoogleOAuthProvider } from '@react-oauth/google'

export function Providers({ children }: { children: React.ReactNode }) {

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID;

    if (!clientId) {
        throw new Error('Google OAuth Client ID is missing');
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <NextUIProvider>
                {children}
            </NextUIProvider>
        </GoogleOAuthProvider>
    )
}