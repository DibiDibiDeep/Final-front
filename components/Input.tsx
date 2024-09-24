import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <div className="w-full mx-auto bg-white bg-opacity-40 backdrop-blur-md rounded-[15px] border-2 border-white shadow-md overflow-hidden">
            <div className="w-full h-[28px] flex items-center justify-center">
                <input
                    className={`w-full h-full bg-transparent border-none outline-none px-2 text-sm ${className}`}
                    style={{ minWidth: '100%' }}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;