// src/hooks/useBabySelection.ts
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth to access token and userId

interface SelectedBaby {
    userId: number;
    babyId: number;
    babyName: string;
    photoUrl?: string;
}

export const useBabySelection = () => {
    const { token, userId } = useAuth(); // Access token and userId from useAuth
    const [babyId, setBabyId] = useState<number | null>(null);

    useEffect(() => {
        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        if (storedSelectedBaby) {
            const selectedBaby: SelectedBaby | null = JSON.parse(storedSelectedBaby);
            if (selectedBaby != null && selectedBaby.userId === userId) { // Check if the selected baby belongs to the current user
                setBabyId(selectedBaby.babyId);
                console.log("Selected baby:", selectedBaby);
            } else {
                console.log("아기 정보가 없습니다.");
            }
        } else {
            console.log("저장된 아기 정보가 없습니다.");
        }
    }, [userId, token]); // Add userId and token to dependency array

    return { babyId };
};