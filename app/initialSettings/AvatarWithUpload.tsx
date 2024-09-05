'use client';

import React, { useState } from 'react';
import { Avatar } from '@nextui-org/react';

const AvatarWithUpload: React.FC = () => {
    const [avatarSrc, setAvatarSrc] = useState<string>("/img/mg-logoback.png");

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative inline-block mt-10">
            <Avatar
                isBordered color="primary"
                src={avatarSrc} // 기본 이미지 경로 또는 선택된 이미지
                className="w-32 h-32 text-large border-4 border-transparent rounded-full"
                style={{
                    background: "transparent",
                }}
            />
            <label htmlFor="imageUpload" className="absolute bottom-0 right-0">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-xl shadow-lg border-1 border-white rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-primary text-xl">+</span>
                </div>
                <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                />
            </label>
        </div>
    );
};

export default AvatarWithUpload;
