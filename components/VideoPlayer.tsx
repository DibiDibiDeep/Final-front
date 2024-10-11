'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
    onStartClick: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onStartClick }) => {
    const [isEnded, setIsEnded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    const handleVideoEnd = useCallback(() => {
        setIsEnded(true);
        setTimeout(() => setShowButton(true), 1000);
    }, []);

    const handleStart = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(console.error);
            router.push('/login');
            setIsEnded(false);
            setShowButton(false);
        }
        onStartClick(); // Call the prop function to notify parent
    }, [router, onStartClick]);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.addEventListener('ended', handleVideoEnd);
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            video.muted = true;
            video.load();
            video.play().catch(error => {
                // console.error('Auto-play was prevented:', error);
            });
        }
        return () => video?.removeEventListener('ended', handleVideoEnd);
    }, [handleVideoEnd]);

    return (
        <div className="relative w-full h-screen flex items-center justify-center bg-black">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src="/img/loading.mp4"
                playsInline
                muted
            />
            {isEnded && (
                <button
                    onClick={handleStart}
                    className={`
            absolute bottom-[115px] left-1/2 transform -translate-x-1/2
            w-[230px] h-[65px] text-[#614AD3] text-[20px] font-bold
            bg-white bg-opacity-25 rounded-[30px] border-2 border-white
            shadow-md transition-opacity duration-1000 ease-in-out
            ${showButton ? 'opacity-100' : 'opacity-0'}
            hover:shadow-inner active:shadow-inner active:shadow-gray-400
          `}
                >
                    START
                </button>
            )}
        </div>
    );
};

export default VideoPlayer;