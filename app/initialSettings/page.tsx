'use client';

import React, { useState } from 'react';
import CommonContainer from '@/components/CommonContainer';
import AvatarWithUpload from './AvatarWithUpload';
import Input from '@/components/Input';

const InitialSettings: React.FC = () => {

    const [babyName, setBabyName] = useState<string>('');
    const [birth, setBirth] = useState<Date | null>(null);
    const [gender, setGender] = useState<string>('');

    const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        setBirth(dateValue ? new Date(dateValue) : null);  // Convert string to Date
    };

    return (
        <CommonContainer>
            <AvatarWithUpload />
            <div className="flex flex-col space-y-5 pt-[100px]">
                <div className="flex items-center space-x-4">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                        아이 이름
                    </label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="아이 이름"
                        onChange={(e) => setBabyName(e.target.value)}
                        className='text-gray-700'
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <label htmlFor="birth" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                        생일
                    </label>
                    <Input
                        id="birth"
                        type="date"
                        onChange={handleBirthChange}  // Use the handler function
                        className='text-gray-700'
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <label htmlFor="gender" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                        성별
                    </label>
                    <Input
                        id="gender"
                        type="text"
                        onChange={(e) => setGender(e.target.value)}
                        className='text-gray-700'
                    />
                </div>
            </div>
        </CommonContainer>
    );
};

export default InitialSettings;
