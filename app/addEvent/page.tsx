'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import Calendar from '@/components/Calendar';
import { debounce } from 'lodash';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/authHooks';
import { useBottomContainer } from '@/contexts/BottomContainerContext';


const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Baby {
    userId: number;
    babyId: number;
}

export default function AddPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [title, setTitle] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { userId } = useAuth();
    const { babyId } = useBabySelection();
    const { setActiveView } = useBottomContainer();

    useEffect(() => {
        updateDateTimes(new Date());
    }, []);

    useEffect(() => {
        if (isLoading) {
            handleSubmitData();
        }
    }, [isLoading]);

    const getFormattedDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`; // YYYY-MM-DDTHH:mm
    };

    const updateDateTimes = (date: Date) => {
        const now = new Date();
        date.setHours(now.getHours(), now.getMinutes(), 0, 0);
        setStartTime(getFormattedDateTime(date));
        setEndTime(getFormattedDateTime(new Date(date.getTime() + 60 * 60 * 1000))); // 기본적으로 1시간 후로 설정
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        updateDateTimes(date);
    };

    const updateEndTime = (startDateTime: string, currentEndDateTime: string): string => {
        const start = new Date(startDateTime);
        const end = new Date(currentEndDateTime);
        const diff = end.getTime() - new Date(startTime).getTime(); // 기존 시작 시간과 종료 시간의 차이
        const newEnd = new Date(start.getTime() + diff);
        return getFormattedDateTime(newEnd);
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDateTime = e.target.value;
        setStartTime(newStartDateTime);
        setSelectedDate(new Date(newStartDateTime));
        setEndTime(updateEndTime(newStartDateTime, endTime));
        // console.log("startTime : " + newStartDateTime);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateTime = e.target.value;
        setEndTime(newDateTime);
        // console.log("endTime : " + newDateTime);
    };

    const handleGoToMain = () => {
        router.push('/home');
        setActiveView('home')
    }

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault(); // 이벤트 전파 방지
        if (!isLoading) {
            setIsLoading(true);
        }
    };

    const debouncedSubmit = debounce(handleSubmit, 300); // 일정 시간 내 중복 클릭 방지 (중복 제출 방지)

    const handleSubmitData = async () => {
        setError(null);

        const eventData = {
            userId,
            babyId,
            title,
            startTime,
            endTime,
            location,
        };

        // console.log("eventData", eventData);

        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendars`, {
                method: 'POST',
                body: eventData
            });


            // console.log(response);  // fetchWithAuth는 이미 response.json()을 수행했으므로 .data가 필요 없습니다
            router.push('/home');
        } catch (error) {
            // console.error('Error sending event data:', error);
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
                    className={`w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={debouncedSubmit}
                    disabled={isLoading}
                >
                    <Image
                        src="/img/button/confirm.png"
                        alt='Confirm'
                        width={50}
                        height={50}
                        className="max-w-full max-h-full object-contain"
                    />
                </button>
            </div>
            <div className="min-h-screen pt-[110px]">
                <div className="fixed top-[110px] left-0 right-0 z-10">
                    <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                </div>
                <EditContainer>
                    <div className="flex flex-col space-y-4 pt-[5px] justify-center">
                        <div className="flex items-center space-x-8">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20">
                                제목
                            </label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="이벤트 제목을 입력해주세요."
                                onChange={(e) => setTitle(e.target.value)}
                                className='text-gray-700 flex-1'
                            />
                        </div>
                        <div className="flex items-center space-x-8">
                            <label htmlFor="startTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20">
                                시작 시간
                            </label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                className='text-gray-700 flex-1'
                            />
                        </div>
                        <div className="flex items-center space-x-8">
                            <label htmlFor="endTime" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20">
                                종료 시간
                            </label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                className='text-gray-700 flex-1'
                            />
                        </div>
                        <div className="flex items-center space-x-8">
                            <label htmlFor="location" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20">
                                위치
                            </label>
                            <Input
                                id="location"
                                type="text"
                                placeholder="위치를 입력해주세요."
                                onChange={(e) => setLocation(e.target.value)}
                                className='text-gray-700 flex-1'
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </EditContainer>
            </div>
        </div>
    );
}