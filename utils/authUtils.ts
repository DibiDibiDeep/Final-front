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
        console.log('Decoding token:', token);
        const decodedToken = jwtDecode<JwtPayload>(token);
        console.log('Decoded token:', decodedToken);
        return {
            userId: decodedToken.userId,
            email: decodedToken.sub,
            name: decodedToken.name
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        throw new Error('Invalid token');
    }
}

export const setAuthToken = (token: string) => {
    console.log('Setting auth token in cookie');
    Cookies.set('authToken', token, {
        expires: 7, // 7일 후 만료
        path: '/', // 모든 경로에서 접근 가능
        sameSite: 'strict',
        secure: window.location.protocol === 'https:' // HTTPS에서만 사용 (개발 환경에서는 false가 될 수 있음)
    });
    console.log('Auth token set:', token);
};

export function getAuthToken(): string | null {
    console.log('Getting auth token from cookie');
    return Cookies.get('authToken') || null;
}

export function removeAuthToken() {
    console.log('Removing auth token from cookie');
    Cookies.remove('authToken');
}

export function getCurrentUser(): User | null {
    const token = getAuthToken();
    if (token) {
        try {
            return decodeToken(token);
        } catch (error) {
            console.error('Error in getCurrentUser:', error);
            removeAuthToken();
        }
    }
    return null;
}