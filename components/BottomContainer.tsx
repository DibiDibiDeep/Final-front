'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, PlusCircle, X, BookHeart, User, Camera, Image, LucideIcon } from 'lucide-react';
import OptionButton from './OptionButton'; // Import the updated OptionButton component

interface IconButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    style: string;
    size?: number;
    color?: string;
}

const IconButton = React.memo(({ icon: Icon, onClick, style, size = 24, color }: IconButtonProps) => (
    <button className={style} onClick={onClick}>
        <Icon size={size} color={color} />
    </button>
));

const BottomContainer: React.FC = () => {
    const router = useRouter();
    const [selectedButton, setSelectedButton] = useState('home');
    const [showOptions, setShowOptions] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const plusButtonRef = useRef<HTMLButtonElement>(null);

    const handleButtonClick = useCallback((buttonName: string, path: string) => {
        setSelectedButton(buttonName);
        router.push(path);
    }, [router]);

    const handlePlusButtonPress = useCallback(() => {
        if (showOptions) {
            setShowOptions(false);
        } else {
            longPressTimer.current = setTimeout(() => setShowOptions(true), 500);
        }
    }, [showOptions]);

    const handlePlusButtonRelease = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    }, []);

    const handleOptionClick = useCallback((option: string) => {
        console.log(`Selected option: ${option}`);
        setShowOptions(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                plusButtonRef.current &&
                !plusButtonRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.option-button')
            ) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getButtonStyle = useCallback((buttonName: string) => {
        if (buttonName === 'memo') {
            return `p-4 rounded-full ${showOptions ? 'bg-white' : 'bg-purple-600'} absolute -top-8 shadow-lg transition-colors duration-300`;
        }
        return selectedButton === buttonName
            ? "p-2 rounded-full bg-purple-600 text-white"
            : "p-2 text-primary";
    }, [selectedButton, showOptions]);

    const optionsClassName = useMemo(() =>
        `absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-6 transition-all duration-300 ${showOptions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`,
        [showOptions]);

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full h-[100px] bg-white bg-opacity-40 backdrop-blur-md border-t-2 border-white shadow-md rounded-[40px] z-30">
            <div className="w-full h-full flex items-center justify-around px-4 relative">
                <IconButton icon={Home} onClick={() => handleButtonClick('home', '/home')} style={getButtonStyle('home')} />
                <IconButton icon={ClipboardList} onClick={() => handleButtonClick('diary', '/diary')} style={getButtonStyle('diary')} />
                <button
                    ref={plusButtonRef}
                    className={getButtonStyle('memo')}
                    onClick={handlePlusButtonPress}
                    onMouseDown={handlePlusButtonPress}
                    onMouseUp={handlePlusButtonRelease}
                    onTouchStart={handlePlusButtonPress}
                    onTouchEnd={handlePlusButtonRelease}
                >
                    {showOptions ? <X size={32} color="#4A4A4A" /> : <PlusCircle size={32} color="white" />}
                </button>
                <div className={optionsClassName}>
                    <OptionButton icon={Camera} onClick={() => handleOptionClick('camera')} backgroundColor="#c83dff" iconType='camera' />
                    <OptionButton icon={Image} onClick={() => handleOptionClick('gallery')} backgroundColor="#8e3dff" iconType='gallery' />
                </div>
                <IconButton icon={BookHeart} onClick={() => handleButtonClick('story', '/story')} style={getButtonStyle('story')} />
                <IconButton icon={User} onClick={() => handleButtonClick('profile', '/profile')} style={getButtonStyle('profile')} />
            </div>
        </div>
    );
};

export default React.memo(BottomContainer);
