import Image from "next/image"
import GoogleAuthLogin from "./google"

export default function Login() {
    return (
        <>
            <div className="w-full max-w-[76vw] h-full">
                <div className="justify-between items-center mb-2">
                    <Image
                        src="/img/mg-logoback.png"
                        width={140}
                        height={140}
                        alt="logo"
                        className="flex mx-auto my-0"
                    />
                    <p className="flex items-center justify-center text-white">Mongeul</p>
                    <p className="flex items-center justify-center text-white">Mongeul</p>
                    <GoogleAuthLogin />
                </div>
            </div>
        </>
    )
}