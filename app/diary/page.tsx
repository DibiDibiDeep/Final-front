'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Calendar } from 'lucide-react';
import CreateDiaryModal from '../modal/CreateDiaryModal';
import DiaryDetailModal from '../modal/DiaryDetailModal';
import axios from 'axios';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/useAuth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface CreateDiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateDiary: (content: string) => Promise<void>;
    selectedDate: string;
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

const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getFormattedDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // YYYY-MM-DDTHH:MM:SS
};

const getKoreanISOString = (date: Date): string => {
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return koreanDate.toISOString().slice(0, 19);
};

const Card: React.FC<DiaryEntry & { onClick: () => void; onDelete: () => void }> = ({ date, content, alimId, onClick, onDelete }) => {
    const dateObj = new Date(date);
    const formattedDate = `${dateObj.getFullYear()}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getDate().toString().padStart(2, '0')}`;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();  // 이벤트 버블링 방지
        onClick();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();  // 이벤트 버블링 방지
        onDelete();
    };

    return (
        <div className="bg-white/70 shadow-md rounded-lg p-4 cursor-pointer mx-4 relative" onClick={handleClick}>
            <h2 className="font-bold text-lg mb-2">{formattedDate}</h2>
            <p>{content?.length > 100 ? `${content.substring(0, 100)}...` : content}</p>
            <button
                onClick={handleDelete}
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
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(new Date()));
    const [isEntryExistForSelectedDate, setIsEntryExistForSelectedDate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token, userId, error: authError } = useAuth();
    const { babyId } = useBabySelection();

    useEffect(() => {
        if (!token) return;
        console.log('chatbot page token: ', token);
        console.log('chatbot page userId: ', userId);
        console.log('chatbot page babyId:', babyId);
    }, [token]);

    useEffect(() => {
        if (userId) {
            console.log('userId', userId);
            fetchUserDiaries(userId);
        } else {
            console.error('User ID not found');
        }
    }, [userId]);

    useEffect(() => {
        const entryExistsForDate = entries.some(entry => entry.date.startsWith(selectedDate));
        setIsEntryExistForSelectedDate(entryExistsForDate);
    }, [selectedDate, entries]);

    useEffect(() => {
        console.log('selectedEntry updated:', selectedEntry);  // 디버깅을 위한 로그 추가
    }, [selectedEntry]);

    const fetchUserDiaries = async (userIdParam: number) => {
        if (!token || !userId || !babyId) {
            console.error('Token or User ID or Baby ID is not available');
            return;
        }

        try {

            const start = getKoreanISOString(new Date(0)); // 1970년 1월 1일 00:00:00 (한국 시간)
            const end = getKoreanISOString(new Date()); // 현재 날짜와 시간 (한국 시간)

            const url = new URL(`${BACKEND_API_URL}/api/alims/user/${userIdParam}`);
            url.searchParams.append('start', start);
            url.searchParams.append('end', end);
            console.log('Request URL:', url.toString()); // URL 확인을 위한 로그

            const response = await fetchWithAuth(
                url.toString(),
                token,
                {
                    method: 'GET',
                    timeout: 10000, // 10초 타임아웃 설정 (필요에 따라 조정 가능)
                }
            );


            console.log('Fetched diaries:', response);

            const allEntries = response.map((entry: any) => ({
                date: entry.date.split('T')[0], // 날짜 부분만 사용
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
        if (!token || !userId || !babyId) {
            console.error('User ID or Baby ID is not available');
            return;
        }

        const formattedDate = getFormattedDateTime(selectedDate);
        console.log('formattedDate', formattedDate);

        const newNoticeData: NoticeData = {
            alimId: null,
            userId: userId,
            babyId: babyId,
            content: content,
            date: formattedDate,
        };

        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/alims`, token, {
                method: 'POST',
                body: newNoticeData
            });

            console.log('Server response:', response);

            if (response && response.alimId) {
                await fetchUserDiaries(userId);
                setIsModalOpen(false);
            } else {
                console.error('Invalid server response:', response);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to create diary entry:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response:', error.response);
            }
        }
    };

    const handleDeleteDiary = async (alimId: number) => {
        if (!token || !userId || !babyId) {
            console.error('User ID or Baby ID is not available');
            return;
        }
        try {
            await fetchWithAuth(`${BACKEND_API_URL}/api/alims/${alimId}`, token, {
                method: 'DELETE'
            });

            setEntries(prevEntries => prevEntries.filter(entry => entry.alimId !== alimId));
            if (entries.length === 1) {
                localStorage.removeItem('diaryData');
            }
        } catch (error) {
            console.error('Failed to delete diary entry:', error);
        }
        window.location.reload();
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    const addEntry = () => {
        if (!isEntryExistForSelectedDate) {
            setIsModalOpen(true);
        }
    };

    const openDetailModal = (entry: DiaryEntry) => {
        console.log('Opening detail modal with entry:', entry);  // 디버깅을 위한 로그 추가
        setSelectedEntry(entry);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <div className="flex-grow flex flex-col justify-start items-center pt-8">
                <div className="w-full space-y-8 text-gray-700 overflow-y-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="max-w-[180px] bg-white/70 rounded-full"
                            startContent={<Calendar className="text-default-400 pointer-events-none flex-shrink-0" />}
                        />
                        <Button
                            onClick={addEntry}
                            className={`${isEntryExistForSelectedDate ? 'bg-gray-300 text-gray-500' : 'bg-purple-100 hover:bg-purple-200 text-purple-600'} rounded-full`}
                            disabled={isEntryExistForSelectedDate}
                        >
                            <Plus size={24} />
                            새 다이어리 추가
                        </Button>
                    </div>
                    {entries.length === 0 ? (
                        <p className="text-xl text-white text-center mt-8">알림장이 없습니다.</p>
                    ) : (
                        <div className="space-y-4 mt-8">
                            {entries.map((entry, index) => (
                                <Card
                                    key={index}
                                    date={entry.date}
                                    content={entry.content}
                                    alimId={entry.alimId}
                                    onClick={() => {
                                        console.log('Card clicked:', entry);  // 디버깅을 위한 로그 추가
                                        openDetailModal(entry);
                                    }}
                                    onDelete={() => handleDeleteDiary(entry.alimId)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <CreateDiaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateDiary={handleCreateDiary}
                selectedDate={selectedDate}
            />
            <DiaryDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedEntry(null);  // 모달을 닫을 때 selectedEntry 초기화
                }}
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
                    date: selectedEntry?.date ?? ''
                }}
            />
        </div>
    );
}