import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    userId: number;
    email: string;
    name: string;
}

interface SelectedBaby {
    babyId: number;
    babyName: string;
    userId: number;
    gender: string
    birth: number;
}

export const useAuth = () => {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode<DecodedToken>(storedToken);
                setToken(storedToken);
                setUserId(decodedToken.userId);
                console.log('Stored token:', storedToken); // 디버깅을 위한 로그
            } catch (error) {
                console.error('Error decoding token:', error);
                setError('토큰 디코딩에 실패했습니다. 다시 로그인해 주세요.');
            }
        } else {
            setError('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }
    }, []);

    return { token, userId, error };
};

export const useBabySelection = () => {
    const [babyId, setBabyId] = useState<number | null>(null);

    useEffect(() => {
        const checkSelectedBaby = () => {
            const storedSelectedBaby = localStorage.getItem('selectedBaby');
            if (storedSelectedBaby) {
                const selectedBaby: SelectedBaby | null = JSON.parse(storedSelectedBaby);
                if (selectedBaby != null) {
                    setBabyId(selectedBaby.babyId);
                    console.log("selectedBaby", selectedBaby);
                } else {
                    console.log("No baby information found.");
                }
            } else {
                console.log("No stored baby information found.");
            }
        };

        checkSelectedBaby();
        window.addEventListener('storage', checkSelectedBaby);

        return () => {
            window.removeEventListener('storage', checkSelectedBaby);
        };
    }, []);

    return { babyId };
};