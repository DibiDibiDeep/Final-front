'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CommonContainer from '@/components/CommonContainer';
import AvatarWithUpload from './AvatarWithUpload';
import Input from '@/components/Input';
import Image from 'next/image';
import Select from '@/components/Select';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/useAuth';


const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface BabyInfo {
    userId: number;
    babyId: number | null;
    babyName: string;
    birth: string;
    gender: string;
    photoUrl?: string;
}

const InitialSettings: React.FC = () => {
    // const [userId, setUserId] = useState<number | null>(null);
    const [babyInfo, setBabyInfo] = useState<BabyInfo>({
        userId: 0,
        babyId: 0,
        babyName: '',
        birth: new Date().toISOString().split('T')[0],
        gender: '남자',
        photoUrl: '/img/mg-logoback.png'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [avatarSrc, setAvatarSrc] = useState<string>("/img/mg-logoback.png");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [babies, setBabies] = useState<BabyInfo[]>([]);
    const [selectedBaby, setSelectedBaby] = useState<BabyInfo | null>(null);
    const fileInput = useRef<HTMLInputElement | null>(null);
    const router = useRouter();
    const { token, userId, error: authError } = useAuth();
    const { babyId } = useBabySelection();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedSelectedBaby = localStorage.getItem('selectedBaby');

        if (storedSelectedBaby) {
            // console.log("storedSelectedBaby", JSON.stringify(storedSelectedBaby));

            try {
                const selectedBabyObj = JSON.parse(storedSelectedBaby);
                setSelectedBaby(selectedBabyObj); // Ensure selectedBaby is set

                // Set babyInfo based on selected baby object
                const updatedBabyInfo = {
                    userId: parseInt(storedUserId!, 10),
                    babyId: selectedBabyObj.babyId,
                    babyName: selectedBabyObj.babyName,
                    birth: new Date(selectedBabyObj.birth).toISOString().split('T')[0],
                    gender: selectedBabyObj.gender,
                    photoUrl: selectedBabyObj.photoUrl // Use the photoUrl directly from selectedBabyObj
                };

                setBabyInfo(updatedBabyInfo);

                const photoUrl = selectedBabyObj.photoUrl;
                setAvatarSrc(photoUrl || '/img/mg-logoback.png'); // Fallback to default image if photoUrl is not available
                console.log(photoUrl);
                // Fetch baby photo if needed
                fetchBabyPhoto(selectedBabyObj.babyId);
            } catch (error) {
                console.error('Error parsing selectedBaby:', error);
                setError('Error loading baby information. Please try again.');
            }
        }
    }, []);

    const fetchBabyPhoto = async (babyId: number) => {
        try {
            if (!token) return;
            // const response = await axios.get(`${BACKEND_API_URL}/api/baby-photos/baby/${babyId}`);
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/baby-photos/baby/${babyId}`, token, {
                method: 'GET',
            });
            console.log('fetch Photo:', response);

            if (response && Array.isArray(response) && response.length > 0 && response[0].photoUrl) {
                // Update avatar source with the fetched photo URL
                setAvatarSrc(response[0].filePath);

                // Update babyInfo state
                const updatedBabyInfo = {
                    ...babyInfo,
                    photoUrl: response[response.length - 1].filePath
                };
                setBabyInfo(updatedBabyInfo);
            } else {
                console.warn('No photo found or photoUrl is missing.');
            }
        } catch (error) {
            console.error('Error fetching baby photo:', error);
            setError('아이의 사진을 로딩 중 에러가 났습니다. 다시 시도해주세요.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBabyInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = async (file: File | null, imageSrc: string, token: string) => {
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
            if (!token) return;
            const formattedBabyInfo = {
                ...babyInfo,
                birth: new Date(babyInfo.birth + 'T00:00:00').toISOString(),
                userId: userId
            };

            let response;
            if (formattedBabyInfo.babyId) {
                // 기존 아기 정보 업데이트
                response = await fetchWithAuth(`${BACKEND_API_URL}/api/baby/${formattedBabyInfo.babyId}`, token, {
                    method: 'PUT',
                    body: formattedBabyInfo,
                });
            } else {
                // 새 아기 정보 생성
                response = await fetchWithAuth(`${BACKEND_API_URL}/api/baby`, token, {
                    method: 'POST',
                    body: formattedBabyInfo,
                });
            }

            const babyId = response.babyId;

            // baby-photo 로직
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("babyId", babyId.toString());
                formData.append("userId", userId.toString());

                console.log(`update photo: ${BACKEND_API_URL}/api/baby-photos/${babyInfo.babyId}`);

                const response = await fetchWithAuth(`${BACKEND_API_URL}/api/baby-photos/${babyInfo.babyId}`, token, {
                    method: 'PUT',
                    body: formData,
                });

                // console.log('Baby photo uploaded successfully:', response);
                // const newPhotoUrl = response.filePath;

                // // Update the babyInfo state with the new photo URL
                // setBabyInfo(prevState => ({
                //     ...prevState,
                //     photoUrl: newPhotoUrl
                // }));

                // // Update the selected baby in state and localStorage
                // if (selectedBaby) {
                //     const updatedBaby: BabyInfo = { ...selectedBaby, photoUrl: newPhotoUrl };
                //     setSelectedBaby(updatedBaby);
                //     localStorage.setItem('selectedBaby', JSON.stringify(updatedBaby));
                // } else {
                //     console.warn('No baby is currently selected');
                // }

                // ... 나머지 코드 ...
            }

            console.log('Baby information and photo saved successfully');
            router.push('/home');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(`Error: ${err.response.data.message || 'Unknown error occurred'}`);
            } else {
                setError(`An error occurred while saving the information. Please try again. ${err}`);
            }
            console.error('Error saving baby info:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
            <button
                onClick={handleBackClick}
                className="absolute top-10 left-4 w-10 h-10 flex items-center justify-center"
            >
                <Image
                    src="/img/button/back.png"
                    alt='Back'
                    width={50}
                    height={50}
                />
            </button>
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
        </div>
    );
};

export default InitialSettings;