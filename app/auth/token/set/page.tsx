import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SetToken({ searchParams }: { searchParams: { token?: string } }) {
    const router = useRouter();
    const token = searchParams.token;

    useEffect(() => {
        if (token) {
            // 클라이언트 측에서 토큰을 로컬 스토리지에 저장
            localStorage.setItem('authToken', token);

            // 저장이 완료되면 홈으로 리디렉션
            router.push('/home');
        } else {
            // 토큰이 없으면 로그인 페이지로 리디렉션
            router.push('/login?error=missing_token');
        }
    }, [token, router]);

    return <div>토큰을 설정 중...</div>;
}
