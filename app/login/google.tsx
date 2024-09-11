'use client'

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { useRouter } from 'next/navigation'; 


const GoogleAuthLogin = () => {
    const router = useRouter(); 

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const response = await fetch('http://localhost:8080/api/users/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
                
                // Store the JWT token
                localStorage.setItem('token', data.token);
                
                // Store user data if needed
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect based on the response code
                if (data.code === 201) {
                    router.push('/initialSettings');
                } else {
                    router.push('/home'); // or wherever you want to redirect existing users
                }
            } else {
                console.error('Login failed:', await response.text());
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };


    return (
        <>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.log("Login 실패");
                }}
                width={300}
                useOneTap
            />
        </>
    )
}

export default GoogleAuthLogin;
