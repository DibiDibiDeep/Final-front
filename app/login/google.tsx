'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getCurrentUser } from '@/utils/authUtils';
import Image from 'next/image';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function GoogleAuthLogin(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ userId: number; email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('GoogleAuthLogin: useEffect triggered');

    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);

    if (currentUser) {
      setUser(currentUser);
      router.push('/home');
    } else {
      setIsLoading(false); // Set loading to false when no user is found
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    console.log('Initiating Google login');
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/google-url`);
      if (!response.ok) {
        throw new Error('Failed to get Google Auth URL');
      }
      const data = await response.json();
      console.log('Received Google Auth URL:', data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error('Error in initiateGoogleLogin:', err);
      setError('Google OAuth 설정을 가져오는 데 실패했습니다.');
    }
  };

  if (error) {
    return (
      <div>
        <p>오류: {error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  if (user) {
    return <div>로그인 성공! 홈 페이지로 이동 중...</div>;
  }

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>
        <Image
          src="/img/google.png"
          alt='Back'
          width={180}
          height={120}
        />
      </button>
    </div>
  );
}
