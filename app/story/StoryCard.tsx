'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface StoryCardProps {
    id: number;
    title: string;
    coverPath: string;
    priority?: boolean;
}

export default function StoryCard({ id, title, coverPath, priority = false }: StoryCardProps) {
    const [imageSrc, setImageSrc] = useState<string>(coverPath);
    const [hasError, setHasError] = useState<boolean>(false);
    const router = useRouter();

    const handleClick = useCallback(async () => {
        try {
            const response = await fetch(`${BACKEND_API_URL}/api/books/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch story data');
            }
            const data = await response.json();
            localStorage.setItem(`storyPages_${id}`, JSON.stringify(data));
            router.push(`/story/${id}`);
        } catch (error) {
            console.error('Failed to fetch story data:', error);
            // Error handling - you might want to show a user-friendly error message here
        }
    }, [id, router]);

    const handleImageError = useCallback(() => {
        setHasError(true);
        setImageSrc('/img/storyThumbnail/fallback.jpg'); // Path to fallback image
    }, []);

    return (
        <div
            onClick={handleClick}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            role="button"
            tabIndex={0}
            aria-label={`View story: ${title}`}
            className="bg-white/70 rounded-xl shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <div className="relative w-full h-40">
                <Image
                    src={imageSrc}
                    alt={title}
                    onError={handleImageError}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                />
            </div>
            <div className="p-3">
                <h3 className="font-bold text-gray-700 mb-1 truncate text-base sm:text-lg md:text-xl">{title}</h3>
            </div>
        </div>
    );
}