'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { Image } from '@nextui-org/react';
import Image from 'next/image';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Page {
    pageId: number;
    pageNum: number;
    text: string;
    illustPrompt: string;
    imagePath: string;
}

interface StoryData {
    bookId: number;
    title: string;
    pages: Page[];
}

export default function StoryDetailPage({ params }: { params: { id: string } }) {
    const [storyData, setStoryData] = useState<StoryData | null>(null);
    const { id } = params;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedData = localStorage.getItem(`storyPages_${id}`);
                if (storedData) {
                    setStoryData(JSON.parse(storedData));
                } else {
                    const response = await axios.get(`${BACKEND_API_URL}/api/books/${id}`);
                    setStoryData(response.data);
                    console.log(response.data.imagePath);
                    localStorage.setItem(`storyPages_${id}`, JSON.stringify(response.data));
                }
            } catch (error) {
                console.error('Failed to fetch story data:', error);
                // Error handling
            }
            finally {
                console.log(localStorage.getItem(`storyPages_${id}`));
            }
        };
        fetchData();
    }, [id]);

    if (!storyData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{storyData.title}</h1>
            {storyData.pages?.map((page) => (
                <div key={page.pageId} className="mb-8 p-4 bg-white rounded-lg shadow text-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Page {page.pageNum}</h2>
                    <p className="mb-4 text-gray-700">{page.text}</p>
                    <Image
                        src={page.imagePath}
                        alt={`Illustration for page ${page.pageNum}`}
                        width={500}
                        height={500}
                        className="mb-4 w-full h-auto"
                        unoptimized={true}
                    />
                </div>
            ))}
        </div>
    );
}
