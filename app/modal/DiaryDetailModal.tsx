import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface DiaryEntry {
    date: string;
    content: string;
    alimId: number;
}

interface DiaryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DiaryEntry | null;
    updateEntries: (newEntry: DiaryEntry) => void;
    noticeData: NoticeData;
}

interface NoticeData {
    alimId: number | null;
    userId: number | null;
    babyId: number | null;
    content: string;
    date: string;
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

interface AlimData {
    alimId: number;
    content: string;
    date: string;
    userId: number;
    babyId: number;
}

interface FairyTale {
    title: string;
    pages: {
        text: string;
        image_url: string;
    }[];
}

const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({ isOpen, onClose, data, updateEntries, noticeData }) => {
    const [content, setContent] = useState('');
    const [diaryData, setDiaryData] = useState<DiaryData | null>(null);
    const [alimData, setAlimData] = useState<AlimData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fairyTale, setFairyTale] = useState<FairyTale | null>(null);
    const [fairyTaleGenerated, setFairyTaleGenerated] = useState<boolean>(false);

    useEffect(() => {
        if (data) {
            setContent(data.content);
            console.log("alimId", data.alimId);
            fetchDiaryData(data.alimId);
        }
    }, [data]);

    useEffect(() => {
        console.log("fairyTaleGenerated actual state:", fairyTaleGenerated);
    }, [fairyTaleGenerated]);


    const fetchDiaryData = async (alimId: number) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching diary data for alimId: ${alimId}`);
            let diaryResponse;
            try {
                diaryResponse = await axios.get(`${BACKEND_API_URL}/api/alim-inf/alim-id/${alimId}`);
            } catch (diaryError) {
                console.log('Failed to fetch diary data:', diaryError);
                diaryResponse = null;
            }

            if (diaryResponse && diaryResponse.data && typeof diaryResponse.data === 'object' && Object.keys(diaryResponse.data).length > 0) {
                console.log("Diary data exists and is valid");
                console.log('Diary API Response:', diaryResponse.data);
                setDiaryData(diaryResponse.data);
                setAlimData(null);
            } else {
                console.log("일기 데이터가 없거나 유효하지 않습니다. Alim 데이터를 가져옵니다.");
                let alimResponse;
                try {
                    alimResponse = await axios.get(`${BACKEND_API_URL}/api/alims/${alimId}`);
                } catch (alimError) {
                    console.log('Failed to fetch alim data:', alimError);
                    throw new Error("Alim 데이터를 가져오는 데 실패했습니다.");
                }

                if (alimResponse && alimResponse.data && typeof alimResponse.data === 'object' && Object.keys(alimResponse.data).length > 0) {
                    console.log("Alim data fetched successfully");
                    console.log('Alim API Response:', alimResponse.data);
                    setAlimData(alimResponse.data);
                    setDiaryData(null);
                } else {
                    throw new Error("유효한 Alim 데이터를 받지 못했습니다.");
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError('알림장 정보를 찾을 수 없습니다.');
                    console.log('알림장 정보를 찾을 수 없습니다.');
                } else {
                    setError(`데이터를 가져오는 데 실패했습니다. (${error.response?.status || '알 수 없는 오류'})`);
                }
            } else {
                setError('데이터를 가져오는 데 실패했습니다.');
            }
            setDiaryData(null);
            setAlimData(null);
        } finally {
            setLoading(false);
        }
        checkFairyTaleStatus(alimId);
    };

    const checkFairyTaleStatus = async (alimId: number) => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/api/books/fairytale-status/${alimId}`);
            console.log("checkFairyTaleStatus", response.data);
            const newStatus = response.data.status === "COMPLETED";
            setFairyTaleGenerated(newStatus);
            console.log("fairyTaleGenerated set to:", newStatus);
        } catch (error) {
            console.error('Failed to check fairy tale status:', error);
            setFairyTaleGenerated(false);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (alimData) {
            setAlimData({ ...alimData, content: newContent });
        }
    };

    const handleTempSave = async () => {
        try {
            await axios.put(`${BACKEND_API_URL}/api/alims/${data!.alimId}`, {
                userId: noticeData.userId,
                babyId: noticeData.babyId,
                content: content,
                date: noticeData.date
            });
            updateEntries({ ...data!, content: content });
            onClose();
        } catch (error) {
            console.error('Failed to update diary entry:', error);
            setError(`알림장 업데이트에 실패했습니다.`);
        }
    };

    const handleCreateDiary = async () => {
        setLoading(true);
        setError(null);

        try {
            let alimId = data!.alimId;

            const alimInfData = {
                alimId: alimId,
                userId: noticeData.userId,
                babyId: noticeData.babyId,
                content: content,
                date: noticeData.date,
                sendToML: true,
            };

            console.log("alimInfData", alimInfData);

            const response = await axios.post(`${BACKEND_API_URL}/api/alims`, alimInfData);
            console.log("Created AlimInf:", response.data);

            // Fetch updated diary data
            await fetchDiaryData(alimId);

            updateEntries({
                alimId: alimId,
                content: content,
                date: noticeData.date
            });
        } catch (err) {
            setError('일기 생성 중 오류가 발생했습니다.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFairyTale = async () => {
        onClose();
        setLoading(true);
        setError(null);
        setFairyTale(null);

        try {
            // 동화 생성
            const response = await axios.post<FairyTale>(`${BACKEND_API_URL}/api/books/generate_fairytale/${diaryData?.alimInfId}`, diaryData);
            setFairyTale(response.data);
            setFairyTaleGenerated(true);
        } catch (err) {
            setError('동화를 생성하거나 저장하는 중 오류가 발생했습니다.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !data) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-700">알림장 상세</ModalHeader>
                <ModalBody>
                    {loading ? (
                        <p className="text-blue-500">로딩 중...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : diaryData ? (
                        <div className="space-y-2 mb-4 text-gray-700">
                            <p><strong>이름:</strong> {diaryData.name}</p>
                            <p><strong>감정:</strong> {diaryData.emotion}</p>
                            <p><strong>건강:</strong> {diaryData.health}</p>
                            <p><strong>영양:</strong> {diaryData.nutrition}</p>
                            <p><strong>활동:</strong> {Array.isArray(diaryData.activities) ? diaryData.activities.join(', ') : diaryData.activities}</p>
                            <p><strong>사회성:</strong> {diaryData.social}</p>
                            <p><strong>특이사항:</strong> {diaryData.special}</p>
                            <p><strong>키워드:</strong> {Array.isArray(diaryData.keywords) ? diaryData.keywords.join(', ') : diaryData.keywords}</p>
                            <p><strong>일기:</strong> {diaryData.diary}</p>
                        </div>
                    ) : alimData ? (
                        <Textarea
                            value={alimData.content}
                            onChange={handleContentChange}
                            placeholder="알림장 내용"
                            rows={4}
                        />
                    ) : (
                        <p>데이터를 불러오는 데 실패했습니다.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    {!diaryData && alimData && (
                        <>
                            <Button color="default" variant="light" onPress={handleTempSave}>
                                임시 저장
                            </Button>
                            <Button color="primary" onPress={handleCreateDiary}>
                                일기 생성
                            </Button>
                        </>
                    )}
                    {diaryData && (
                        fairyTaleGenerated ? (
                            <Button isDisabled color="primary" variant="flat">
                                동화 생성됨
                            </Button>
                        ) : (
                            <Button color="primary" onPress={handleCreateFairyTale}>
                                동화 생성
                            </Button>
                        )
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DiaryDetailModal;