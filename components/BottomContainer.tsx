import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, BookHeart, User, Plus, StickyNote, Scan, Mic, Calendar } from 'lucide-react';
import { useBottomContainer } from '@/contexts/BottomContainerContext';

interface IconButtonProps {
    icon: React.ElementType;
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
    const {
        activeView,
        setActiveView,
        handleAddSchedule,
        handleCreateMemo,
        handleVoiceRecord,
        handleScanButtonClick
    } = useBottomContainer();

    const [showOptions, setShowOptions] = useState(false);

    const handleButtonClick = useCallback((buttonName: string, path: string) => {
        setActiveView(buttonName as 'home' | 'diary' | 'story' | 'profile');
        router.push(path);
    }, [router, setActiveView]);

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const closeOptions = () => {
        setShowOptions(false);
    };

    // Effect for closing the options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const optionsContainer = document.getElementById('options-container');
            if (optionsContainer && !optionsContainer.contains(event.target as Node)) {
                closeOptions();
            }
        };

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    const getButtonStyle = useCallback((buttonName: string): string => {
        if (buttonName === 'action') {
            return `p-4 rounded-full bg-purple-600 absolute -top-8`;
        }
        if (buttonName === 'home') {
            return activeView === 'home' || activeView === 'todo' || activeView === 'memo'
                ? "p-2 rounded-full bg-purple-600 text-white"
                : "p-2 text-primary";
        }
        return activeView === buttonName
            ? "p-2 rounded-full bg-purple-600 text-white"
            : "p-2 text-primary";
    }, [activeView]);

    const renderActionButton = () => (
        <IconButton
            icon={Plus}
            onClick={toggleOptions}
            style={getButtonStyle('action')}
            size={32}
            color="white"
        />
    );

    const renderOptions = () => (
        <div
            id="options-container"
            className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[200px] h-[200px] bg-white rounded-full shadow-lg flex justify-center items-center p-8 transition-transform transition-opacity duration-300 ease-out 
        ${showOptions ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
            <div className="relative w-[160px] h-[160px]">
                <div className="flex flex-col items-center absolute top-0 left-1/2 transform -translate-x-1/2">
                    <IconButton
                        icon={Scan}
                        onClick={() => { handleScanButtonClick(); setShowOptions(false); }}
                        style="p-2 rounded-full bg-violet-400 text-white"
                        size={24}
                    />
                    <span className="text-xs text-center text-gray-700 mt-1">스캔</span>
                </div>
                <div className="flex flex-col items-center absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2">
                    <IconButton
                        icon={Calendar}
                        onClick={() => { handleAddSchedule(); setShowOptions(false); }}
                        style="p-2 rounded-full bg-violet-500 text-white"
                        size={24}
                    />
                    <span className="text-xs text-center text-gray-700 mt-1">일정</span>
                </div>
                <div className="flex flex-col items-center absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <IconButton
                        icon={StickyNote}
                        onClick={() => { handleCreateMemo(); setShowOptions(false); }}
                        style="p-2 rounded-full bg-purple-400 text-white"
                        size={24}
                    />
                    <span className="text-xs text-center text-gray-700 mt-1">메모</span>
                </div>
                <div className="flex flex-col items-center absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
                    <IconButton
                        icon={Mic}
                        onClick={() => { handleVoiceRecord(); setShowOptions(false); }}
                        style="p-2 rounded-full bg-purple-500 text-white"
                        size={24}
                    />
                    <span className="text-xs text-center text-gray-700 mt-1">음성 메모</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full h-[100px] z-30">
            {showOptions && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-20"
                    onClick={closeOptions}
                />
            )}

            <div className="relative w-full h-full bg-white bg-opacity-40 backdrop-blur-md border-t border-gray-200 shadow-md rounded-[40px] z-30">
                <div className="w-full h-full flex items-center justify-around px-4 relative">
                    <IconButton icon={Home} onClick={() => handleButtonClick('home', '/home')} style={getButtonStyle('home')} />
                    <IconButton icon={ClipboardList} onClick={() => handleButtonClick('diary', '/diary')} style={getButtonStyle('diary')} />
                    {renderActionButton()}
                    {showOptions && renderOptions()}
                    <IconButton icon={BookHeart} onClick={() => handleButtonClick('story', '/story')} style={getButtonStyle('story')} />
                    <IconButton icon={User} onClick={() => handleButtonClick('profile', '/profile')} style={getButtonStyle('profile')} />
                </div>
            </div>
        </div>
    );
};

export default React.memo(BottomContainer);