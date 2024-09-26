'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button, Input, Image } from '@nextui-org/react';

// 환경 변수
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function Login() {
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check for dummy login credentials
        if (userId === "1" && email === "chulsoo@example.com") {
            localStorage.setItem('userId', '1');
            localStorage.setItem('email', 'chulsoo@example.com')
            setError(""); // Clear any previous errors
            router.push("/home"); // Redirect directly to home
            return;
        }

        if (!userId || !email) {
            setError("Please enter both User ID and Email.");
            return;
        }

        setError("");

        try {
            const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, email }), // Ensure keys match with backend
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            router.push(data.redirectUrl);
        } catch (err) {
            setError(error || "An error occurred");
        }
    };

    return (
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
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <input
                        type="text"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="mb-2 p-2 rounded border border-gray-300 text-gray-700"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mb-2 p-2 rounded border border-gray-300 text-gray-700"
                        required
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}
