import React, { useState, useEffect } from 'react';
import { Avatar } from '@nextui-org/react';
import { useAuth } from '@/hooks/authHooks';

interface AvatarWithUploadProps {
    onImageSelect: (file: File | null, imageSrc: string, token: string) => void;
    initialAvatarSrc: string;
}

const AvatarWithUpload: React.FC<AvatarWithUploadProps> = ({ onImageSelect, initialAvatarSrc }) => {
    const [avatarSrc, setAvatarSrc] = useState<string>(initialAvatarSrc);
    const { token } = useAuth();

    useEffect(() => {
        setAvatarSrc(initialAvatarSrc);
    }, [initialAvatarSrc]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!token) return;
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== "image/jpeg" && file.type !== "image/png") {
                alert("Only JPG and PNG files are allowed.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const newAvatarSrc = reader.result as string;
                setAvatarSrc(newAvatarSrc);
                onImageSelect(file, newAvatarSrc, token);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarSrc("/img/mg-logoback.png");
            onImageSelect(null, "/img/mg-logoback.png", token);
        }
    };

    return (
        <div className="relative inline-block mt-10">
            <Avatar
                isBordered
                color="primary"
                src={avatarSrc}
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
                    accept="image/jpeg, image/png"
                    className="hidden"
                    onChange={handleImageChange}
                />
            </label>
        </div>
    );
};

export default AvatarWithUpload;