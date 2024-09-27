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

// activities, special이 Null이면 동화 생성 불가
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

const getFormattedDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // YYYY-MM-DDTHH:MM:SS
};

const convertToKoreanDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return koreanDate.toISOString().slice(0, 19).replace('Z', '');
};

const getKoreanISOString = (date: Date): string => {
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return koreanDate.toISOString().slice(0, 19);
};


const Card: React.FC<DiaryEntry & { onClick: () => void; onDelete: () => void }> = ({ date, content, alimId, onClick, onDelete }) => (
    <div className="bg-white/70 shadow-md rounded-lg p-4 cursor-pointer mx-4 relative" onClick={onClick}>
        <h2 className="font-bold text-lg mb-2">{date}</h2>
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


export default function DiaryPage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [babyId, setBabyId] = useState<number | null>(null);
    const [diaryData, setDiaryData] = useState<DiaryData | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [noticeData, setNoticeData] = useState<NoticeData>({
        alimId: null,
        userId: 0,
        babyId: 0,
        content: '',
        date: ''
    });

    const todayEntry = useMemo(() => {
        const today = new Date().toLocaleDateString('ko-KR');
        return entries.find(entry => entry.date === today);
    }, [entries]);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            const parsedUserId = parseInt(storedUserId, 10);
            setUserId(parsedUserId);
            fetchUserDiaries(parsedUserId);
        } else {
            console.error('User ID not found in localStorage');
        }

        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        if (storedSelectedBaby) {
            const selectedBaby = JSON.parse(storedSelectedBaby);
            if (selectedBaby != null) {
                setBabyId(selectedBaby.babyId);
            }
        }
    }, []);

    const fetchUserDiaries = async (userIdParam: number) => {
        try {
            const start = getKoreanISOString(new Date(0)); // 1970년 1월 1일 00:00:00 (한국 시간)
            const end = getKoreanISOString(new Date()); // 현재 날짜와 시간 (한국 시간)

            const response = await axios.get(`${BACKEND_API_URL}/api/alims/user/${userIdParam}`, {
                params: {
                    start: start,
                    end: end
                }
            });

            console.log('Fetched diaries:', response.data);

            const allEntries = response.data.map((entry: any) => ({
                date: new Date(entry.date).toLocaleDateString('ko-KR'),
                content: entry.content,
                alimId: entry.alimId
            }));

            // 날짜순으로 정렬 (최신순)
            allEntries.sort((a: DiaryEntry, b: DiaryEntry) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setEntries(allEntries);
        } catch (error) {
            console.error('Failed to fetch user diaries:', error);
        }
    };

    const handleCreateDiary = async (content: string) => {
        const now = new Date();
        const formattedDate = getFormattedDateTime(now);

        if (!userId || !babyId) {
            console.error('User ID or Baby ID is not available');
            return;
        }

        const newNoticeData: NoticeData = {
            alimId: null,
            userId: userId,
            babyId: babyId,
            content: content,
            date: formattedDate,
        };

        try {
            const response = await axios.post(`${BACKEND_API_URL}/api/alims`, newNoticeData, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('Server response:', response.data);

            if (response.data && response.data.alimId) {
                await fetchUserDiaries(userId);
                setIsModalOpen(false);
            } else {
                console.error('Invalid server response:', response.data);
            }

            setNoticeData({
                ...newNoticeData,
                alimId: response.data.alimId,
                date: formattedDate
            });

            setIsModalOpen(false);
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
            if (entries.length === 1) {
                setDiaryData(null);
                localStorage.removeItem('diaryData');
            }
        } catch (error) {
            console.error('Failed to delete diary entry:', error);
        }
    };

    const addEntry = () => {
        if (!todayEntry) {
            setIsModalOpen(true);
        }
    };

    const openDetailModal = (entry: DiaryEntry) => {
        setSelectedEntry(entry);
        setNoticeData({
            alimId: entry.alimId,
            userId: userId,
            babyId: babyId,
            content: entry.content,
            date: convertToKoreanDateTime(entry.date)
        });
        setIsDetailModalOpen(true);
    };

    const fetchDiaryData = async (alimId: number) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/api/alim-inf/alim-id/${alimId}`);
            setDiaryData(response.data);
        } catch (error) {
            console.error('Failed to fetch diary data:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <div className="flex-grow flex flex-col justify-center items-center">
                <div className="w-full space-y-4 text-gray-700 overflow-y-auto">
                    <div className="flex justify-center mb-4">
                        <button
                            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors duration-200 ${todayEntry
                                ? 'bg-gray-200 cursor-not-allowed'
                                : 'bg-purple-100 hover:bg-purple-200'
                                }`}
                            onClick={addEntry}
                            disabled={!!todayEntry}
                        >
                            <Plus size={24} className={todayEntry ? 'text-gray-500' : 'text-purple-600'} />
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
                    date: selectedEntry ? convertToKoreanDateTime(selectedEntry.date) : ''
                }}
            />
        </div>
    );
}