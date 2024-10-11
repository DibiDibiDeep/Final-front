import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useBabySelection } from '@/hooks/authHooks';
import { fetchWithAuth } from '@/utils/api';
import ConfirmUploadModal from '@/app/modal/ConfirmUploadModal';
type ActiveView = 'home' | 'todo' | 'memo' | 'diary' | 'story' | 'profile';

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
    const [isConfirmUploadModalOpen, setIsConfirmUploadModalOpen] = useState(false);
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
                    // console.log('선택된 파일:', file.name);
                    await uploadImage(file, userId, babyId);
                }
            };
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        }
    }, [userId, babyId]);

    const uploadImage = async (file: File, userId: number, babyId: number): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId.toString());
        formData.append('babyId', babyId.toString());

        // ISO 8601 형식으로 현재 날짜 및 시간 추가
        const currentDate = new Date().toISOString();
        formData.append('date', currentDate);

        try {
            // console.log('Sending request with formData:', Object.fromEntries(formData.entries()));

            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendar-photos`, {
                method: 'POST',
                body: formData
            });

            // console.log('서버 응답:', response);

            if (response && response.filePath) {
                // console.log('이미지 업로드 성공:', response);
                const imageUrl = response.filePath;
                // console.log('이미지 URL:', imageUrl);
                setIsConfirmUploadModalOpen(true);

                // 결과를 로컬 스토리지에 저장
                localStorage.setItem('calendarData', JSON.stringify(imageUrl));
            } else {
                // console.error('서버 응답에 filePath가 없습니다:', response);
                throw new Error('Invalid server response');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // console.error('Request timed out');
            } else if (error.message) {
                // console.error('Failed to upload image:', error.message);
            } else {
                // console.error('Unknown error:', error);
            }
            throw error;
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
            <ConfirmUploadModal
                isOpen={isConfirmUploadModalOpen}
                onClose={() => {
                    setIsConfirmUploadModalOpen(false)
                    window.location.reload();
                }}
            />
        </BottomContainerContext.Provider>
    );
};