'use client'

import { GoogleLogin } from "@react-oauth/google"
import { useRouter } from 'next/navigation'; 


const GoogleAuthLogin = () => {
    const router = useRouter(); 

    return (
        <>
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    console.log(credentialResponse);
                    router.push('/initialSettings');
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
