'use client';
import React, { useState, useEffect, useRef } from 'react';
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
    photoUrl?: string;
}

const InitialSettings: React.FC = () => {
    const [userId, setUserId] = useState<number | null>(null);
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

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }
        
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
            const response = await axios.get(`${BACKEND_API_URL}/api/baby-photos/baby/${babyId}`);
            console.log('fetch Photo:',response.data);
           
            if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].photoUrl) {
                // Update avatar source with the fetched photo URL
                setAvatarSrc(response.data[4].filePath);
    
                // Update babyInfo state
                const updatedBabyInfo = {
                    ...babyInfo,
                    photoUrl: response.data[response.data.length-1].filePath
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

    const handleImageSelect = async (file: File | null, imageSrc: string) => {
        setSelectedFile(file);
        setAvatarSrc(imageSrc);

        if (file && babyInfo.babyId && userId) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("babyId", babyInfo.babyId.toString());
                formData.append("userId", userId.toString())

                const response = await axios.put(`${BACKEND_API_URL}/api/baby-photos/${babyInfo.babyId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.status === 200) {
                    console.log('Baby photo updated successfully:', response.data);
                    
                    const newPhotoUrl = response.data.filePath;

                    // Update the babyInfo state with the new photo URL
                    setBabyInfo(prevState => ({
                        ...prevState,
                        photoUrl: newPhotoUrl
                    }));

                    // Update the selected baby in state and localStorage
                    if (selectedBaby) {
                        const updatedBaby: BabyInfo = { ...selectedBaby, photoUrl: newPhotoUrl };
                        setSelectedBaby(updatedBaby);
                        localStorage.setItem('selectedBaby', JSON.stringify(updatedBaby));
                    } else {
                        console.warn('No baby is currently selected');
                    }
                } else {
                    setError('아이의 사진을 업데이트하는데 실패했습니다. 다시 시도해주세요.');
                }

            } catch (error) {
                console.error('Error updating baby photo:', error);
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 404) {
                        setError('아이의 사진을 찾을 수 없습니다. 새로운 사진을 업로드해주세요.');
                    } else {
                        setError(`아이의 사진을 업데이트하는 중 오류가 발생했습니다: ${error.response.data}`);
                    }
                } else {
                    setError('아이의 사진을 업데이트하는 중 알 수 없는 오류가 발생했습니다.');
                }
            }
        }
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
        const formattedBabyInfo = {
            ...babyInfo,
            birth: new Date(babyInfo.birth + 'T00:00:00').toISOString(),
            userId: userId
        };

        let response;
        if (formattedBabyInfo.babyId) {
            // 기존 아기 정보 업데이트
            response = await axios.put(`${BACKEND_API_URL}/api/baby/${formattedBabyInfo.babyId}`, formattedBabyInfo);
        } else {
            // 새 아기 정보 생성
            response = await axios.post(`${BACKEND_API_URL}/api/baby`, formattedBabyInfo);
        }
        
        const babyId = response.data.babyId;

        // baby-photo 로직
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("babyId", babyId.toString());
            formData.append("userId", userId.toString());

            // POST 대신 PUT 사용
            await axios.put(`${BACKEND_API_URL}/api/baby-photos/${babyId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // ... 나머지 코드 ...
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