import React from 'react';
import { useRouter } from 'next/navigation';

interface CommonContainerProps {
    children: React.ReactNode;
}

const CommonContainer: React.FC<CommonContainerProps> = ({ children }) => {
    const router = useRouter();

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="fixed inset-x-0 top-[115px] bottom-0">
            <div className="w-full h-full bg-white/20 backdrop-blur-xl rounded-t-[40px] shadow-lg overflow-auto border-2 border-white">
                <div className="py-6 flex flex-col items-center">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CommonContainer;