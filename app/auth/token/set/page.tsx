'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken, decodeToken } from '@/utils/authUtils';

export default function SetToken() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');
    const [message, setMessage] = useState('Processing login...');

    useEffect(() => {
        console.log('SetToken: useEffect triggered');
        console.log('Token:', token);

        if (token) {
            try {
                const user = decodeToken(token);
                console.log('Decoded user:', user);

                setAuthToken(token);
                console.log('Token set in local storage');

                // 사용자 정보를 로컬 스토리지에 저장
                localStorage.setItem('userId', user.userId.toString());
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.name);
                console.log('User info saved in local storage');

                setMessage('Login successful. Redirecting...');

                // 홈 페이지로 리다이렉트
                setTimeout(() => {
                    console.log('Redirecting to home page');
                    router.push('/home');
                }, 1500);
            } catch (error) {
                console.error('Failed to process token:', error);
                setMessage('Login failed. Redirecting to login page...');
                setTimeout(() => router.push('/login?error=invalid_token'), 1500);
            }
        } else {
            console.log('No token found');
            setMessage('No token found. Redirecting to login page...');
            setTimeout(() => router.push('/login?error=no_token'), 1500);
        }
    }, [token, router]);

    return <div className="text-center p-4">{message}</div>;
}