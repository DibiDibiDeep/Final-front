// 'use client'
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';

// interface DecodedToken {
//     userId: number;
//     email: string;
//     name: string;
// }

// interface SelectedBaby {
//     userId: number;
//     babyId: number;
//     babyName: string;
//     photoUrl?: string;
// }

// interface AuthContextType {
//     token: string | null;
//     userId: number | null;
//     error: string | null;
//     babyId: number | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [token, setToken] = useState<string | null>(null);
//     const [userId, setUserId] = useState<number | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [babyId, setBabyId] = useState<number | null>(null);

//     // 토큰과 userId를 가져오는 useEffect
//     useEffect(() => {
//         const storedToken = localStorage.getItem('authToken');
//         if (storedToken) {
//             try {
//                 const decodedToken = jwtDecode<DecodedToken>(storedToken);
//                 setToken(storedToken);
//                 setUserId(decodedToken.userId);
//                 console.log('Stored token:', storedToken);
//             } catch (error) {
//                 console.error('Error decoding token:', error);
//                 setError('토큰을 디코딩하는 데 실패했습니다. 다시 로그인하세요.');
//             }
//         } else {
//             setError('인증 토큰이 없습니다. 로그인이 필요합니다.');
//         }
//     }, []);

//     // 선택된 아기를 가져오는 useEffect
//     useEffect(() => {
//         const storedSelectedBaby = localStorage.getItem('selectedBaby');
//         if (storedSelectedBaby) {
//             const selectedBaby: SelectedBaby | null = JSON.parse(storedSelectedBaby);
//             if (selectedBaby != null) {
//                 setBabyId(selectedBaby.babyId);
//                 console.log("Selected baby:", selectedBaby);
//             } else {
//                 console.log("아기 정보가 없습니다.");
//             }
//         } else {
//             console.log("저장된 아기 정보가 없습니다.");
//         }
//     }, []);

//     return (
//         <AuthContext.Provider value={{ token, userId, error, babyId }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuthContext = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuthContext는 AuthProvider 내에서만 사용해야 합니다.');
//     }
//     return context;
// };
