'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/authHooks';
import { fetchWithAuth } from '@/utils/api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface Event {
    date: string;
    activities: Array<{
        name: string;
        time: string | null;
        infomation: string;
    }>;
}

interface InferenceResult {
    year: string | null;
    month: string;
    events: Event[];
}

interface CalendarData {
    calendarPhotoInfId: number;
    calendarPhotoId: number;
    inferenceResult: string;
    inferenceDate: string;
    userId: number;
    babyId: number;
}

const NoticeDetailPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const calendarPhotoInfId = params?.calendarPhotoInfId as string;
    const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);
    const { userId } = useAuth();

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendar-photo-inf/${userId}`, {
                    method: 'GET'
                });

                const relevantData = response.find(
                    (data: CalendarData) => data.calendarPhotoInfId === parseInt(calendarPhotoInfId)
                );

                if (relevantData) {
                    setInferenceResult(JSON.parse(relevantData.inferenceResult));
                } else {
                    // console.error('No data found for the specified ID');
                }
            } catch (error) {
                // console.error('Error fetching calendar data:', error);
            }
        };

        fetchCalendarData();
    }, [calendarPhotoInfId, userId]);

    if (!inferenceResult) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen p-4 mb-[120px]">
            <div className="flex items-center mb-6 h-12">
                <Link href="/notice" className="absolute top-9 left-4 w-10 h-10 flex items-center justify-center">
                    <Image src="/img/button/back.png" alt='Back' width={50} height={50} />
                </Link>
                <div className="flex-grow text-center">
                    <h1 className="text-2xl text-gray-700 font-bold leading-10">{`${inferenceResult.month}월 상세 일정`}</h1>
                </div>
            </div>
            <div className="space-y-4">
                {inferenceResult.events.map((event, index) => (
                    <div key={index} className="bg-white/40 rounded-[15px] shadow-md p-4 border-2 border-white">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700">{`${event.date}일`}</h2>
                        <ul className="list-disc list-inside text-gray-600">
                            {event.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="mb-1">
                                    {activity.name}
                                    {activity.time && <span className="text-gray-600 ml-2">{activity.time}</span>}
                                    {activity.infomation && <span className="text-gray-600 ml-2">{activity.infomation}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoticeDetailPage;
