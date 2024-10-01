'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import CreateDiaryModal from '../modal/CreateDiaryModal';
import DiaryDetailModal from '../modal/DiaryDetailModal';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface CreateDiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateDiary: (content: string) => Promise<void>;
}

interface NoticeData {
    alimId: number | null;
    userId: number | null;
    babyId: number | null;
    content: string;
    date: string;
}

interface DiaryEntry {
    date: string;
    content: string;
    alimId: number;
}

interface DiaryData {
    alimInfId: number;
    name: string;
    emotion: string;
    health: string;
    nutrition: string;
    activities: string[] | string;
    social: string;
    special: string;
    keywords: string[] | string;
    diary: string;
    user_id: number;
    baby_id: number;
    role: string;
}

interface FairyTale {
    title: string;
    pages: {
        text: string;
        image_url: string;
    }[];
}

const getFormattedDateString = (date: Date): string => {
    return date.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss" 형식으로 변환
};

const convertToKoreanTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

const Card: React.FC<DiaryEntry & { onClick: () => void; onDelete: () => void }> = ({ date, content, alimId, onClick, onDelete }) => {
    const koreanDate = convertToKoreanTime(date);
    const formattedDate = koreanDate.split(' ')[0]; // 날짜만 추출

    return (
        <div className="bg-white/70 shadow-md rounded-lg p-4 cursor-pointer mx-4 relative" onClick={onClick}>
            <h2 className="font-bold text-lg mb-2">{formattedDate}</h2>
            <p>{content?.length > 100 ? `${content.substring(0, 100)}...` : content}</p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default function DiaryPage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [babyId, setBabyId] = useState<number | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedSelectedBaby = localStorage.getItem('selectedBaby');

        if (storedUserId) {
            const parsedUserId = parseInt(storedUserId, 10);
            setUserId(parsedUserId);
            fetchUserDiaries(parsedUserId);
        } else {
            console.error('User ID not found in localStorage');
        }

        if (storedSelectedBaby) {
            const selectedBaby = JSON.parse(storedSelectedBaby);
            if (selectedBaby != null) {
                setBabyId(selectedBaby.babyId);
            }
        }
    }, []);

    const fetchUserDiaries = async (userIdParam: number) => {
        try {
            const start = getFormattedDateString(new Date(0));
            const end = getFormattedDateString(new Date());

            console.log(`Fetching diaries for user ${userIdParam} from ${start} to ${end}`);

            const response = await axios.get(`${BACKEND_API_URL}/api/alims/user/${userIdParam}`, {
                params: { start, end }
            });

            console.log('Fetched diaries:', response.data);

            const allEntries = response.data.map((entry: any) => ({
                date: entry.date,
                content: entry.content,
                alimId: entry.alimId
            }));

            allEntries.sort((a: DiaryEntry, b: DiaryEntry) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setEntries(allEntries);
        } catch (error) {
            console.error('Failed to fetch user diaries:', error);
        }
    };

    const handleCreateDiary = async (content: string) => {
        if (!userId || !babyId) {
            console.error('User ID or Baby ID is not available');
            return;
        }

        const now = new Date();
        const formattedDate = getFormattedDateString(now);

        const newNoticeData = {
            userId: userId,
            babyId: babyId,
            content: content,
            date: formattedDate,
        };

        console.log('Attempting to create new diary entry:', newNoticeData);

        try {
            const response = await axios.post(`${BACKEND_API_URL}/api/alims`, newNoticeData, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('Server response:', response.data);

            if (response.data && response.data.alimId) {
                const newEntry: DiaryEntry = {
                    date: formattedDate,
                    content: content,
                    alimId: response.data.alimId
                };
                setEntries(prevEntries => {
                    const updatedEntries = [newEntry, ...prevEntries];
                    console.log('Updated entries:', updatedEntries);
                    return updatedEntries;
                });
                setIsModalOpen(false);
            } else {
                console.error('Invalid server response:', response.data);
            }
        } catch (error) {
            console.error('Failed to create diary entry:', error);
        }
    };

    const handleDeleteDiary = async (alimId: number) => {
        try {
            await axios.delete(`${BACKEND_API_URL}/api/alims/${alimId}`, {
                headers: { 'Content-Type': 'application/json' }
            });

            setEntries(prevEntries => prevEntries.filter(entry => entry.alimId !== alimId));
        } catch (error) {
            console.error('Failed to delete diary entry:', error);
        }
    };

    const addEntry = () => {
        const today = new Date();
        const todayFormatted = getFormattedDateString(today).split('T')[0];
        const todayEntry = entries.find(entry => entry.date.startsWith(todayFormatted));

        console.log('Current entries:', entries);
        console.log('Today formatted:', todayFormatted);
        console.log('Today entry:', todayEntry);

        if (!todayEntry) {
            setIsModalOpen(true);
        } else {
            console.log('Entry for today already exists');
        }
    };

    const openDetailModal = (entry: DiaryEntry) => {
        setSelectedEntry(entry);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <div className="flex-grow flex flex-col justify-center items-center">
                <div className="w-full space-y-4 text-gray-700 overflow-y-auto">
                    <div className="flex justify-center mb-4">
                        <button
                            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors duration-200 ${
                                entries.some(entry => entry.date.startsWith(getFormattedDateString(new Date()).split('T')[0]))
                                    ? 'bg-gray-200 cursor-not-allowed'
                                    : 'bg-purple-100 hover:bg-purple-200'
                            }`}
                            onClick={addEntry}
                            disabled={entries.some(entry => entry.date.startsWith(getFormattedDateString(new Date()).split('T')[0]))}
                        >
                            <Plus size={24} className={entries.some(entry => entry.date.startsWith(getFormattedDateString(new Date()).split('T')[0])) ? 'text-gray-500' : 'text-purple-600'} />
                        </button>
                    </div>
                    {entries.length === 0 ? (
                        <p className="text-xl text-white text-center">알림장이 없습니다.</p>
                    ) : (
                        entries.map((entry, index) => (
                            <Card
                                key={index}
                                date={entry.date}
                                content={entry.content}
                                alimId={entry.alimId}
                                onClick={() => openDetailModal(entry)}
                                onDelete={() => handleDeleteDiary(entry.alimId)}
                            />
                        ))
                    )}
                </div>
            </div>
            <CreateDiaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateDiary={handleCreateDiary}
            />
            <DiaryDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                data={selectedEntry}
                updateEntries={(updatedEntry) => {
                    setEntries(prevEntries =>
                        prevEntries.map(entry =>
                            entry.alimId === updatedEntry.alimId ? updatedEntry : entry
                        )
                    );
                }}
                noticeData={{
                    alimId: selectedEntry?.alimId ?? null,
                    userId: userId,
                    babyId: babyId,
                    content: selectedEntry?.content ?? '',
                    date: selectedEntry ? selectedEntry.date : ''
                }}
            />
        </div>
    );
}