'use client';
import React, { useState } from 'react';
import axios from 'axios';
import CommonContainer from '@/components/CommonContainer';
import AvatarWithUpload from './AvatarWithUpload';
import Input from '@/components/Input';
import Image from 'next/image';
import Select from '@/components/Select';

interface BabyInfo {
    babyName: string;
    birth: string | undefined;
    gender: string;
}

async function submitBabyInfo(babyInfo: BabyInfo) {
    const response = await axios.post('/api/initialSettings', babyInfo);
    return response.data;
}

const InitialSettings: React.FC = () => {
    const [babyName, setBabyName] = useState<string>('');
    const [birth, setBirth] = useState<Date | null>(null);
    const [gender, setGender] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        setBirth(dateValue ? new Date(dateValue) : null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await submitBabyInfo({
                babyName,
                birth: birth?.toISOString().split('T')[0], // 'YYYY-MM-DD' 형식으로 변환
                gender
            });

            console.log('Server response:', response);
            // 여기에 성공 처리 로직을 추가하세요 (예: 성공 메시지 표시, 다음 페이지로 이동 등)
        } catch (err) {
            setError('정보 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
            console.error('Error submitting baby info:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CommonContainer>
            <div className="flex flex-col items-center justify-between pt-[20px] pb-6">
                <div className="flex flex-col items-center w-full max-w-[90%] sm:max-w-md">
                    <AvatarWithUpload />
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-5 w-full mt-16 sm:mt-24 md:mt-28">
                        <div className="w-full flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                아이 이름
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="아이 이름"
                                onChange={(e) => setBabyName(e.target.value)}
                                className='text-gray-700 flex-grow'
                            />
                        </div>
                        <div className="w-full flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="birth" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                생일
                            </label>
                            <Input
                                id="birth"
                                type="date"
                                onChange={handleBirthChange}
                                className='text-gray-700 flex-grow'
                            />
                        </div>
                        <div className="w-full flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="gender" className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 sm:w-24">
                                성별
                            </label>
                            <Select
                                id="gender"
                                onChange={(e) => setGender(e.target.value)}
                                className='text-gray-700 flex-grow'
                                options={[
                                    { value: 'male', label: '남자' },
                                    { value: 'female', label: '여자' },
                                ]}
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="pt-12 sm:pt-16 md:pt-20"
                            disabled={isLoading}
                        >
                            <Image
                                src="/img/button/confirm_circle.png"
                                alt='Confirm'
                                width={70}
                                height={70}
                                className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-50' : ''}`}
                            />
                        </button>
                    </form>
                </div>
            </div>
        </CommonContainer>
    );
};

export default InitialSettings;