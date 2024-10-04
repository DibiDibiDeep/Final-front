'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { removeAuthToken } from '@/utils/authUtils';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Baby {
    userId: number;
    babyId: number;
    babyName: string;
    birth: string;
    gender: string;
    photoUrl: string;
}

const MyPage: React.FC = () => {
    const [userId, setUserId] = useState<number | null>(null);
    const [babies, setBabies] = useState<Baby[]>([]);
    const [currentBabyIndex, setCurrentBabyIndex] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            setError('User ID not found. Please log in again.');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchBabiesInfo(userId);
        }
    }, [userId]);

    const formatBirthDate = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일생`;
    };

    const fetchBabiesInfo = async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_API_URL}/api/baby/user/${userId}`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const fetchedBabies: Baby[] = await Promise.all(response.data.map(async (baby: any) => {
                    const photoResponse = await axios.get(`${BACKEND_API_URL}/api/baby-photos/baby/${baby.babyId}`);
                    return {
                        userId: baby.userId,
                        babyId: baby.babyId,
                        babyName: baby.babyName,
                        birth: baby.birth,
                        gender: baby.gender,
                        photoUrl: photoResponse.data[0]?.filePath || "/img/mg-logoback.png"
                    };
                }));
                setBabies(fetchedBabies);
            }
        } catch (error) {
            console.error('Failed to fetch baby information:', error);
            setError('Failed to fetch baby information. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChildClick = (baby: Baby) => {
        const selectedBabyInfo = {
            babyId: baby.babyId,
            babyName: baby.babyName,
            birth: baby.birth,
            gender: baby.gender,
            photoUrl: baby.photoUrl
        };
        localStorage.setItem('selectedBaby', JSON.stringify(selectedBabyInfo));
        router.push(`/initialSettings?babyId=${baby.babyId}`);
    };

    const handleAddBaby = async () => {
        localStorage.removeItem('selectedBaby');
        router.push(`/initialSettings`);
    };

    const handleLogout = () => {
        removeAuthToken();
        localStorage.removeItem('userId');
        router.push('/login');
    };

    const handlePrevBaby = () => {
        setCurrentBabyIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : babies.length - 1
        );
    };

    const handleNextBaby = () => {
        setCurrentBabyIndex((prevIndex) =>
            prevIndex < babies.length - 1 ? prevIndex + 1 : 0
        );
    };

    const handleBack = () => {
        router.back();
    };

    const handlers = useSwipeable({
        onSwipedLeft: handleNextBaby,
        onSwipedRight: handlePrevBaby,
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    const currentBaby = babies[currentBabyIndex];

    return (
        <div>
            <div className="fixed top-[37px] left-0 w-full">
                <div className="flex items-center w-full max-w-[90%] sm:max-w-md p-4 mx-auto">
                    <h1 className="text-2xl font-bold text-gray-600 text-center flex-grow">
                        내 아이
                    </h1>
                </div>
            </div>
            <div className="flex flex-col items-center w-full max-w-[90%] sm:max-w-md mt-[-60px]">
                <div className="mb-6 w-full">
                    {babies.length > 0 ? (
                        <div className="relative flex justify-center items-center w-full" {...handlers}>
                            <button
                                onClick={handlePrevBaby}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-transparent text-white p-2"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div
                                className="flex-shrink-0 w-40 flex flex-col items-center cursor-pointer mx-12"
                                onClick={() => handleChildClick(currentBaby)}
                            >
                                <div className="w-40 h-40 bg-transparent rounded-full overflow-hidden border-2 border-white mb-3">
                                    <Image
                                        src={currentBaby.photoUrl}
                                        alt={currentBaby.babyName}
                                        width={160}
                                        height={160}
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                </div>
                                <p className="text-lg font-bold text-center text-gray-600">{currentBaby.babyName}</p>
                                <p className="text-md text-center text-gray-600 mt-4">{formatBirthDate(currentBaby.birth)}</p>
                                <p className="text-md text-center text-gray-600 mt-2">{currentBaby.gender}</p>
                            </div>
                            <button
                                onClick={handleNextBaby}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent text-white p-2"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No child profiles found.</p>
                    )}
                </div>

                <div className="mt-4 w-full">
                    <button
                        onClick={handleAddBaby}
                        className="flex items-center justify-center w-full py-2 px-4 border border-primary rounded-lg transition-colors duration-300 ease-in-out hover:bg-primary group"
                    >
                        <span className="text-primary group-hover:text-white">아이 추가하기</span>
                    </button>
                </div>

                <div className="mt-4 w-full">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full py-2 px-4 border border-primary rounded-lg transition-colors duration-300 ease-in-out hover:bg-primary group"
                    >
                        <LogOut size={20} className="mr-2 text-primary group-hover:text-white" />
                        <span className="text-primary group-hover:text-white">로그아웃</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
