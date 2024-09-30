import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface DiaryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DiaryEntry | null;
    updateEntries: (newEntry: DiaryEntry) => void;
    noticeData: NoticeData;
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

interface NoticeData {
    alimId: number | null;
    userId: number | null;
    babyId: number | null;
    content: string;
    date: string;
}

const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({ isOpen, onClose, data, updateEntries, noticeData }) => {
    const [content, setContent] = useState('');
    const [diaryData, setDiaryData] = useState<DiaryData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            setContent(data.content);
        }
    }, [data]);

    if (!isOpen || !data) return null;

    const handleTempSave = async () => {
        try {
            await axios.put(`${BACKEND_API_URL}/api/alims/${data.alimId}`, {
                userId: noticeData.userId,
                babyId: noticeData.babyId,
                content: content,
                date: noticeData.date
            });
            updateEntries({ ...data, content: content });
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
            // 알림장 업데이트 또는 생성
            let alimId = data.alimId;

            // AlimInf 생성을 위한 데이터 준비
            const alimInfData = {
                alimId: alimId,
                userId: noticeData.userId,
                babyId: noticeData.babyId,
                content: content,
                date: noticeData.date,
                sendToML: true,
                // 필요한 경우 여기에 추가 필드를 포함시킵니다.
            };

            console.log("alimInfData date", alimInfData.date);

            const response = await axios.post(`${BACKEND_API_URL}/api/alims`, alimInfData);
            console.log("Created AlimInf:", response.data);

            const infResponse = await axios.get(`${BACKEND_API_URL}/api/alim-inf/alim-id/${alimId}`);
            setDiaryData(infResponse.data);

            // 엔트리 업데이트
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


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-700">알림장 상세</ModalHeader>
                <ModalBody>
                    {!diaryData ? (
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="알림장 내용"
                            rows={4}
                        />
                    ) : (
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
                    )}
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {loading && <p className="text-blue-500 mt-2">로딩 중...</p>}
                </ModalBody>
                <ModalFooter>
                    {!diaryData && (
                        <>
                            <Button color="default" variant="light" onPress={handleTempSave}>
                                임시 저장
                            </Button>
                            <Button color="primary" onPress={handleCreateDiary}>
                                일기 생성
                            </Button>
                        </>
                    )}
                    {/* <Button color="danger" variant="light" onPress={onClose}>
                        닫기
                    </Button> */}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DiaryDetailModal;