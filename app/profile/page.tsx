'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import CommonContainer from '@/components/CommonContainer';

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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
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

    const fetchBabiesInfo = async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const userResponse = await axios.get(`${BACKEND_API_URL}/api/baby/user/${userId}`);
            if (userResponse.data && Array.isArray(userResponse.data) && userResponse.data.length > 0) {
                const fetchedBabies: Baby[] = await Promise.all(userResponse.data.map(async (baby: any) => {
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

                const storedSelectedBaby = localStorage.getItem('selectedBaby');
                if (storedSelectedBaby) {
                    const parsedSelectedBaby = JSON.parse(storedSelectedBaby);
                    const foundBaby = fetchedBabies.find(baby => baby.babyId === parsedSelectedBaby.babyId);
                    if (foundBaby) {
                        setSelectedBaby(foundBaby);
                    } else {
                        setSelectedBaby(fetchedBabies[0]);
                        localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
                    }
                } else {
                    setSelectedBaby(fetchedBabies[0]);
                    localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
                }
            } else {
                console.log("No baby information found for this user.");
                localStorage.removeItem('selectedBaby');
            }
        } catch (error) {
            console.error('Failed to fetch baby information:', error);
            setError('Failed to fetch baby information. Please try again.');
            localStorage.removeItem('selectedBaby');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChildClick = (babyId: number) => {
        router.push(`/initialSetting?babyId=${babyId}`);
    };

    const handleLogout = () => {
        window.localStorage.clear();
        router.push('/login');
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <CommonContainer>
            <div className="flex flex-col items-center justify-between pt-[20px] pb-6">
                <div className="flex flex-col items-center w-full max-w-[90%] sm:max-w-md">
                    <h1 className="text-2xl font-bold mb-4">My Baby</h1>
                    
                    <div className="mb-6 w-full">
                        {babies.length > 0 ? (
                            <div className="relative">
                                <div className="flex overflow-x-auto space-x-4 pb-4">
                                    {babies.map((baby) => (
                                        <div 
                                            key={baby.babyId} 
                                            className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                                            onClick={() => handleChildClick(baby.babyId)}
                                        >
                                            <Image
                                                src={baby.photoUrl}
                                                alt={baby.babyName}
                                                width={128}
                                                height={128}
                                                className="object-cover w-full h-full"
                                            />
                                            <p className="mt-2 text-sm bg-white bg-opacity-75 w-full text-center absolute bottom-0">{baby.babyName}</p>
                                        </div>
                                    ))}
                                </div>
                                {babies.length > 3 && (
                                    <>
                                        <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow">
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No child profiles found.</p>
                        )}
                    </div>
                    
                    <div className="mt-8 w-full">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg"
                        >
                            <LogOut size={20} className="mr-2" />
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </CommonContainer>
    );
};

export default MyPage;