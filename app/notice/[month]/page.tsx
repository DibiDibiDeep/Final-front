'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

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
    const month = params?.month as string;
    const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const response = await axios.get<CalendarData[]>(`${BACKEND_API_URL}/api/calendar-photo-inf`);
                if (response.status !== 200) {
                    throw new Error(`Failed to fetch calendar data. Status: ${response.status}`);
                }

                const relevantData = response.data.find(data => {
                    const parsedResult: InferenceResult = JSON.parse(data.inferenceResult);
                    return parsedResult.month === month;
                });

                if (relevantData) {
                    setInferenceResult(JSON.parse(relevantData.inferenceResult));
                } else {
                    console.error('No data found for the specified month');
                }
            } catch (error) {
                console.error('Error fetching calendar data:', error);
            }
        };

        fetchCalendarData();
    }, [month]);

    if (!inferenceResult) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen p-4 mb-[120px]">
            <Link href="/notice" className="text-blue-500 hover:underline mb-4 inline-block">
                &larr; 목록으로 돌아가기
            </Link>
            <h1 className="text-2xl text-center font-bold mb-6">{`${inferenceResult.month}월 상세 일정`}</h1>
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