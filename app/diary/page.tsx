'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import CreateDiaryModal from '../modal/DiaryModal';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface DiaryEntry {
    date: string;
    content: string;
}

interface DiaryData {
    name: string;
    emotion: string;
    health: string;
    nutrition: string;
    activities: string[];
    social: string;
    special: string;
    keywords: string[];
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

const Card: React.FC<DiaryEntry & { onClick: () => void; onDelete: () => void }> = ({ date, content, onClick, onDelete }) => (
    <div className="bg-white/70 shadow-md rounded-lg p-4 cursor-pointer mx-4 relative" onClick={onClick}>
        <h2 className="font-bold text-lg mb-2">{date}</h2>
        <p>{content.length > 100 ? `${content.substring(0, 100)}...` : content}</p>
        <button
            onClick={(e) => {
                e.stopPropagation(); // Stop the onClick event from propagating to the parent
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

    if (!isOpen || !data) return null;

    const handleCreateFairyTale = async () => {
        try {
            // 동화 생성
            const response = await axios.post<FairyTale>('http://localhost:8000/generate_fairytale', data);
            setFairyTale(response.data);

            // 생성된 동화 저장
            const storageResponse = await axios.post('/api/store_fairytale', response.data);
            setStorageResult(`동화가 성공적으로 저장되었습니다. Book ID: ${storageResponse.data.bookId}`);
        } catch (err) {
            setError('동화를 생성하거나 저장하는 중 오류가 발생했습니다.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">분석 결과</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-2 mb-16 text-gray-700">
                    <p><strong>이름:</strong> {data.name}</p>
                    <p><strong>감정:</strong> {data.emotion}</p>
                    <p><strong>건강:</strong> {data.health}</p>
                    <p><strong>영양:</strong> {data.nutrition}</p>
                    <p><strong>활동:</strong> {data.activities.join(', ')}</p>
                    <p><strong>사회성:</strong> {data.social}</p>
                    <p><strong>특이사항:</strong> {data.special}</p>
                    <p><strong>키워드:</strong> {data.keywords.join(', ')}</p>
                    <p><strong>일기:</strong> {data.diary}</p>
                </div>
                <div className="relative bottom-6 left-0 right-0 flex justify-center">
                    <button
                        onClick={handleCreateFairyTale}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors duration-200"
                    >
                        동화 생성하기
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function Home() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [diaryData, setDiaryData] = useState<DiaryData | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }

        const storedDiaryData = localStorage.getItem('diaryData');
        if (storedDiaryData) {
            const parsedData = JSON.parse(storedDiaryData);
            setDiaryData(parsedData);
            setEntries([{ date: new Date().toLocaleDateString(), content: parsedData.diary }]);
        }
    }, []);

    const handleCreateDiary = async (content: string) => {
        if (!userId) {
            console.error('User ID is not available');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/generate_diary', {
                user_id: userId,
                baby_id: 1, // 더미 값
                report: content,
            });

            console.log(response.data);

            localStorage.setItem('diaryData', JSON.stringify(response.data));
            setDiaryData(response.data);
            setEntries([{ date: new Date().toLocaleDateString(), content: response.data.diary }]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to create diary entry:', error);
        }
    };

    const handleDeleteDiary = async () => {
        if (!userId) {
            console.error('User ID is not available');
            return;
        }

        try {
            // 백엔드로 일기 삭제 요청 보내기 (ID 기반으로)
            // await axios.delete(`${BACKEND_API_URL}/api/alims/${userId}`, { // userId 수정 필요
            //     headers: { 'Content-Type': 'application/json' }
            // });

            // 상태 업데이트: 프론트엔드에서 일기 항목 삭제
            setEntries([]);
            setDiaryData(null);
            localStorage.removeItem('diaryData');
        } catch (error) {
            console.error('Failed to delete diary entry:', error);
        }
    };

    const addEntry = () => {
        setIsModalOpen(true);
    };

    const openDetailModal = () => {
        setIsDetailModalOpen(true);
    };

    return (
        <div className="max-w-md mx-auto">
            {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[812px]">
                    <p className="text-xl text-white mb-4">금일 알림장을 올려주세요.</p>
                    <div className="mb-[20px] p-4 flex justify-center items-center">
                        <button
                            className="flex items-center justify-center w-10 h-7 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                            onClick={addEntry}
                        >
                            <Plus size={24} className="text-purple-600" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-[20px] p-4 flex justify-center items-center">
                        <button
                            className="flex items-center justify-center w-10 h-7 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                            onClick={addEntry}
                        >
                            <Plus size={24} className="text-purple-600" />
                        </button>
                    </div>
                    <div className="space-y-4 text-gray-700">
                        {entries.map((entry, index) => (
                            <Card
                                key={index}
                                date={entry.date}
                                content={entry.content}
                                onClick={openDetailModal}
                                onDelete={handleDeleteDiary} // 삭제 기능 연결
                            />
                        ))}
                    </div>
                </>
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
