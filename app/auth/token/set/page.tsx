'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken, decodeToken, getCurrentUser } from '@/utils/authUtils';
import Cookies from 'js-cookie';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function SetToken() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');
    const [message, setMessage] = useState('Processing login...');

    useEffect(() => {
        // console.log('SetToken: useEffect triggered');
        // console.log('Token:', token);

        if (token) {
            try {
                const user = decodeToken(token);
                // console.log('Decoded user:', user);
                setAuthToken(token);
                // console.log('Token set in cookie: ', Cookies.get('authToken'));

                Cookies.set('userId', user.userId.toString(), { expires: 7, secure: true, sameSite: 'strict' });
                Cookies.set('userEmail', user.email, { expires: 7, secure: true, sameSite: 'strict' });
                Cookies.set('userName', user.name, { expires: 7, secure: true, sameSite: 'strict' });
                // console.log('User info saved in cookies');

                setMessage('Login successful. Checking user data...');

                // Send GET request to check for babyId
                fetch(`${BACKEND_API_URL}/api/baby/user/${user.userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        // console.log('data', data);
                        if (data != null) {
                            // console.log('BabyId found. Redirecting to home page');
                            router.push('/home');
                        } else {
                            // console.log('No babyId found. Redirecting to initialSettings page');
                            router.push('/initialSettings');
                        }
                    })
                    .catch(error => {
                        // console.error('Error checking user data:', error);
                        setMessage('Error occurred. Redirecting to login page...');
                        setTimeout(() => router.push('/login?error=api_error'), 1500);
                    });
            } catch (error) {
                // console.error('Failed to process token:', error);
                setMessage('Login failed. Redirecting to login page...');
                setTimeout(() => router.push('/login?error=invalid_token'), 1500);
            }
        } else {
            // console.log('No token found');
            setMessage('No token found. Redirecting to login page...');
            setTimeout(() => router.push('/login?error=no_token'), 1500);
        }
    }, [token, router]);

    return <div className="text-center p-4">{message}</div>;
}