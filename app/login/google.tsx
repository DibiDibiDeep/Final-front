'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const GoogleLogin: React.FC = () => {
  const router = useRouter();

  // NextAuth의 useSession 훅을 사용하여 세션 정보 가져오기
  const { data: session, status } = useSession();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 세션 정보가 있으면 콘솔에 로그 출력 및 localStorage에 저장
    if (session && session.accessToken) {
      console.log('User session:', session);
      localStorage.setItem('accessToken', session.accessToken);
      // 여기에 필요한 다른 세션 정보를 localStorage에 저장할 수 있습니다.
      router.push('/home');
    }
  }, [session, router]);

  const handleLogin = async () => {
    try {
      // 로그인
      const result = await signIn('google', { callbackUrl: '/home' });
      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      setError('Error during login: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        <p>Logged in as {session.user?.email}</p>
        {/* 로그아웃 */}
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogin}>Google 로그인</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default GoogleLogin;