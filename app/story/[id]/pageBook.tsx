'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

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
    const [currentPage, setCurrentPage] = useState(0);
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
                    localStorage.setItem(`storyPages_${id}`, JSON.stringify(response.data));
                }
            } catch (error) {
                console.error('Failed to fetch story data:', error);
                // 에러 처리
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (storyData && storyData.pages.length > currentPage + 1) {
            const nextImage: HTMLImageElement = new (window as any).Image();
            nextImage.src = storyData.pages[currentPage + 1].imagePath;
        }
    }, [currentPage, storyData]);

    if (!storyData) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const handleNextPage = () => {
        if (currentPage < storyData.pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentPageData = storyData.pages[currentPage];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4">
                <h1 className="text-xl font-bold text-center truncate">{storyData.title}</h1>
            </header>

            <main className="flex-grow flex flex-col justify-between p-4">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Page {currentPageData.pageNum}</h2>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative w-full" style={{ paddingTop: '75%' }}>
                            <Image
                                src={currentPageData.imagePath}
                                alt={`Illustration for page ${currentPageData.pageNum}`}
                                fill
                                sizes="100vw"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className="p-4">
                            <p className="text-sm mb-4">{currentPageData.text}</p>
                            <div className="bg-gray-100 p-2 rounded text-xs">
                                <h3 className="font-semibold mb-1">Illustration Prompt:</h3>
                                <p className="italic">{currentPageData.illustPrompt}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-300 text-sm"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === storyData.pages.length - 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-300 text-sm"
                    >
                        Next
                    </button>
                </div>
            </main>

            <footer className="bg-white shadow-sm p-4 text-center text-xs text-gray-500">
                Page {currentPage + 1} of {storyData.pages.length}
            </footer>
        </div>
    );
}