import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    login: (userData: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 페이지 로드 시 사용자 정보 확인
        const checkUser = async () => {
            const token = Cookies.get('authToken');
            if (token) {
                try {
                    // 여기서 토큰을 검증하고 사용자 정보를 가져오는 API 호출
                    const response = await fetch('/api/validate-token', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        // 토큰이 유효하지 않으면 로그아웃
                        logout();
                    }
                } catch (error) {
                    // console.error('Failed to validate token:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const login = (userData: any) => {
        setUser(userData);
        Cookies.set('authToken', userData.token, { secure: true, sameSite: 'strict' });
    };

    const logout = () => {
        setUser(null);
        Cookies.remove('authToken');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};