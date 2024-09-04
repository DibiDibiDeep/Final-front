'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, Plus, BookHeart, User, LucideIcon } from 'lucide-react';

interface IconButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    style: string;
    size?: number;
    color?: string;
}

const IconButton: React.FC<IconButtonProps> = React.memo(({ icon: Icon, onClick, style, size = 24, color }) => (
    <button className={style} onClick={onClick}>
        <Icon size={size} color={color} />
    </button>
));
IconButton.displayName = 'IconButton';

const BottomContainer: React.FC = () => {
    const router = useRouter();
    const [selectedButton, setSelectedButton] = useState('home');

    const handleButtonClick = useCallback((buttonName: string, path: string) => {
        setSelectedButton(buttonName);
        router.push(path);
    }, [router]);

    const handlePlusButtonClick = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files) {
                console.log('Selected files:', files);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    console.log('Selected file:', file.name);
                    console.log('File size:', file.size);
                    console.log('File type:', file.type);
                }
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }, []);

    const getButtonStyle = useCallback((buttonName: string) => {
        if (buttonName === 'plus') {
            return `p-4 rounded-full bg-purple-600 absolute -top-8 shadow-lg`;
        }
        return selectedButton === buttonName
            ? "p-2 rounded-full bg-purple-600 text-white"
            : "p-2 text-primary";
    }, [selectedButton]);

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full h-[100px] bg-white bg-opacity-40 backdrop-blur-md border-t-2 border-white shadow-md rounded-[40px] z-30">
            <div className="w-full h-full flex items-center justify-around px-4 relative">
                <IconButton icon={Home} onClick={() => handleButtonClick('home', '/home')} style={getButtonStyle('home')} />
                <IconButton icon={ClipboardList} onClick={() => handleButtonClick('diary', '/diary')} style={getButtonStyle('diary')} />
                <IconButton
                    icon={Plus}
                    onClick={handlePlusButtonClick}
                    style={getButtonStyle('plus')}
                    size={32}
                    color="white"
                />
                <IconButton icon={BookHeart} onClick={() => handleButtonClick('story', '/story')} style={getButtonStyle('story')} />
                <IconButton icon={User} onClick={() => handleButtonClick('profile', '/profile')} style={getButtonStyle('profile')} />
            </div>
        </div>
    );
};

BottomContainer.displayName = 'BottomContainer';

export default React.memo(BottomContainer);