'use client';

import React, { useState } from 'react';
import { Avatar } from '@nextui-org/react';
import axios from 'axios';

const AvatarWithUpload: React.FC = () => {
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
                setAvatarSrc(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to server
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("babyId", "1"); // Replace with actual babyId

                const response = await axios.post('http://localhost:8080/api/baby-photos', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Photo uploaded successfully:', response.data);
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Failed to upload photo. Please try again.');
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