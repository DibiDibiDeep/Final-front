import React from 'react';

interface EditContainerProps {
    children: React.ReactNode;
}

const EditContainer: React.FC<EditContainerProps> = ({ children }) => {
    return (
        <div className="fixed inset-x-0 top-[450px] bottom-0 flex justify-center items-center">
            <div className="w-full h-full bg-white/20 backdrop-blur-xl rounded-t-[40px] shadow-lg overflow-auto border-2 border-white">
                <div className="py-10 flex flex-col items-center">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default EditContainer;