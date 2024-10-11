'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Calendar from '@/components/Calendar';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import { useAuth } from '@/hooks/authHooks';
import { fetchWithAuth } from '@/utils/api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

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
    const { token, userId, error: authError } = useAuth();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/${params.id}`, {
                    method: 'GET'
                });
                const startTime = new Date(response.startTime);
                const endTime = new Date(response.endTime);
                setEventData({
                    ...response,
                    startTime: formatDateTimeForInput(startTime),
                    endTime: formatDateTimeForInput(endTime)
                });
                setSelectedDate(startTime);
            } catch (error) {
                // console.error('Failed to fetch event:', error);
                setError('Failed to load event data');
            }
        };

        fetchEvent();
    }, [params.id, token]);

    const formatDateTimeForInput = (date: Date) => {
        // 한국 시간을 포맷팅 (YYYY-MM-DDTHH:mm)으로 변환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const toKoreanTime = (date: Date) => {
        const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
        const koreanOffset = 9 * 60 * 60 * 1000; // 한국 UTC+9 시간대
        return new Date(utc + koreanOffset);
    };

    const handleDateSelect = (date: Date) => {
        const adjustedDate = toKoreanTime(date); // 선택한 날짜를 한국 시간으로 변환

        setSelectedDate(adjustedDate);
        setEventData(prev => ({
            ...prev,
            startTime: formatDateTimeForInput(adjustedDate),
            endTime: formatDateTimeForInput(new Date(adjustedDate.getTime() + 60 * 60 * 1000)) // 기본 1시간 설정
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;

        if (id === 'startTime') {
            // 입력된 startTime을 UTC에서 KST로 변환
            const newStartTime = toKoreanTime(new Date(value));
            // newStartTime보다 한 시간 뒤로 endTime 설정
            const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000); // 1시간 후

            setEventData(prev => ({
                ...prev,
                startTime: formatDateTimeForInput(newStartTime), // 시작 시간 한국 시간으로 설정
                endTime: formatDateTimeForInput(newEndTime),    // 종료 시간 한국 시간 기준 1시간 뒤로 설정
            }));
        } else {
            setEventData(prev => ({ ...prev, [id]: value }));
        }
    };


    const handleUpdateEvent = async () => {
        setIsLoading(true);
        setError('');
        try {
            const updatedEventData = {
                ...eventData,
            };
            await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/${params.id}`, {
                method: 'PUT',
                body: updatedEventData
            });
            router.push('/home');
        } catch (error) {
            // .error('Failed to update event:', error);
            setError('Failed to update event');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToMain = () => {
        router.push('/home');
    }

    if (token == null) {
        return <div>Loading...</div>;
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