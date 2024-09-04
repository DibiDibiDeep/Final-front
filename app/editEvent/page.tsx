'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import Calendar from '../calendar/Calendar';
import axios from 'axios';

export default function EditPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventName, setEventName] = useState<string>('');
    const [eventLocation, setEventLocation] = useState<string>('');
    const [eventTime, setEventTime] = useState<string>('');
    const router = useRouter();

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleGoToMain = async () => {
        const eventData = {
            name: eventName,
            date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(), // ISO 8601 문자열로 변환
            time: eventTime,
            location: eventLocation,
        };

        try {
            const response = await axios.post('/api/todo', eventData);
            console.log(response.data.message);
            router.push('/home');
        } catch (error) {
            console.error('Error sending event data:', error);
        }
    };

    return (
        <div>
            <div className="fixed top-[37px] right-[23px]">
                <button
                    className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center"
                    onClick={handleGoToMain}
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
                </EditContainer>
            </div>
        </div>
    );
}
