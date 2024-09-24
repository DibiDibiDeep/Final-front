'use client'

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { useRouter } from 'next/navigation';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

const GoogleAuthLogin = () => {
    const router = useRouter();

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const response = await fetch(`${BACKEND_API_URL}/api/users/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Full server response:', data);

                if (data && typeof data === 'object') {
                    console.log('Checking data structure...');
                    console.log('hasBaby:', data.hasBaby);
                    console.log('user:', data.user);
                    console.log('token:', data.token);

                    if (data.user && typeof data.user === 'object' && 'userId' in data.user && data.token) {
                        console.log('Data structure is valid');
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        localStorage.setItem('userId', data.user.userId.toString());

                        if (data.hasBaby === true) {
                            console.log('hasBaby is true, redirecting to /home');
                            router.push('/home');
                        } else {
                            console.log('hasBaby is false, redirecting to /initialSettings');
                            router.push('/initialSettings');
                        }
                    } else {
                        console.error('Invalid user data structure');
                    }
                } else {
                    console.error('Unexpected data structure. Full data:', data);
                }
            } else {
                const errorText = await response.text();
                console.error('Login failed. Status:', response.status, 'Response:', errorText);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleGoogleError = (error: unknown) => {
        console.error("Google Login failed. Error details:", error);

        // 에러 객체의 구조를 파악하기 위한 추가 로깅
        if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        } else {
            console.error("Non-Error object received:", error);
        }

        // 여기에 추가적인 에러 처리 로직을 구현할 수 있습니다.
        // 예: 사용자에게 에러 메시지 표시, 에러 리포팅 서비스로 전송 등
    };


    return (
        <>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    return handleGoogleError as unknown as () => void;
                }}
                width={300}
                useOneTap
            />
        </>
    )
}

export default GoogleAuthLogin;