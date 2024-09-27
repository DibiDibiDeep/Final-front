import { useState, useEffect } from 'react';
import Router from 'next/router';

interface User {
    userId: number;
    email: string;
    name: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function initiateGoogleLogin(): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/api/auth/google-url`);
    const data = await response.json();
    window.location.href = data.url;
}

export async function handleGoogleCallback(code: string): Promise<User> {
    const response = await fetch(`${BACKEND_URL}/api/auth/google-callback?code=${code}`);
    if (!response.ok) {
        throw new Error('Google authentication failed');
    }
    return response.json();
}

export async function getCurrentUser(): Promise<User | null> {
    const response = await fetch(`${BACKEND_URL}/api/auth/user`, {
        credentials: 'include',
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export async function logout(): Promise<void> {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    Router.push('/login');
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser().then((user) => {
            setUser(user);
            setLoading(false);
        });
    }, []);

    const checkAuth = () => {
        if (!loading && !user) {
            Router.push('/login');
        }
    };

    return { user, loading, checkAuth };
}