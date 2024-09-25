// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// export default function GoogleAuthLogin() {
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchAuthUrl = async () => {
//       try {
//         const response = await fetch(`${BACKEND_API_URL}/api/auth/google-url`, {
//           method: 'GET',
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch auth URL');
//         }

//         const { url } = await response.json();
//         window.location.href = url; // 구글 로그인 페이지로 리다이렉트
//       } catch (error) {
//         console.error('Error fetching auth URL:', error);
//         setError('Google 로그인을 시작할 수 없습니다. 나중에 다시 시도해주세요.');
//       }
//     };

//     fetchAuthUrl();
//   }, []);

//   if (error) {
//     return (
//       <div>
//         <p>에러: {error}</p>
//         <button onClick={() => window.location.reload()}>다시 시도</button>
//       </div>
//     );
//   }

//   return <div>Google 로그인으로 리다이렉트 중...</div>;
// }
