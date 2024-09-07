'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, Plus, BookHeart, User, LucideIcon } from 'lucide-react';
import axios from 'axios';
import { getImageUrl } from '@/utils/getImageUrl';
import { processImage } from '@/utils/processImage';

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

    const uploadImage = async (file: File, userId: number, babyId: number) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('user_id', userId.toString());
        formData.append('baby_id', babyId.toString());

        try {
            const response = await axios.post('/api/calendar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Image uploaded successfully:', response.data);

            // Get the image URL
            const imageUrl = await getImageUrl(response.data.key);
            console.log('Image URL:', imageUrl);

            // Process the image
            await processImage({ imageUrl, userId, babyId });
        } catch (error) {
            console.error('Error uploading or processing image:', error);
        }
    };

    const handlePlusButtonClick = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const file = files[0];
                console.log('Selected file:', file.name);
                console.log('File size:', file.size);
                console.log('File type:', file.type);

                const userId = 1; // Example value, replace with actual user ID in real implementation
                const babyId = 2; // Example value, replace with actual baby ID in real implementation

                await uploadImage(file, userId, babyId);
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
        <>
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
        </>
    );
};

BottomContainer.displayName = 'BottomContainer';
export default React.memo(BottomContainer);