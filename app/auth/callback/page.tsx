import { redirect } from 'next/navigation';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// 추출한 인증 코드를 사용하여 백엔드 서버에 요청을 보내 액세스 토큰으로 교환
async function exchangeCodeForToken(code: string) {
    const response = await fetch(`${BACKEND_API_URL}/api/auth/google-callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }), // 인증 코드를 백엔드로 전송
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate'); // 액세스 토큰 교환 실패 시 에러 발생
    }

    return response.json(); // 액세스 토큰 반환
}

export default async function Callback({
    searchParams,
}: {
    searchParams: { code?: string };
}) {
    const code = searchParams.code; // 인증 코드 수신: URL에서 인증 코드를 추출

    if (!code) {
        redirect('/login?error=no_code'); // 인증 코드가 없을 경우 로그인 페이지로 리디렉션
    }

    try {
        const data = await exchangeCodeForToken(code); // 액세스 토큰 교환 시도

        // 받은 토큰을 로컬 스토리지에 저장
        localStorage.setItem('authToken', data.token);

        // 인증 성공 시 홈으로 리디렉션
        redirect('/home');
    } catch (error) {
        console.error('Authentication error:', error);
        redirect('/login?error=authentication_failed'); // 인증 실패 시 로그인 페이지로 리디렉션
    }
}
