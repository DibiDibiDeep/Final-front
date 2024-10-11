'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, setAuthToken } from '@/utils/authUtils';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function GoogleAuthLogin(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const [token, setToken] = useState<string | undefined>(undefined); // 작업 중인 현재 인증 토큰의 값

  const checkAuthStatus = async (token: string | undefined) => {
    // console.log('Auth token:', token ? 'exists' : 'does not exist');

    if (token) {
      try {
        const response = await fetchWithAuth(
          `${BACKEND_API_URL}/api/auth/validate-token`,
          {
            method: 'POST',
            body: { token },
          }
        );

        if (response.isValid) {
          // console.log('Token valid, redirecting to /home');
          setIsRedirecting(true);
        } else {
          // console.log('Token invalid, clearing and staying on login page');
          setAuthToken('');
          setIsLoading(false);
        }
      } catch (error) {
        // console.error('Error validating token:', error);
        setAuthToken('');
        setIsLoading(false);
      }
    } else {
      // console.log('No token found, setting isLoading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // console.log('Component mounted, checking auth status');
    const storedToken = getAuthToken();
    setToken(storedToken);
    checkAuthStatus(storedToken);
  }, []);

  useEffect(() => {
    if (isRedirecting) {
      // console.log('Redirection to /home initiated');
      router.push('/home');
    }
  }, [isRedirecting, router]);

  const handleGoogleLogin = async () => {
    // console.log('Initiating Google login');
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/google-url`);
      if (!response.ok) {
        throw new Error(`Failed to get Google Auth URL. status: ${response.status}`);
      }
      const data = await response.json();

      setAuthToken(data.token);
      setToken(data.token); // 여기서도 토큰 상태를 업데이트
      // console.log('Received Google Auth URL:', data.url);
      window.location.href = data.url;
    } catch (err) {
      // console.error('Error in handleGoogleLogin:', err);
      setError('Google OAuth 설정을 가져오는 데 실패했습니다.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      // console.log('Token received from OAuth callback');
      setAuthToken(tokenFromUrl);
      setToken(tokenFromUrl); // 토큰 상태 업데이트
      checkAuthStatus(tokenFromUrl); // 새 토큰으로 체크
    }
  }, []);

  if (error) {
    return (
      <div>
        <p>오류: {error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  if (isLoading || isRedirecting) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>
        <Image
          src="/img/google.png"
          alt='Google Login'
          width={180}
          height={120}
        />
      </button>
    </div>
  );
}
