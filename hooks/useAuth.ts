'use client';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface DecodedToken {
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
        const storedToken = Cookies.get('authToken');
        // console.log('Auth token:', Cookies.get('authToken'));
        if (storedToken) {
            try {
                const decodedToken = jwtDecode<DecodedToken>(storedToken);
                setToken(storedToken);
                setUserId(decodedToken.userId);
                console.log('Stored token:', storedToken); // 디버깅을 위한 로그
            } catch (error) {
                console.error('Error decoding token:', error);
                setError('토큰 디코딩에 실패했습니다. 다시 로그인해 주세요.');
                Cookies.remove('authToken'); // 잘못된 토큰 제거
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
                    // console.log("selectedBaby", selectedBaby);
                } catch (error) {
                    console.error("Error parsing stored baby information:", error);
                    Cookies.remove('selectedBaby'); // 잘못된 데이터 제거
                }
            } else {
                console.log("No stored baby information found.");
            }
        };

        checkSelectedBaby();

        // 쿠키 변경 감지를 위한 주기적 체크
        const intervalId = setInterval(checkSelectedBaby, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return { babyId };
};

// 토큰 설정 함수 (로그인 시 사용)
export const setAuthToken = (token: string) => {
    Cookies.set('authToken', token, { expires: 7, path: '/', secure: true, sameSite: 'strict' });
};

// 선택된 아기 정보 설정 함수
export const setSelectedBaby = (baby: SelectedBaby) => {
    Cookies.set('selectedBaby', JSON.stringify(baby), { expires: 7, path: '/', secure: true, sameSite: 'strict' });
};

// 로그아웃 함수
export const logout = () => {
    Cookies.remove('authToken');
    Cookies.remove('selectedBaby');
};