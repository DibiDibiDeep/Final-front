import { jwtDecode } from "jwt-decode";

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

export function setAuthToken(token: string) {
    console.log('Setting auth token in localStorage');
    localStorage.setItem('authToken', token);
}

export function getAuthToken(): string | null {
    console.log('Getting auth token from localStorage');
    return localStorage.getItem('authToken');
}

export function removeAuthToken() {
    console.log('Removing auth token from localStorage');
    localStorage.removeItem('authToken');
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