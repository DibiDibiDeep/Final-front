import React, { useState, useEffect } from 'react';
import { Avatar } from '@nextui-org/react';
import axios from 'axios';

interface AvatarWithUploadProps {
  onImageUpload: (imageSrc: string) => void;
}

const AvatarWithUpload: React.FC<AvatarWithUploadProps> = ({ onImageUpload }) => {
    const [avatarSrc, setAvatarSrc] = useState<string>("/img/mg-logoback.png");

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
                onImageUpload(newAvatarSrc);  // 상위 컴포넌트에 새 이미지 URL 전달
            };
            reader.readAsDataURL(file);

            // Upload to server
            try {
                const babyResponse = await axios.post('http://localhost:8080/api/baby', {
                });

                const newBabyId = babyResponse.data.babyId;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("babyId", newBabyId.toString());

                const photoResponse = await axios.post('http://localhost:8080/api/baby-photos', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Baby created and photo uploaded successfully:', photoResponse.data);
            } catch (error) {
                console.error('Error creating baby or uploading photo:', error);
                alert('Failed to create baby or upload photo. Please try again.');
            }
        }
    };

    return (
        <div className="relative inline-block mt-10">
            <Avatar
                isBordered color="primary"
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