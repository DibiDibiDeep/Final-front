'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const DevLogin: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/users/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 토큰과 사용자 정보를 로컬 스토리지에 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userId', data.user.userId.toString());
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('hasBaby', data.hasBaby.toString());
        localStorage.setItem('babyId', data.babyId.toString());
        
        // 홈 페이지로 리다이렉트
        window.location.href = '/home';
      } else {
        setError('Login failed');
      }
    } catch (error) {
      setError('Error during login: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>개발 환경 로그인</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DevLogin;