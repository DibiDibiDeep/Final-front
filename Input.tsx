import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    // 추가적인 props 정의
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <div className="w-full max-w-[193px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto bg-white bg-opacity-40 backdrop-blur-md rounded-[15px] border-2 border-white shadow-md overflow-hidden">
            <div className="w-full h-[28px] flex items-center justify-center">
                <input
                    className={`w-full h-full bg-transparent border-none outline-none px-3 text-sm ${className}`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;