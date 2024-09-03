'use client';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';
import Calendar from '../calendar/Calendar'

export default function EditPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
    }
    const router = useRouter();
    const handleGoToMain = () => {
        router.push('/home');
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
                    <div className="flex flex-col space-y-5 pt-[26px]">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="eventName" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Event Name
                            </label>
                            <Input
                                id="eventName"
                                type="text"
                                placeholder="Enter event name"
                                onChange={(e) => console.log(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="eventDate" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                Date
                            </label>
                            <Input
                                id="eventDate"
                                type="string"
                                value={selectedDate ? selectedDate.toLocaleDateString() : new Date().toLocaleDateString()}
                                onChange={(e) => console.log(e.target.value)}
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
                                onChange={(e) => console.log(e.target.value)}
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
                                onChange={(e) => console.log(e.target.value)}
                                className='text-gray-700'
                            />
                        </div>
                    </div>
                </EditContainer>
            </div>
        </div>
    )
}