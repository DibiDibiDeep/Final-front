import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Memo } from '@/types/index';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

type ActiveView = 'home' | 'todo' | 'memo';

interface BottomContainerContextType {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void; // 현재 활성화된 뷰 관리
    handleAddSchedule: () => void;
    handleCreateMemo: () => void;
    handleVoiceRecord: () => void;
    isCreateMemoModalOpen: boolean;
    setIsCreateMemoModalOpen: (isOpen: boolean) => void;
    isVoiceRecordModalOpen: boolean;
    setIsVoiceRecordModalOpen: (isOpen: boolean) => void;
    createMemo: (content: string) => Promise<Memo | null>;
    saveVoiceRecord: (audioBlob: Blob) => void;
}

const BottomContainerContext = createContext<BottomContainerContextType | undefined>(undefined);

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
    const [userId, setUserId] = useState<number | null>(null);
    const [babyId, setBabyId] = useState<number | null>(null);

    useEffect(() => {
        // localStorage에서 userId를 가져오기
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

    }, []);

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

    const createMemo = async (content: string): Promise<Memo | null> => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID is not available');
            return null;
        }

        try {
            const response = await axios.post(`${BACKEND_API_URL}/api/memos`, {
                userId: parseInt(userId),
                date: new Date().toISOString(),
                content: content,
                todayId: null,
                bookId: null
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create memo:', error);
            return null;
        }
    };

    const saveVoiceRecord = (audioBlob: Blob) => {
        // audio blob 서버에 전송 (현재는 로그만 출력)
        console.log('Audio recorded:', audioBlob);
        console.log('userId', userId, 'babyId', babyId);
        setIsVoiceRecordModalOpen(false);
        // 저장 로직 구현 필요
    };

    return (
        <BottomContainerContext.Provider
            value={{
                activeView,
                setActiveView,
                handleAddSchedule,
                handleCreateMemo,
                handleVoiceRecord,
                isCreateMemoModalOpen,
                setIsCreateMemoModalOpen,
                isVoiceRecordModalOpen,
                setIsVoiceRecordModalOpen,
                createMemo,
                saveVoiceRecord,
            }}
        >
            {children}
        </BottomContainerContext.Provider>
    );
};