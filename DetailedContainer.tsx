import React from 'react';

interface DetailedContainerProps {
    children: React.ReactNode;
    className?: string;
}

const DetailedContainer: React.FC<DetailedContainerProps> = ({ children, className }) => {
    return (
        <div className={`w-full bg-white bg-opacity-40 backdrop-blur-md rounded-[20px] border-2 border-white shadow-md overflow-hidden ${className || ''}`}>
            {children}
        </div>
    );
};

export default DetailedContainer;