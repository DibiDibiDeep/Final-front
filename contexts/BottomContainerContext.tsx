import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useBabySelection } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/utils/api';
import axios from 'axios';

type ActiveView = 'home' | 'todo' | 'memo' | 'dairy' | 'story' | 'profile';

interface BottomContainerContextType {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    handleAddSchedule: () => void;
    handleCreateMemo: () => void;
    handleVoiceRecord: () => void;
    handleScanButtonClick: () => void;
    isCreateMemoModalOpen: boolean;
    setIsCreateMemoModalOpen: (isOpen: boolean) => void;
    isVoiceRecordModalOpen: boolean;
    setIsVoiceRecordModalOpen: (isOpen: boolean) => void;
}

const BottomContainerContext = createContext<BottomContainerContextType | undefined>(undefined);

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const useBottomContainer = () => {
    const context = useContext(BottomContainerContext);
    if (context === undefined) {
        throw new Error('useBottomContainer must be used within a BottomContainerProvider');
    }
    return context;
};

interface BottomContainerProviderProps {
    children: ReactNode;
}

export const BottomContainerProvider: React.FC<BottomContainerProviderProps> = ({ children }) => {
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [isCreateMemoModalOpen, setIsCreateMemoModalOpen] = useState(false);
    const [isVoiceRecordModalOpen, setIsVoiceRecordModalOpen] = useState(false);
    const { token, userId, error: authError } = useAuth();
    const { babyId } = useBabySelection();
    const router = useRouter();

    const handleAddSchedule = () => {
        router.push('/addEvent');
    };

    const handleCreateMemo = () => {
        setIsCreateMemoModalOpen(true);
    };

    const handleVoiceRecord = () => {
        setIsVoiceRecordModalOpen(true);
    };

    const handleScanButtonClick = useCallback(() => {
        if (userId && babyId) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            input.onchange = async (event: Event) => {
                const target = event.target as HTMLInputElement;
                const files = target.files;
                if (files && files.length > 0) {
                    const file = files[0];
                    console.log('선택된 파일:', file.name);
                    await uploadImage(file, userId, babyId);
                }
            };
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        }
    }, [userId, babyId]);

    const uploadImage = async (file: File, userId: number, babyId: number) => {
        const formData = new FormData();

        formData.append('file', file);
        formData.append('userId', userId.toString());
        formData.append('babyId', babyId.toString());

        // ISO 8601 형식으로 현재 날짜 및 시간 추가
        const currentDate = new Date().toISOString();
        formData.append('date', currentDate);
        try {
            console.log('Sending request with formData:', Object.fromEntries(formData));
            const response = await axios.post(`${BACKEND_API_URL}/api/calendar-photos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('서버 응답:', response);

            if (response.data && response.data.filePath) {
                console.log('이미지 업로드 성공:', response.data);
                const imageUrl = response.data.filePath;
                console.log('이미지 URL:', imageUrl);

                // const result = await processImage({ imageUrl, userId, babyId });
                // console.log("결과 : ", result);

                // 결과를 로컬 스토리지에 저장
                localStorage.setItem('calendarData', JSON.stringify(imageUrl));

                // 결과 페이지로 이동
                // router.push('/calendarResult');
            } else {
                console.error('서버 응답에 filePath가 없습니다:', response.data);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // console.error('Axios 에러:', error.response?.data || error.message);
                // if (error.response) {
                //     console.error('에러 상태:', error.response.status);
                //     console.error('에러 데이터:', error.response.data);
                // }
            } else {
                console.error('알 수 없는 에러:', error);
            }
            throw error; // 에러를 상위로 전파
        }

    };


    return (
        <BottomContainerContext.Provider
            value={{
                activeView,
                setActiveView,
                handleAddSchedule,
                handleCreateMemo,
                handleVoiceRecord,
                handleScanButtonClick,
                isCreateMemoModalOpen,
                setIsCreateMemoModalOpen,
                isVoiceRecordModalOpen,
                setIsVoiceRecordModalOpen,
            }}
        >
            {children}
        </BottomContainerContext.Provider>
    );
};