'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonContainer from '@/components/CommonContainer';
import AvatarWithUpload from './AvatarWithUpload';
import Input from '@/components/Input';
import Image from 'next/image';
import Select from '@/components/Select';
import { useRouter } from 'next/navigation';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface BabyInfo {
    userId: number;
    babyId : number | null;
    babyName: string;
    birth: string;
    gender: string;
}

const InitialSettings: React.FC = () => {
    const [userId, setUserId] = useState<number | null>(null);
    const [babyInfo, setBabyInfo] = useState<BabyInfo>({
        userId: 0,
        babyId: null,
        babyName: '',
        birth: new Date().toISOString().split('T')[0],
        gender: '남자'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [avatarSrc, setAvatarSrc] = useState<string>("/img/mg-logoback.png");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }
        
        if (storedSelectedBaby) {
            try {
                const selectedBabyObj = JSON.parse(storedSelectedBaby);
                setBabyInfo({
                    userId: parseInt(storedUserId!, 10),
                    babyId: selectedBabyObj.babyId,
                    babyName: selectedBabyObj.babyName,
                    birth: new Date(selectedBabyObj.birth).toISOString().split('T')[0],
                    gender: selectedBabyObj.gender
                });
                setAvatarSrc(selectedBabyObj.photoUrl || "/img/mg-logoback.png");
            } catch (error) {
                console.error('Error parsing selectedBaby:', error);
                setError('Error loading baby information. Please try again.');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBabyInfo(prev => ({ ...prev, [name]: value }));
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
            // Convert date to ISO string format
        const formattedBabyInfo = {
            ...babyInfo,
            birth: new Date(babyInfo.birth + 'T00:00:00').toISOString()
        };

        let response;
        if (formattedBabyInfo.babyId) {
            // Update existing baby
            response = await axios.put(`${BACKEND_API_URL}/api/baby/${formattedBabyInfo.babyId}`, formattedBabyInfo);
        } else {
            // Create new baby
            response = await axios.post(`${BACKEND_API_URL}/api/baby`, formattedBabyInfo);
        }
        
        const babyId = response.data.babyId;

        // baby-photo 로직
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("babyId", babyId.toString());

            await axios.post(`${BACKEND_API_URL}/api/baby-photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else if (avatarSrc !== "/img/mg-logoback.png") {
            // If there's no new file selected but the avatar has changed,
            // it means we need to update the existing photo URL
            await axios.put(`${BACKEND_API_URL}/api/baby-photos/edit/${babyId}`, {
                photoUrl: avatarSrc
            });
        }

        console.log('Baby information and photo saved successfully');
            router.push('/home');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(`Error: ${err.response.data.message || 'Unknown error occurred'}`);
            } else {
                setError('An error occurred while saving the information. Please try again.');
            }
            console.error('Error saving baby info:', err);
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
                            <label htmlFor="babyName" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                아이 이름
                            </label>
                            <Input
                                id="babyName"
                                name="babyName"
                                type="text"
                                placeholder="아이 이름"
                                value={babyInfo.babyName}
                                onChange={handleChange}
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
                                name="birth"
                                type="date"
                                value={babyInfo.birth}
                                onChange={handleChange}
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
                                name="gender"
                                value={babyInfo.gender}
                                onChange={handleChange}
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