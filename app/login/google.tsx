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

    return (
        <>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={(error: unknown) => {
                    console.error("Google Login failed:", error);
                }}
                width={300}
                useOneTap
            />
        </>
    )
}

export default GoogleAuthLogin;