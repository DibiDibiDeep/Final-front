'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/authHooks';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface StoryCardProps {
    id: number;
    title: string;
    coverPath: string;
    priority?: boolean;
    onDelete: (id: number) => void; // Add onDelete prop
}

export default function StoryCard({ id, title, coverPath, priority = false, onDelete }: StoryCardProps) {
    const [imageSrc, setImageSrc] = useState<string>(coverPath);
    const [hasError, setHasError] = useState<boolean>(false);
    const router = useRouter();
    const { token } = useAuth();

    const handleClick = useCallback(async () => {
        // console.log('click', id);
        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/books/${id}`, {
                method: 'GET'
            });
            if (!response) {
                throw new Error('Failed to fetch story data');
            }
            localStorage.setItem(`storyPages_${id}`, JSON.stringify(response));
            router.push(`/story/${id}`);
        } catch (error) {
            // console.error('Failed to fetch story data:', error);
        }
    }, [id, token, router]);

    const handleImageError = useCallback(() => {
        setHasError(true);
        setImageSrc('/img/storyThumbnail/fallback.jpg');
    }, []);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the click from propagating to the parent card
        onDelete(id);
    }, [id, onDelete]);

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
                <button
                    onClick={handleDelete}
                    className="text-red-500 hover:underline"
                    aria-label={`Delete story: ${title}`}
                >
                    삭제
                </button>
            </div>
        </div>
    );
}
