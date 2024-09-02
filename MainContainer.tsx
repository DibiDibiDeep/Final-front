import React from 'react';

interface MainContainerProps {
    children: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
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

export default MainContainer;