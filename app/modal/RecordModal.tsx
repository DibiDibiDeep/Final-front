import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X } from 'lucide-react';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (audioBlob: Blob) => void;
}

const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, onSave }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                onSave(audioBlob);
            };
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">음성 메모 녹음</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-2xl font-bold text-gray-700">
                        {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                    </div>
                    {isRecording ? (
                        <button
                            onClick={stopRecording}
                            className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <Square size={32} />
                        </button>
                    ) : (
                        <button
                            onClick={startRecording}
                            className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition-colors"
                        >
                            <Mic size={32} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordModal;