'use client'

import { GoogleLogin } from "@react-oauth/google"
import { useRouter } from 'next/navigation'; // useRouter import

const GoogleAuthLogin = () => {
    const router = useRouter(); // useRouter 사용

    return (
        <>
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    console.log(credentialResponse);
                    router.push('/home');
                }}
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
