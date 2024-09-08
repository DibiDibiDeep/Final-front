'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import Calendar from '../calendar/Calendar';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

export default function AddPage() {
    const initialDate = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [selectedBabyId, setSelectedBabyId] = useState<number | null>(null);
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
    const [title, setTitle] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    // 시간 형식을 MySQL TIME 타입에 맞게 변환하는 함수
    const convertToMySQLTime = (time: string): string => {
        return time ? `${time}:00` : ''; // 시간이 제공되지 않은 경우 빈 문자열이 전송 → 백에서 빈 문자열을 NULL로 처리하거나, 기본값을 설정하는 등의 설정 필요 (프론트에서 기본값 설정되어있어 문제 없을 듯)
    };

    const handleGoToMain = () => {
        router.push('/home');
    }

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        const eventData = {
            user_id: 1, // 현재 로그인한 사용자의 ID
            baby_id: selectedBabyId,
            calendar_photo_id: selectedPhotoId,
            title,
            description,
            date: selectedDate,
            start_time: convertToMySQLTime(startTime),
            end_time: convertToMySQLTime(endTime),
            location,
        };

        try {
            const response = await axios.post(`${BACKEND_API_URL}/api/calendars`, eventData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(response.data);
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
                    onClick={handleSubmit}
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
                    <div className="flex flex-col space-y-4 pt-[5px] justify-center">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                제목
                            </label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="이벤트 제목을 입력해주세요."
                                onChange={(e) => setTitle(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="date" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                날짜
                            </label>
                            <Input
                                id="date"
                                type="text"
                                value={selectedDate.toLocaleDateString("ko-KR")}
                                readOnly
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="startTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                시작 시간
                            </label>
                            <Input
                                id="startTime"
                                type="time"
                                onChange={(e) => setStartTime(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="endTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                종료 시간
                            </label>
                            <Input
                                id="endTime"
                                type="time"
                                onChange={(e) => setEndTime(e.target.value)}
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
                                onChange={(e) => setLocation(e.target.value)}
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