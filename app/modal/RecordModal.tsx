import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";

// userId와 babyId 추가
interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (audioBlob: Blob, userId: number, babyId: number) => void;
    userId: number;
    babyId: number;
}

const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, onSave, userId, babyId }) => {
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
                // onSave에 userId와 babyId 전달
                onSave(audioBlob, userId, babyId);
            };
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            // console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const handleClose = () => {
        if (isRecording) {
            stopRecording();
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{
                base: "bg-white dark:bg-gray-800",
                header: "border-b border-gray-200 dark:border-gray-700",
                body: "py-6",
                footer: "border-t border-gray-200 dark:border-gray-700"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">음성 메모 녹음</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                            {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </div>
                        {isRecording ? (
                            <Button
                                color="danger"
                                variant="shadow"
                                onPress={stopRecording}
                                className="w-16 h-16 rounded-full"
                            >
                                <Square size={32} />
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                variant="shadow"
                                onPress={startRecording}
                                className="w-16 h-16 rounded-full"
                            >
                                <Mic size={32} />
                            </Button>
                        )}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default RecordModal;
