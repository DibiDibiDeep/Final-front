'use client';
import React, { useEffect, useState, useRef } from 'react';
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
    const [isReading, setIsReading] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const { id } = params;
    const speechSynthesis = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    if (!('speechSynthesis' in window)) {
        return (
            <div>
                <p>Sorry, your browser doesn't support text-to-speech functionality.</p>
                <p>Please try using a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
        );
    }

    useEffect(() => {
        speechSynthesis.current = window.speechSynthesis;
        return () => {
            if (speechSynthesis.current && utteranceRef.current) {
                speechSynthesis.current.cancel();
            }
        };
    }, []);

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
            }
        };
        fetchData();
    }, [id]);

    const readPage = (text: string) => { // 각 페이지의 텍스트를 읽어주는 함수
        if (speechSynthesis.current) {
            if (utteranceRef.current) {
                speechSynthesis.current.cancel();
            }
            utteranceRef.current = new SpeechSynthesisUtterance(text);
            utteranceRef.current.onend = () => { // 텍스트 다 읽으면 다음 페이지로 넘김
                setIsReading(false);
                if (currentPage < (storyData?.pages.length || 0) - 1) {
                    setTimeout(() => {
                        setFadeIn(false);
                        setTimeout(() => {
                            setCurrentPage(prev => prev + 1);
                            setFadeIn(true);
                        }, 500);
                    }, 1000);
                }
            };
            setIsReading(true);
            speechSynthesis.current.speak(utteranceRef.current);
        }
    };

    const toggleReading = () => {
        if (isReading) {
            if (speechSynthesis.current) {
                speechSynthesis.current.cancel();
            }
            setIsReading(false);
        } else if (storyData) {
            readPage(storyData.pages[currentPage].text);
        }
    };

    useEffect(() => {
        if (storyData && storyData.pages[currentPage]) {
            setFadeIn(true);
            if (isReading) {
                readPage(storyData.pages[currentPage].text);
            }
        }
    }, [currentPage, storyData]);

    const handleNextPage = () => {
        if (storyData && currentPage < storyData.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    if (!storyData) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const currentPageData = storyData.pages[currentPage];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4">
                <h1 className="text-xl font-bold text-center truncate">{storyData.title}</h1>
            </header>

            <main className="flex-grow flex flex-col justify-between p-4">
                <div className={`mb-4 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
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
                        onClick={toggleReading}
                        className="px-4 py-2 bg-green-500 text-white rounded-full text-sm"
                    >
                        {isReading ? 'Stop Reading' : 'Read Aloud'}
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