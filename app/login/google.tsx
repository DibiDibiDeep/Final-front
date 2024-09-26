'use client';
import { useState, useEffect } from 'react';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function GoogleAuthLogin() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initiateGoogleLogin = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/auth/google-url`);
        if (!response.ok) {
          throw new Error('Failed to get Google Auth URL');
        }
        const data = await response.json();
        window.location.href = data.url;
      } catch (err) {
        setError('Google OAuth 설정을 가져오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const token = localStorage.getItem('authToken');
    if (!token) {
      initiateGoogleLogin();
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

  return <div>Google 로그인으로 리다이렉팅 중...</div>;
}