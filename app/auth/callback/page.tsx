// 'use client';

// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';

// const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// export default function GoogleCallback() {
//   const router = useRouter();
//   const { code } = router.query; // Google에서 전달된 code
//   const [error, setError] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState<boolean>(true); // 상태 추가

//   useEffect(() => {
//     const handleCallback = async () => {
//       if (router.isReady && code) { // router.isReady 확인
//         try {
//           setIsProcessing(true); // 처리 중 상태로 전환
//           const response = await fetch(`${BACKEND_API_URL}/api/auth/google-callback`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ code }),
//           });

//           if (!response.ok) {
//             throw new Error('Google 로그인 실패');
//           }

//           const { token } = await response.json();
//           localStorage.setItem('authToken', token); // 토큰을 로컬스토리지에 저장

//           // 로그인 완료 후 메인 페이지로 이동
//           router.push('/home');
//         } catch (error) {
//           console.error('Error during Google login callback:', error);
//           setError('Google 로그인 처리 중 오류가 발생했습니다.');
//         } finally {
//           setIsProcessing(false); // 처리 완료 후 상태 변경
//         }
//       }
//     };

//     handleCallback();
//   }, [router.isReady, code]); // router.isReady 추가

//   return null; // 처리 완료 시 빈 화면
// }
