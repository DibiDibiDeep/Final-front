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

        router.push('/home');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLoginClick = () => {
    signIn('google');
  };

  return (
    <div>
      <button onClick={handleLoginClick}>Sign in with Google</button>
    </div>
  );
};

export default LoginPage;