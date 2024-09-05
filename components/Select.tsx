import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
    options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({ className, options, ...props }) => {
    return (
        <div className="w-full max-w-[193px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto bg-white bg-opacity-40 backdrop-blur-md rounded-[15px] border-2 border-white shadow-md overflow-hidden">
            <div className="w-full h-[28px] flex items-center justify-center">
                <select
                    className={`w-full h-full bg-transparent border-none outline-none px-3 text-sm appearance-none ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Select;