import React from 'react';
import { LucideIcon } from 'lucide-react';

const isMobileDevice = () => {
    return typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent);
};

interface OptionButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    backgroundColor: string;
    iconType: 'camera' | 'gallery';
}

const OptionButton = React.memo(({ icon: Icon, onClick, backgroundColor, iconType }: OptionButtonProps) => {
    const handleCameraClick = async () => {
        if (isMobileDevice()) {
            // 모바일: 기본 카메라 앱 실행
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // 스트림을 사용하여 비디오 요소에 출력 가능
                // console.log('Mobile camera stream:', stream);
                onClick();
            } catch (err) {
                // console.error("Error accessing mobile camera", err);
            }
        } else {
            // 웹: 웹캠 실행
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // 웹캠 스트림을 처리하는 로직
                // console.log('Webcam stream:', stream);
                onClick();
            } catch (err) {
                // console.error("Error accessing webcam", err);
            }
        }
    };

    const handleGalleryClick = () => {
        // 파일 입력 요소를 만들고 대화상자 열기
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // 이미지 파일만 선택 가능
        input.style.display = 'none'; // 요소를 화면에 보이지 않게 함
        input.onchange = (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files) {
                // 선택한 파일들을 처리
                // console.log('Selected files:', files);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    // console.log('Selected file:', file.name);
                    // console.log('File size:', file.size);
                    // console.log('File type:', file.type);
                }
                onClick();
            }
        };

        document.body.appendChild(input);
        input.click(); // 파일 선택 대화상자를 엽니다.
        document.body.removeChild(input); // 파일 선택 후 요소 제거
    };

    const handleClick = () => {
        if (iconType === 'camera') {
            handleCameraClick();
        } else if (iconType === 'gallery') {
            handleGalleryClick();
        } else {
            onClick();
        }
    };

    return (
        <button
            className="option-button p-4 rounded-full text-white shadow-md transform transition-transform hover:scale-110"
            style={{ backgroundColor }}
            onClick={handleClick}
        >
            <Icon size={28} />
        </button>
    );
});

OptionButton.displayName = 'OptionButton';

export default OptionButton;
