import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection  } from '@/hooks/useAuth';

const { token, userId, error: authError } = useAuth();
const { babyId } = useBabySelection();


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

const getFormattedDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:MM:SS" format
};

const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({ isOpen, onClose, data, updateEntries, noticeData }) => {
    const [content, setContent] = useState('');
    const [diaryData, setDiaryData] = useState<DiaryData | null>(null);
    const [alimData, setAlimData] = useState<AlimData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fairyTaleGenerated, setFairyTaleGenerated] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                // const decodedToken: any = jwtDecode(storedToken);
                setToken(storedToken);
                // setUserId(decodedToken.userId);
                console.log('Stored token:', storedToken); // 디버깅을 위한 로그
            } catch (error) {
                console.error('Error decoding token:', error);
                setError('토큰 디코딩에 실패했습니다. 다시 로그인해 주세요.');
            }
        } else {
            setError('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }
    })

    useEffect(() => {
        if (data && isOpen) {
            setContent(data.content);
            fetchDiaryData(data.alimId);
        }
    }, [data, isOpen]);

    const fetchDiaryData = async (alimId: number) => {
        setLoading(true);
        setError(null);

        try {
            if (!token) return;
            const diaryResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/alim-inf/alim-id/${alimId}`, token, {method: 'GET'});
            if (diaryResponse.data && typeof diaryResponse.data === 'object' &&
                Object.keys(diaryResponse.data).length > 0 &&
                (diaryResponse.data.alimInfId || diaryResponse.data.diary)) {
                console.log('Valid diary data found');
                setDiaryData(diaryResponse.data);
                setAlimData(null);
                return; // 유효한 데이터를 찾았으므로 함수 종료
            }
            console.log('No valid diary data found, will attempt to fetch alim data');
        } catch (diaryError) {
            console.error('Error fetching diary data:', diaryError);
            console.log('Will attempt to fetch alim data instead');
        } finally {
            setLoading(false);
        }

        // Diary 데이터 fetch 실패 또는 유효하지 않은 경우 alim 데이터 fetch 시도
        try {
            console.log('Attempting to fetch alim data');
            if (!token) return;
            const alimResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/alims/${alimId}`, token, {method: 'GET'});
            console.log('Alim response received');
            console.log('Alim response:', JSON.stringify(alimResponse.data, null, 2));

            if (alimResponse.data && typeof alimResponse.data === 'object' &&
                Object.keys(alimResponse.data).length > 0 &&
                (alimResponse.data.alimId || alimResponse.data.content)) {
                console.log('Valid alim data fetched');
                setAlimData(alimResponse.data);
                setDiaryData(null);
            } else {
                console.log('No valid alim data found');
                throw new Error("유효한 데이터를 받지 못했습니다.");
            }
        } catch (alimError) {
            console.error('Error fetching alim data:', alimError);
            setError('데이터를 가져오는 데 실패했습니다.');
            setDiaryData(null);
            setAlimData(null);
        } finally {
            setLoading(false);
        }

        checkFairyTaleStatus(alimId);
    };


    const checkFairyTaleStatus = async (alimId: number) => {
        try {
            if (!token) return;
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/books/fairytale-status/${alimId}`, token, {method: 'GET'});
            setFairyTaleGenerated(response.data.status === "COMPLETED");
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
            const formattedDate = getFormattedDateTime(noticeData.date);
            if (!token) return;
            await fetchWithAuth(`${BACKEND_API_URL}/api/alims/${data!.alimId}`, token, {
                method: 'PUT',
                body: JSON.stringify({
                    userId: noticeData.userId,
                    babyId: noticeData.babyId,
                    content: content,
                    date: formattedDate
                }),
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
            const formattedDate = getFormattedDateTime(noticeData.date);
            const alimInfData = {
                alimId: data!.alimId,
                userId: noticeData.userId,
                babyId: noticeData.babyId,
                content: content,
                date: formattedDate,
                sendToML: true,
            };

            if (!token) return;
            await fetchWithAuth(`${BACKEND_API_URL}/api/alims`, token, {
                method: 'POST',
                body: JSON.stringify(alimInfData),
            });

            // 일기 생성 후 즉시 데이터를 다시 가져옵니다.
            await fetchDiaryData(data!.alimId);

            updateEntries({
                alimId: data!.alimId,
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
        setLoading(true);
        setError(null);

        try {
            if (!token) return;
            await fetchWithAuth(`${BACKEND_API_URL}/api/books/generate_fairytale/${diaryData?.alimInfId}`, token, {
                method: 'POST',
                body: JSON.stringify(diaryData),
            });
            setFairyTaleGenerated(true);
        } catch (err) {
            setError('동화를 생성하는 중 오류가 발생했습니다.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                            minRows={4}
                        />
                    ) : (
                        <p>데이터를 불러오는 데 실패했습니다.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    {!diaryData && alimData && (
                        <>
                            <Button color="default" variant="light" onPress={handleTempSave} isDisabled={loading}>
                                임시 저장
                            </Button>
                            <Button color="primary" onPress={handleCreateDiary} isDisabled={loading}>
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
                            <Button color="primary" onPress={handleCreateFairyTale} isDisabled={loading}>
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