// 클라이언트 컴포넌트 → 각 책의 정보를 카드 형태로 표시 / 클릭 시 상세 페이지로 이동
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface StoryCardProps {
    id: number;
    title: string;
    coverPath: string;
}

export default function StoryCard({ id, title, coverPath }: StoryCardProps) {
    const router = useRouter();

    const handleClick = async () => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/api/books/${id}`);
            localStorage.setItem(`storyPages_${id}`, JSON.stringify(response.data));
            router.push(`/story/${id}`);
        } catch (error) {
            console.error('Failed to fetch story data:', error);
            // 에러 처리
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white/70 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-white cursor-pointer"
        >
            <img src={coverPath} alt={title} className="w-full h-40 object-cover" />
            <div className="p-3">
                <h3 className="font-bold text-gray-700 mb-1 truncate">{title}</h3>
            </div>
        </div>
    );
}
