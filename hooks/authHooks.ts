'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { getAuthToken, removeAuthToken } from '@/utils/authUtils';

interface User {
    userId: number;
    email: string;
    name: string;
}

interface SelectedBaby {
    babyId: number;
    babyName: string;
    userId: number;
    gender: string;
    birth: number;
}

export const useAuth = () => {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = getAuthToken();
        if (storedToken) {
            try {
                const decodedToken = jwtDecode<User>(storedToken);
                setToken(storedToken);
                setUserId(decodedToken.userId);
            } catch (error) {
                // console.error('Error decoding token:', error);
                setError('토큰 디코딩에 실패했습니다. 다시 로그인해 주세요.');
                removeAuthToken();
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
            const storedSelectedBaby = Cookies.get('selectedBaby');
            if (storedSelectedBaby) {
                try {
                    const selectedBaby: SelectedBaby = JSON.parse(storedSelectedBaby);
                    setBabyId(selectedBaby.babyId);
                } catch (error) {
                    // console.error("Error parsing stored baby information:", error);
                    Cookies.remove('selectedBaby');
                }
            } else {
                // console.log("No stored baby information found.");
            }
        };

        checkSelectedBaby();
        const intervalId = setInterval(checkSelectedBaby, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return { babyId };
};