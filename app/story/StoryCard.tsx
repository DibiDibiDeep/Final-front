'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface StoryCardProps {
    id: number;
    title: string;
    coverPath: string;
}



export default function StoryCard({ id, title, coverPath }: StoryCardProps) {
    const [imageSrc, setImageSrc] = useState<string>(coverPath);
    const [hasError, setHasError] = useState<boolean>(false);
    const router = useRouter();

    const handleClick = async () => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/api/books/${id}`);
            localStorage.setItem(`storyPages_${id}`, JSON.stringify(response.data));
            router.push(`/story/${id}`);
        } catch (error) {
            console.error('Failed to fetch story data:', error);
            // Error handling
        }
    };

    const handleImageError = () => {
        setHasError(true);
        setImageSrc('/img/storyThumbnail/fallback.jpg'); // Path to fallback image
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white/70 rounded-xl shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-white cursor-pointer"
        >
            <div className="relative w-full h-40">
                <Image
                    src={imageSrc}
                    alt={title}
                    onError={handleImageError}
                    className="absolute inset-0 w-full h-full object-cover"
                    fill
                />
            </div>
            <div className="p-3">
                <h3 className="font-bold text-gray-700 mb-1 truncate text-base sm:text-lg md:text-xl">{title}</h3>
            </div>
        </div>
    );
}
