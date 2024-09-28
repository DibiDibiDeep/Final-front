import React, { forwardRef, CSSProperties, ReactNode } from 'react';

interface MainContainerProps {
    children: ReactNode;
    style?: CSSProperties;
    className?: string;
    topMargin: number;
    [key: string]: any;
}

const MainContainer = forwardRef<HTMLDivElement, MainContainerProps>(
    ({ children, style, className = '', topMargin, ...rest }, ref) => {
        return (
            <div
                ref={ref}
                className={`fixed inset-x-0 bottom-0 transition-all duration-300 ease-in-out z-20 ${className}`}
                style={{
                    ...style,
                    top: `${topMargin}px`,
                    touchAction: 'none',
                }}
                {...rest}
            >
                <div className="w-full h-full bg-white/20 backdrop-blur-xl rounded-t-[40px] shadow-lg overflow-hidden border-2 border-white pb-20">
                    <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
                    <div className="h-full overflow-auto scrollbar-hide">
                        <div className="py-6 flex flex-col items-center">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

MainContainer.displayName = 'MainContainer';

export default MainContainer;