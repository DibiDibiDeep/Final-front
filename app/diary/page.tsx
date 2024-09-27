'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import CreateDiaryModal from '../modal/DiaryModal';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

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

    // 'YYYY-MM-DDTHH:mm:ss' 포맷으로 반환
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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


const DiaryDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; data: DiaryData | null }> = ({ isOpen, onClose, data }) => {
    const [fairyTale, setFairyTale] = useState<FairyTale | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [storageResult, setStorageResult] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    if (!isOpen || !data) return null;

    const getStringOrArrayAsString = (value: string | string[]): string => {
        if (typeof value === 'string') {
            return value;
        } else if (Array.isArray(value)) {
            return value.join(', ');
        }
        return '정보 없음';
    };

    const handleCreateFairyTale = async () => {
        if (!data.activities || !data.special) {
            setValidationError('활동 및 특이사항이 있어야 동화를 생성할 수 있습니다.');
            return;
        }

        setLoading(true);
        setError(null);
        setValidationError(null);

        try {
            const response = await axios.post<FairyTale>(`${BACKEND_API_URL}/api/books/generate_fairytale/${data.alimInfId}`, data);
            setFairyTale(response.data);
        } catch (err) {
            setError('동화를 생성하는 중 오류가 발생했습니다.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 max-w-sm w-full max-h-[60vh] overflow-y-auto relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-700">분석 결과</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-2 mb-12 text-gray-700">
                    <p><strong>이름:</strong> {data.name}</p>
                    <p><strong>감정:</strong> {data.emotion}</p>
                    <p><strong>건강:</strong> {data.health}</p>
                    <p><strong>영양:</strong> {data.nutrition}</p>
                    <p><strong>활동:</strong> {getStringOrArrayAsString(data.activities)}</p>
                    <p><strong>사회성:</strong> {data.social}</p>
                    <p><strong>특이사항:</strong> {data.special}</p>
                    <p><strong>키워드:</strong> {getStringOrArrayAsString(data.keywords)}</p>
                    <p><strong>일기:</strong> {data.diary}</p>
                </div>
                <div className="relative bottom-2 left-0 right-0 flex flex-col items-center">
                    <button
                        onClick={handleCreateFairyTale}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors duration-200"
                    >
                        동화 생성하기
                    </button>
                    {validationError && (
                        <p className="text-red-500 mt-2">{validationError}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function DiaryPage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [babyId, setBabyId] = useState<number | null>(null);
    const [diaryData, setDiaryData] = useState<DiaryData | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            const parsedUserId = parseInt(storedUserId, 10);
            setUserId(parsedUserId);
            fetchAllDiaries(parsedUserId);
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

    const fetchAllDiaries = async (userIdParam: number) => {
        try {
            // Set a very wide date range to fetch all entries
            const start = new Date(0).toISOString().split('T')[0] + 'T00:00:00'; // January 1, 1970
            const end = new Date().toISOString().split('T')[0] + 'T23:59:59'; // Current date

            const response = await axios.get(`${BACKEND_API_URL}/api/alims/user/${userIdParam}`, {
                params: {
                    start: start,
                    end: end
                }
            });

            console.log('API Response:', response.data); // 디버깅을 위한 로그

            const allEntries = response.data.map((entry: any) => ({
                date: new Date(entry.date).toLocaleDateString('ko-KR'),
                content: entry.content,
                alimId: entry.alimId
            }));

            // Sort entries by date, most recent first
            allEntries.sort((a: DiaryEntry, b: DiaryEntry) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setEntries(allEntries);
        } catch (error) {
            console.error('Failed to fetch diaries:', error);
        }
    };

    const handleCreateDiary = async (content: string) => {
        if (!userId || !babyId) {
            console.error('User ID or Baby ID is not available');
            return;
        }

        const now = new Date();
        const formattedDate = getFormattedDateTime(now);

        const noticeData = {
            alimId: null,
            userId,
            babyId,
            content,
            date: formattedDate,
        };

        try {
            const response = await axios.post(`${BACKEND_API_URL}/api/alims`, noticeData, {
                headers: { 'Content-Type': 'application/json' }
            });

            const infResponse = await axios.get(`${BACKEND_API_URL}/api/alim-inf/alim-id/${response.data.alimId}`);

            const newEntry = {
                date: now.toLocaleDateString('ko-KR'),
                content: infResponse.data.diary,
                alimId: response.data.alimId
            };

            setEntries(prevEntries => [newEntry, ...prevEntries]);
            setDiaryData(infResponse.data);
            localStorage.setItem('diaryData', JSON.stringify(infResponse.data));

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
        setIsModalOpen(true);
    };

    const openDetailModal = (alimId: number) => {
        // Fetch the specific diary data and set it to diaryData
        fetchDiaryData(alimId);
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
        <div className="max-w-md mx-auto">
            <div className="mb-[20px] p-4 flex justify-center items-center">
                <button
                    className="flex items-center justify-center w-10 h-7 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                    onClick={addEntry}
                >
                    <Plus size={24} className="text-purple-600" />
                </button>
            </div>
            {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[812px]">
                    <p className="text-xl text-white mb-4">알림장이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4 text-gray-700">
                    {entries.map((entry, index) => (
                        <Card
                            key={index}
                            date={entry.date}
                            content={entry.content}
                            alimId={entry.alimId}
                            onClick={() => openDetailModal(entry.alimId)}
                            onDelete={() => handleDeleteDiary(entry.alimId)}
                        />
                    ))}
                </div>
            )}
            <CreateDiaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateDiary={handleCreateDiary}
            />
            <DiaryDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                data={diaryData}
            />
        </div>
    );
}