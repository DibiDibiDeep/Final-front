import React from 'react';
import Link from 'next/link';
import { CalendarResult } from '@/utils/processImage';

interface Activity {
    name: string;
    time: string | null;
    infomation: string;
}

interface Event {
    date: string;
    activities: Activity[];
}

interface EventCalendarProps {
    result: CalendarResult;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ result }) => {
    if (!result || !result.events) {
        return <div>표시할 이벤트가 없습니다</div>;
    }

    const { year, month, events, etc } = result;

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-center">
                {year ? `${year}년 ` : ''}{month}월 일정
            </h2>

            {events.map((event: Event) => (
                <div key={event.date} className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
                    <div className="bg-purple-600 text-white px-4 py-2">
                        <h3 className="text-xl font-semibold">
                            {month}월 {event.date}일
                        </h3>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-2">
                            {event.activities.map((activity: Activity, index: number) => (
                                <li key={index} className="bg-gray-100 p-2 rounded">
                                    <div className="font-medium text-gray-700">{activity.name}</div>
                                    {activity.time && (
                                        <div className="text-sm text-gray-600">{activity.time}</div>
                                    )}
                                    {activity.infomation && (
                                        <div className="text-sm text-gray-600">{activity.infomation}</div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}

            {etc && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="bg-purple-600 text-white px-4 py-2">
                        <h3 className="text-xl text-white font-semibold">기타 정보</h3>
                    </div>
                    <div className="p-4">
                        <p className="whitespace-pre-line text-gray-700">{etc}</p>
                    </div>
                </div>
            )}

            <Link href="/home" className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg mt-4 mb-[200px]">
                홈으로 돌아가기
            </Link>
        </div>
    );
};

export default EventCalendar;