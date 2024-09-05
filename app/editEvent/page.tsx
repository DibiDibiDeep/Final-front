'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import Calendar from '../calendar/Calendar';
import axios from 'axios';

interface EventData {
    id?: number;
    title: string;
    description: string;
    date: string;
    location: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

export default function EditPage() {
    const [eventData, setEventData] = useState<EventData>({
        title: '',
        description: '',
        date: '',
        location: ''
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams ? searchParams.get('id') : null;

    useEffect(() => {
        if (eventId) {
            fetchEventData(eventId);
        } else {
            // eventId가 없는 경우 홈으로 리다이렉트
            router.push('/home');
        }
    }, [eventId, router]);

    const fetchEventData = async (id: string) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/api/calendars/${id}`);
            const fetchedEvent = response.data;
            setEventData(fetchedEvent);
            setSelectedDate(new Date(fetchedEvent.date));
        } catch (error) {
            console.error('Error fetching event data:', error);
            setError('이벤트 데이터를 불러오는 데 실패했습니다.');
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setEventData(prev => ({ ...prev, date: date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEventData(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdateEvent = async () => {
        if (!eventId) {
            setError('이벤트 ID가 없습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await axios.put(`/api/events/${eventId}`, eventData);
            router.push('/home');
        } catch (error) {
            console.error('Error updating event data:', error);
            setError('이벤트 데이터 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!eventId) {
        return null; // 또는 로딩 인디케이터
    }

    return (
        <div>
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
                                Event Name
                            </label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Enter event name"
                                value={eventData.title}
                                onChange={handleInputChange}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Description
                            </label>
                            <Input
                                id="description"
                                type="textarea"
                                placeholder="Enter event description"
                                value={eventData.description}
                                onChange={handleInputChange}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="date" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Date
                            </label>
                            <Input
                                id="date"
                                type="text"
                                value={eventData.date}
                                readOnly
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="location" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Location
                            </label>
                            <Input
                                id="location"
                                type="text"
                                placeholder="Enter location"
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