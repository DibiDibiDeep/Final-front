import Image from "next/image"
import GoogleAuthLogin from "./google"

export default function Login() {
    return (
        <>
            <Image
                src="/img/mg-logoback.png"
                width={100}
                height={100}
                alt="logo"
            />
            <p>Mongeul</p>
            <p>Mongeul</p>
            <GoogleAuthLogin />
        </>
    )
}