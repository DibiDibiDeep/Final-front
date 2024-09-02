'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, PlusCircle, BookHeart, User } from 'lucide-react';

const BottomContainer: React.FC = () => {
    const router = useRouter();
    const [selectedButton, setSelectedButton] = useState('home');

    const handleButtonClick = (buttonName: string, path: string) => {
        setSelectedButton(buttonName);
        router.push(path);
    };

    const getButtonStyle = (buttonName: string) => {
        return selectedButton === buttonName
            ? "p-2 rounded-full bg-purple-600 text-white"
            : "p-2 text-primary";
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full h-[100px] bg-white bg-opacity-40 backdrop-blur-md border-t-2 border-white shadow-md rounded-[40px]">
            <div className="w-full h-full flex items-center justify-around px-4">
                <button className={getButtonStyle('home')} onClick={() => handleButtonClick('home', '/home')}>
                    <Home size={24} />
                </button>
                <button className={getButtonStyle('diary')} onClick={() => handleButtonClick('diary', '/diary')}>
                    <ClipboardList size={24} />
                </button>
                <button className={getButtonStyle('memo')} onClick={() => handleButtonClick('memo', '/memo')}>
                    <PlusCircle size={24} />
                </button>
                <button className={getButtonStyle('story')} onClick={() => handleButtonClick('story', '/story')}>
                    <BookHeart size={24} />
                </button>
                <button className={getButtonStyle('profile')} onClick={() => handleButtonClick('profile', '/profile')}>
                    <User size={24} />
                </button>
            </div>
        </div>
    );
};

export default BottomContainer;