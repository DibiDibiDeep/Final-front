'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonContainer from '@/components/CommonContainer';
import AvatarWithUpload from './AvatarWithUpload';
import Input from '@/components/Input';
import Image from 'next/image';
import Select from '@/components/Select';
import { useRouter } from 'next/navigation';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface BabyInfo {
    userId: number;
    babyName: string;
    birth: string;
    gender: string;
}

const InitialSettings: React.FC = () => {
    const [userId, setUserId] = useState<number | null>(null);
    const [babyName, setBabyName] = useState<string>('');
    const [birth, setBirth] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // "YYYY-MM-DD" format
    });
    const [gender, setGender] = useState<string>('남자');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [avatarSrc, setAvatarSrc] = useState<string>("/img/mg-logoback.png");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            setError('User ID not found. Please log in again.');
        }
    }, []);

    const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBirth(e.target.value);
    };

    const handleImageSelect = (file: File | null, imageSrc: string) => {
        setSelectedFile(file);
        setAvatarSrc(imageSrc);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userId) {
            setError('User ID is missing. Please log in again.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const babyInfo: BabyInfo = {
                userId,
                babyName,
                birth: new Date(birth).toISOString(),
                gender
            };

            // Create baby
            const babyResponse = await axios.post(`${BACKEND_API_URL}/api/baby`, babyInfo);
            const newBabyId = babyResponse.data.babyId;

            // Upload photo
            const formData = new FormData();
            if (selectedFile) {
                formData.append("file", selectedFile);
            } else {
                // Convert default image URL to File object
                const response = await fetch(avatarSrc);
                const blob = await response.blob();
                const defaultImageFile = new File([blob], "default_image.png", { type: "image/png" });
                formData.append("file", defaultImageFile);
            }
            formData.append("babyId", newBabyId.toString());

            await axios.post(`${BACKEND_API_URL}/api/baby-photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('Baby created and photo uploaded successfully');
            router.push('/home');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(`Error: ${err.response.data.message || 'Unknown error occurred'}`);
            } else {
                setError('An error occurred while submitting the information. Please try again.');
            }
            console.error('Error submitting baby info:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CommonContainer>
            <div className="flex flex-col items-center justify-between pt-[20px] pb-6">
                <div className="flex flex-col items-center w-full max-w-[90%] sm:max-w-md">
                    <AvatarWithUpload onImageSelect={handleImageSelect} />
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-5 w-full mt-16 sm:mt-24 md:mt-28">
                        <div className="w-full flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                아이 이름
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="아이 이름"
                                value={babyName}
                                onChange={(e) => setBabyName(e.target.value)}
                                className='text-gray-700 flex-grow'
                                required
                            />
                        </div>
                        <div className="w-full flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="birth" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                생일
                            </label>
                            <Input
                                id="birth"
                                type="date"
                                value={birth}
                                onChange={handleBirthChange}
                                className='text-gray-700 flex-grow'
                                required
                            />
                        </div>
                        <div className="w-full flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="gender" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                성별
                            </label>
                            <Select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className='text-gray-700 flex-grow'
                                options={[
                                    { value: '남자', label: '남자' },
                                    { value: '여자', label: '여자' },
                                ]}
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="pt-12 sm:pt-16 md:pt-20"
                            disabled={isLoading || !userId}
                        >
                            <Image
                                src="/img/button/confirm_circle.png"
                                alt='Confirm'
                                width={70}
                                height={70}
                                className={`max-w-full max-h-full object-contain ${isLoading || !userId ? 'opacity-50' : ''}`}
                            />
                        </button>
                    </form>
                </div>
            </div>
        </CommonContainer>
    );
};

export default InitialSettings;