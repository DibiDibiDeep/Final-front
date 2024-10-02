import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Memo } from '@/types/index';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type ActiveView = 'home' | 'todo' | 'memo' | 'dairy' | 'story' | 'profile';

interface BottomContainerContextType {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    handleAddSchedule: () => void;
    handleCreateMemo: () => void;
    handleVoiceRecord: () => void;
    handleDairyView: () => void;
    handleStoryView: () => void;
    handleProfileView: () => void;
    isCreateMemoModalOpen: boolean;
    setIsCreateMemoModalOpen: (isOpen: boolean) => void;
    isVoiceRecordModalOpen: boolean;
    setIsVoiceRecordModalOpen: (isOpen: boolean) => void;
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
    const [selectedBaby, setSelectedBaby] = useState<{ babyId: number } | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }

        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        if (storedSelectedBaby) {
            const parsedSelectedBaby = JSON.parse(storedSelectedBaby);
            if (parsedSelectedBaby && parsedSelectedBaby.babyId) {
                setSelectedBaby(parsedSelectedBaby);
                console.log("selectedBaby", parsedSelectedBaby);
            } else {
                console.log("No valid baby information found.");
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

    const handleDairyView = () => {
        setActiveView('dairy');
        router.push('/diary');
    };

    const handleStoryView = () => {
        setActiveView('story');
        router.push('/story');
    };

    const handleProfileView = () => {
        setActiveView('profile');
        router.push('/profile');
    };

    const saveVoiceRecord = (audioBlob: Blob) => {
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
                handleDairyView,
                handleStoryView,
                handleProfileView,
                isCreateMemoModalOpen,
                setIsCreateMemoModalOpen,
                isVoiceRecordModalOpen,
                setIsVoiceRecordModalOpen,
                saveVoiceRecord,
            }}
        >
            {children}
        </BottomContainerContext.Provider>
    );
};