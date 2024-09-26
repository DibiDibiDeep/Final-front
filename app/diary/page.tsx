'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import CreateDiaryModal from '../modal/DiaryModal';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface DiaryEntry {
    date: string;
    content: string;
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


const Card: React.FC<DiaryEntry & { onClick: () => void; onDelete: () => void }> = ({ date, content, onClick, onDelete }) => (
    <div className="bg-white/70 shadow-md rounded-lg p-4 cursor-pointer mx-4 relative" onClick={onClick}>
        <h2 className="font-bold text-lg mb-2">{date}</h2>
        <p>{content?.length > 100 ? `${content.substring(0, 100)}...` : content}</p>
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

    // 문자열 또는 문자열 배열을 처리하는 범용 함수
    const getStringOrArrayAsString = (value: string | string[]): string => {
        if (typeof value === 'string') {
            return value;
        } else if (Array.isArray(value)) {
            return value.join(', ');
        }
        return '정보 없음';
    };

    const handleCreateFairyTale = async () => {
        setLoading(true);
        setError(null);
        try {
            // 동화 생성
            const response = await axios.post<FairyTale>(`${BACKEND_API_URL}/api/books/generate_fairytale/${data.alimInfId}`, data);
            setFairyTale(response.data);

            // 생성된 동화 저장
            const storageResponse = await axios.post(`${BACKEND_API_URL}/api/books/process_book`, response.data);
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
                <div className="relative bottom-2 left-0 right-0 flex justify-center">
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
            setUserId(parseInt(storedUserId, 10));
        }

        // localStorage에서 선택된 아이 가져오기
        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        if (storedSelectedBaby) {
            const selectedBaby = JSON.parse(storedSelectedBaby);

            if (selectedBaby != null) {
                setBabyId(selectedBaby.babyId);
                console.log("selectedBaby", selectedBaby);
            } else {
                console.log("No baby information found.");
            }
        } else {
            console.log("No stored baby information found.");
        }

        const storedDiaryData = localStorage.getItem('diaryData');
        if (storedDiaryData) {
            const parsedData = JSON.parse(storedDiaryData);
            setDiaryData(parsedData);
            setEntries([{ date: new Date().toLocaleDateString(), content: parsedData.diary }]);
        }
    }, []);

    const handleCreateDiary = async (content: string) => {
        if (!userId || !babyId) {
            console.error('User ID or Baby ID is not available');
            return;
        }

        // Get the current time and format it for the backend.
        const now = new Date();
        const formattedDate = getFormattedDateTime(now);

        // Prepare the noticeData to include babyId, userId, and content.
        const noticeData = {
            alimId: null, // 새로운 Alim 생성이므로 null
            userId,
            babyId,
            content,
            date: formattedDate,
        };

        console.log(JSON.stringify(noticeData));

        try {
            // Send the request to the backend with the correct data.
            const response = await axios.post(`${BACKEND_API_URL}/api/alims`, noticeData, {
                headers: { 'Content-Type': 'application/json' }
            });

            // Store the response in local storage and update state.
            // localStorage.setItem('diaryData', JSON.stringify(response.data));
            // console.log("알림장", JSON.stringify(response.data));
            // setDiaryData(response.data);

            const infResponse = await axios.get(`${BACKEND_API_URL}/api/alim-inf/alim-id/${response.data.alimId}`);


            setEntries([{ date: now.toLocaleDateString('ko-KR'), content: infResponse.data.diary }]);
            setDiaryData(infResponse.data);
            localStorage.setItem('diaryData', JSON.stringify(infResponse.data));


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
