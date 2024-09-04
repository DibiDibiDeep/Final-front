import VideoPlayer from "./VideoPlayer";

interface LoadingProps {
    onStartClick: () => void;
}

export default function Loading({ onStartClick }: LoadingProps) {
    return (
        <>
            <div className="min-h-screen">
                <VideoPlayer onStartClick={onStartClick} />
            </div>
        </>
    )
}