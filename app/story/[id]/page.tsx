'use client';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/authHooks';

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

const removeEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
};

export default function StoryDetailPage({ params }: { params: { id: string } }) {
    const [storyData, setStoryData] = useState<StoryData | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isReading, setIsReading] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const { id } = params;
    const speechSynthesis = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isBrowserSupported, setIsBrowserSupported] = useState(true);
    const { token, error: authError } = useAuth();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if ('speechSynthesis' in window) {
                speechSynthesis.current = window.speechSynthesis;
            } else {
                setIsBrowserSupported(false);
            }
        }
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
                    const response = await fetchWithAuth(`${BACKEND_API_URL}/api/books/${id}`, { method: 'GET' });
                    setStoryData(response);
                    localStorage.setItem(`storyPages_${id}`, JSON.stringify(response));
                }
            } catch (error) {
                console.error('Failed to fetch story data:', error);
            }
        };
        fetchData();
    }, [id]);

    const readPage = (text: string) => {
        if (speechSynthesis.current) {
            if (utteranceRef.current) {
                speechSynthesis.current.cancel();
            }
            const cleanText = removeEmojis(text);
            utteranceRef.current = new SpeechSynthesisUtterance(cleanText);
            utteranceRef.current.onend = () => {
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

    if (!isBrowserSupported) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4">
                <p className="text-center mb-2">죄송합니다. 귀하의 브라우저가 텍스트 음성 변환 기능을 지원하지 않습니다.</p>
                <p className="text-center">Chrome, Firefox, Edge와 같은 최신 브라우저를 사용해 주세요.</p>
            </div>
        );
    }

    if (!storyData) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    const currentPageData = storyData.pages[currentPage];

    return (
        <div className="flex flex-col min-h-screen p-8 pb-32">
            <h1 className="text-xl font-bold text-center text-gray-700 mb-4">{storyData.title}</h1>

            <div className="flex-grow flex flex-col justify-center items-center">
                <div className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md w-full mb-4">
                        <div className="relative w-full">
                            <Image
                                src={currentPageData.imagePath}
                                alt={`페이지 ${currentPageData.pageNum}의 삽화`}
                                // layout="responsive"  // 비율 유지
                                width={512}          // 원하는 비율의 너비
                                height={512}         // 원하는 비율의 높이
                                sizes="100vw"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className="p-4">
                            <p className="text-sm md:text-base text-gray-700">{currentPageData.text}</p>
                        </div>
                    </div>

                    <div className="w-full mt-8">
                        <div className="flex justify-between mb-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                className="px-4 py-2 bg-transparent text-white border border-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all hover:bg-white/20"
                            >
                                이전
                            </button>
                            <button
                                onClick={toggleReading}
                                className="px-4 py-2 bg-primary text-white rounded-full text-sm transition-all hover:bg-primary-dark"
                            >
                                {isReading ? '읽기 중지' : '소리내어 읽기'}
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === storyData.pages.length - 1}
                                className="px-4 py-2 bg-transparent text-white border border-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all hover:bg-white/20"
                            >
                                다음
                            </button>
                        </div>

                        <p className="text-center text-xs text-white mt-4">
                            페이지 {currentPage + 1} / {storyData.pages.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}