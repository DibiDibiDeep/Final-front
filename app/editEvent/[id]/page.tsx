'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Calendar from '@/app/calendar/Calendar';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface EventData {
    title: string;
    startTime: string;
    endTime: string;
    location: string;
}

export default function EditEvent({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [eventData, setEventData] = useState<EventData>({
        title: '',
        startTime: '',
        endTime: '',
        location: '',
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`${BACKEND_API_URL}/api/calendars/${params.id}`);
                const startTime = new Date(response.data.startTime);
                const endTime = new Date(response.data.endTime);
                setEventData({
                    ...response.data,
                    startTime: formatDateTimeForInput(startTime),
                    endTime: formatDateTimeForInput(endTime)
                });
                setSelectedDate(startTime);
            } catch (error) {
                console.error('Failed to fetch event:', error);
                setError('Failed to load event data');
            }
        };

        fetchEvent();
    }, [params.id]);

    const formatDateTimeForInput = (date: Date) => {
        return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
    };

    const formatDateTimeForMySQL = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setEventData(prev => ({
            ...prev,
            startTime: formatDateTimeForInput(date),
            endTime: formatDateTimeForInput(new Date(date.getTime() + 60 * 60 * 1000)) // Default to 1 hour duration
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setEventData(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdateEvent = async () => {
        setIsLoading(true);
        setError('');
        try {
            const updatedEventData = {
                ...eventData,
            };
            await axios.put(`${BACKEND_API_URL}/api/calendars/${params.id}`, updatedEventData);
            router.push('/home');
        } catch (error) {
            console.error('Failed to update event:', error);
            setError('Failed to update event');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToMain = () => {
        router.push('/home');
    }

    return (
        <div>
            <div className="fixed top-[37px] left-[23px]">
                <button
                    className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center"
                    onClick={handleGoToMain}
                    disabled={isLoading}
                >
                    <Image
                        src="/img/button/back.png"
                        alt='Back'
                        width={50}
                        height={50}
                        className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-50' : ''}`}
                    />
                </button>
            </div>
            <div className="fixed top-[37px] right-[23px]">
                <button
                    className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center"
                    onClick={handleUpdateEvent}
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
                    <div className="flex flex-col space-y-4 pt-[5px]">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                제목
                            </label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="이벤트 제목을 입력해주세요."
                                value={eventData.title}
                                onChange={handleInputChange}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="startTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                시작 시간
                            </label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={eventData.startTime}
                                onChange={handleInputChange}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="endTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                종료 시간
                            </label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={eventData.endTime}
                                onChange={handleInputChange}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="location" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                위치
                            </label>
                            <Input
                                id="location"
                                type="text"
                                placeholder="위치를 입력해주세요."
                                value={eventData.location}
                                onChange={handleInputChange}
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