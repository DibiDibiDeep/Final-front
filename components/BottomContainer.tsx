import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, Scan, BookHeart, User, LucideIcon } from 'lucide-react';
import axios from 'axios';
import { getImageUrl } from '@/utils/getImageUrl';
import { processImage } from '@/utils/processImage';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

const formatDateTimeForDisplay = (date: Date): string => {
    return date.toISOString().slice(0, 19).replace('Z', '');
};

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
    const [selectedButton, setSelectedButton] = useState<string>('home');

    const handleButtonClick = useCallback((buttonName: string, path: string) => {
        setSelectedButton(buttonName);
        router.push(path);
    }, [router]);

    const uploadImage = async (file: File, userId: number, babyId: number) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId.toString());
        formData.append('babyId', babyId.toString());

        // ISO 8601 형식으로 현재 날짜 및 시간 추가
        const currentDate = new Date().toISOString();
        formData.append('date', currentDate);

        try {
            console.log('Sending request with formData:', Object.fromEntries(formData));
            const response = await axios.post(`${BACKEND_API_URL}/api/calendar-photos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('서버 응답:', response);

            if (response.data && response.data.filePath) {
                console.log('이미지 업로드 성공:', response.data);
                const imageUrl = response.data.filePath;
                console.log('이미지 URL:', imageUrl);
                return imageUrl;

                // const result = await processImage({ imageUrl, userId, babyId });
                // console.log("결과 : ", result);

                // // 결과를 로컬 스토리지에 저장
                // localStorage.setItem('calendarData', JSON.stringify(result));

                // // 결과 페이지로 이동
                // router.push('/calendarResult');
            } else {
                console.error('서버 응답에 filePath가 없습니다:', response.data);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios 에러:', error.response?.data || error.message);
                if (error.response) {
                    console.error('에러 상태:', error.response.status);
                    console.error('에러 데이터:', error.response.data);
                }
            } else {
                console.error('알 수 없는 에러:', error);
            }
            throw error; // 에러를 상위로 전파
        }
    };

    const handleScanButtonClick = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = async (event: Event) => {
            const target = event.target as HTMLInputElement;
            const files = target.files;
            if (files && files.length > 0) {
                const file = files[0];
                console.log('선택된 파일:', file.name);
                console.log('파일 크기:', file.size);
                console.log('파일 타입:', file.type);

                const userId = 1; // 더미 값
                const babyId = 1; // 더미 값

                await uploadImage(file, userId, babyId);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }, [router]);

    const getButtonStyle = useCallback((buttonName: string): string => {
        if (buttonName === 'scan') {
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
                    icon={Scan}
                    onClick={handleScanButtonClick}
                    style={getButtonStyle('scan')}
                    size={32}
                    color="white"
                />
                <IconButton icon={BookHeart} onClick={() => handleButtonClick('story', '/story')} style={getButtonStyle('story')} />
                <IconButton icon={User} onClick={() => handleButtonClick('profile', '/profile')} style={getButtonStyle('profile')} />
            </div>
        </div>
    );
};

export default React.memo(BottomContainer);