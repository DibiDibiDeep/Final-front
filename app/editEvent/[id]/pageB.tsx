'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Calendar from '@/app/calendar/Calendar';
import EditContainer from '@/components/EditContainer';
import Input from '@/components/Input';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

export default function EditEvent({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [eventData, setEventData] = useState({ title: '', description: '', date: '', location: '' });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`${BACKEND_API_URL}/api/calendars/${params.id}`);
                const fetchedDate = parseDate(response.data.date); // Parse date from MM-DD to Date
                setEventData({
                    ...response.data,
                    date: formatDate(fetchedDate)
                });
                setSelectedDate(fetchedDate);
            } catch (error) {
                console.error('Failed to fetch event:', error);
                setError('Failed to load event data');
            }
        };

        fetchEvent();
    }, [params.id]);

    const parseDate = (dateStr: string) => {
        const [month, day] = dateStr.split('-').map(Number);
        const year = new Date().getFullYear(); // Use current year or adjust as needed
        return new Date(year, month - 1, day);
    };

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setEventData(prev => ({ ...prev, date: formatDate(date) }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEventData(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdateEvent = async () => {
        setIsLoading(true);
        setError('');
        try {
            const formattedDate = eventData.date.replace('.', '-'); // Convert MM.DD to MM-DD
            await axios.put(`${BACKEND_API_URL}/api/calendars/${params.id}`, {
                ...eventData,
                date: formattedDate
            });
            router.push('/home');
        } catch (error) {
            console.error('Failed to update event:', error);
            setError('Failed to update event');
        } finally {
            setIsLoading(false);
        }
    };

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
                                type="text"
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
