'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/authHooks';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface CalendarData {
    calendarPhotoInfId: number;
    calendarPhotoId: number;
    inferenceResult: string;
    inferenceDate: string;
    userId: number;
    babyId: number;
}

interface InferenceResult {
    year: string | null;
    month: string;
    events: Array<{
        date: string;
        activities: Array<{
            name: string;
            time: string | null;
            infomation: string;
        }> | undefined;
    }>;
}

const NoticePage: React.FC = () => {
    const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
    const router = useRouter();
    const { token, userId, error: authError } = useAuth();

    useEffect(() => {
        if (userId) {
            getAllCalendarData();
        }
    }, [userId]);

    const getAllCalendarData = async () => {
        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendar-photo-inf/${userId}`, {
                method: 'GET'
            });
            if (!response) {
                throw new Error('Failed to process image. No response received.');
            }
            // console.log("response", response);
            setCalendarData(response);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // console.error('Request timed out');
            } else if (error.message) {
                // console.error('Error occurred:', error.message);
            } else {
                // console.error('Unknown error:', error);
            }
        }
    };

    const handleCardClick = (calendarPhotoInfId: number) => {
        // Use both month and calendarPhotoInfId for unique routing
        router.push(`/notice/${calendarPhotoInfId}`);
    };

    return (
        <>
            <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
                <h1 className="text-2xl sm:text-3xl text-gray-700 font-bold text-center mb-8 sm:mb-12">일정 목록</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(calendarData) && calendarData.map((data) => {
                        const inferenceResult: InferenceResult = JSON.parse(data.inferenceResult);
                        return (
                            <div
                                key={data.calendarPhotoInfId}
                                className="bg-white/40 rounded-[15px] shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-white hover:bg-white/60 flex flex-col justify-between h-[250px]"
                                onClick={() => handleCardClick(data.calendarPhotoInfId)}
                            >
                                <div>
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800">{`${inferenceResult.month}월 일정`}</h2>
                                    <p className="text-gray-600 mb-4">{`${inferenceResult.events.length}개의 일정`}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {inferenceResult.events.slice(0, 3).map((event, index) => (
                                        <p key={index} className="truncate">
                                            {event.activities && event.activities.length > 0
                                                ? `${event.date}일: ${event.activities[0].name}`
                                                : `${event.date}일: 활동 없음`}
                                        </p>
                                    ))}
                                    {inferenceResult.events.length > 3 && (
                                        <p className="text-blue-500">... 더 보기</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
};

export default NoticePage;
