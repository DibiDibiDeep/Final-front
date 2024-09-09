'use client';
import React, { useEffect, useState } from 'react';
import { CalendarResult } from '@/utils/processImage';
import EventCalendar from '@/components/EventCalendar';

const CalendarResultPage: React.FC = () => {
    const [calendarData, setCalendarData] = useState<CalendarResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedCalendarData = localStorage.getItem('calendarData');
        const storedError = localStorage.getItem('calendarError');

        if (storedCalendarData) {
            try {
                setCalendarData(JSON.parse(storedCalendarData));
                localStorage.removeItem('calendarData');
            } catch (e) {
                console.error('Failed to parse calendar data:', e);
                setError('캘린더 데이터 파싱 중 오류가 발생했습니다.');
            }
        }

        if (storedError) {
            setError(storedError);
            localStorage.removeItem('calendarError');
        }
    }, []);

    return (
        <div className="container mx-auto p-4 pb-32">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">오류!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}
            {calendarData && <EventCalendar result={calendarData} />}
        </div>
    );
};

export default CalendarResultPage;