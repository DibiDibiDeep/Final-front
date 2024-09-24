'use client'

import React, { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      handleGoogleLogin();
    }
  }, [session, status]);

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/users/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: session?.accessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);

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

  const handleLoginClick = () => {
    signIn('google');
  };

  if (status === "authenticated") {
    return <p>로그인 중입니다...</p>; // 이미 로그인된 경우
  }

  return (
    <div>
      <button onClick={handleLoginClick}>Sign in with Google</button>
    </div>
  );
};

export default LoginPage;