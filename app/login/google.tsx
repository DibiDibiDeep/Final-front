'use client'

import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      handleLoginSuccess(session);
    }
  }, [session, status, router]);

  const handleLoginSuccess = async (session: any) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/users/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: session.accessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userId', data.user.userId.toString());

          if (data.hasBaby) {
            router.push('/home');
          } else {
            router.push('/initialSettings');
          }
        } else {
          console.error('Unexpected data structure. Full data:', data);
        }
      } else {
        const errorText = await response.text();
        if (response.status === 401) {
          console.error('Authentication failed. Please log in again.', errorText);
        } else {
          console.error('Login failed. Status:', response.status, 'Response:', errorText);
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google');
  };

  if (status === "authenticated") {
    return <p>로그인 중입니다...</p>; // 이미 로그인된 경우
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
};

export default LoginPage;
