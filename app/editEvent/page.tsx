'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import Calendar from '../calendar/Calendar';
import axios from 'axios';

interface EventData {
    name: string;
    date: string;
    time: string;
    location: string;
}

async function submitEventData(eventData: EventData) {
    const response = await axios.post('/api/events', eventData);
    return response.data;
}

export default function EditPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventName, setEventName] = useState<string>('');
    const [eventLocation, setEventLocation] = useState<string>('');
    const [eventTime, setEventTime] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleGoToMain = async () => {
        setIsLoading(true);
        setError(null);

        const eventData = {
            name: eventName,
            date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(), // 'YYYY-MM-DDTHH:MM:SSZ' 형식
            time: eventTime,
            location: eventLocation,
        };

        try {
            const response = await submitEventData(eventData);
            console.log(response.message);
            router.push('/home');
        } catch (error) {
            console.error('Error sending event data:', error);
            setError('이벤트 데이터 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="fixed top-[37px] right-[23px]">
                <button
                    className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center"
                    onClick={handleGoToMain}
                    disabled={isLoading}
                >
                    <Image
                        src="/img/button/confirm.png"
                        alt='Confirm'
                        width={50}
                        height={50}
                        className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-50' : ''}`}
                    />
                </button>
            </div>
            <div className="min-h-screen pt-[110px]">
                <div className="fixed top-[110px] left-0 right-0 z-10">
                    <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                </div>
                <EditContainer>
                    <div className="flex flex-col space-y-5 pt-[5px]">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="eventName" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Event Name
                            </label>
                            <Input
                                id="eventName"
                                type="text"
                                placeholder="Enter event name"
                                onChange={(e) => setEventName(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="eventDate" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Date
                            </label>
                            <Input
                                id="eventDate"
                                type="text"
                                value={selectedDate ? selectedDate.toLocaleDateString() : new Date().toLocaleDateString()}
                                readOnly
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="eventTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Time
                            </label>
                            <Input
                                id="eventTime"
                                type="time"
                                onChange={(e) => setEventTime(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="eventLocation" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Location
                            </label>
                            <Input
                                id="eventLocation"
                                type="text"
                                placeholder="Enter location"
                                onChange={(e) => setEventLocation(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </EditContainer>
            </div>
        </div>
    );
}