import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

interface User {
    userId: number;
    email: string;
    name: string;
}

interface JwtPayload {
    sub: string;
    userId: number;
    name: string;
    iat: number;
    exp: number;
}

export function decodeToken(token: string): User {
    try {
        // console.log('Decoding token:', token);
        const decodedToken = jwtDecode<JwtPayload>(token);
        // console.log('Decoded token:', decodedToken);
        return {
            userId: decodedToken.userId,
            email: decodedToken.sub,
            name: decodedToken.name
        };
    } catch (error) {
        // console.error('Failed to decode token:', error);
        throw new Error('Invalid token');
    }
}

export const setAuthToken = (token: string) => {
    // console.log('Setting auth token:', token);
    Cookies.set('authToken', token, {
        expires: 7,
        path: '/',
        sameSite: 'strict',
        secure: window.location.protocol === 'https:' // 로컬 환경에서 HTTPS가 아니면 false가 됩니다.
    });
    // console.log('Auth token after set:', Cookies.get('authToken'));

    // 쿠키 설정 즉시 확인
    const setToken = Cookies.get('authToken');
    // console.log('Immediately after setting, auth token is:', setToken ? 'exists' : 'does not exist');
};

export const getAuthToken = () => {
    const token = Cookies.get('authToken');
    // console.log('Getting auth token:', token);
    return token;
};

export function removeAuthToken() {
    // console.log('Removing auth token from cookie');
    Cookies.remove('authToken');
}

export function getCurrentUser() {
    const token = getAuthToken();
    if (token) {
        try {
            return decodeToken(token);
        } catch (error) {
            // console.error('Error in getCurrentUser:', error);
            removeAuthToken();
        }
    }
    return null;
}

// 로그아웃 함수
export const logout = () => {
    Cookies.remove('authToken');
    Cookies.remove('selectedBaby');
};