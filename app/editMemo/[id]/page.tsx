'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import EditContainer from '@/components/EditContainer';
import { Input } from '@nextui-org/react';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/authHooks';


type Memo = {
    memoId: number;
    createdAt: string;
    content: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function EditEvent({ params }: { params: { memoId: string } }) {
    const router = useRouter();
    const [memoData, setMemoData] = useState<Memo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, error: authError } = useAuth();
    
    useEffect(() => {
        const fetchMemo = async () => {
            try {
                const response = await fetchWithAuth(`${BACKEND_API_URL}/api/memos/${params.memoId}`, { method: 'GET' });
                setMemoData(response.data);
            } catch (error) {
                // console.error('Failed to fetch memo:', error);
                setError('Failed to load memo data');
            }
        };

        fetchMemo();
    }, [params.memoId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setMemoData(prev => prev ? { ...prev, [id]: value } : null);
    };

    const handleUpdateMemo = async () => {
        if (!memoData) return;
        setIsLoading(true);
        setError('');
        try {
            await fetchWithAuth(`${BACKEND_API_URL}/api/memos/${memoData.memoId}`, { method: 'PUT', body: memoData });
            router.push('/home');
        } catch (error) {
            // console.error('Failed to update memo:', error);
            setError('Failed to update memo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="fixed top-[37px] right-[23px]">
                <button
                    className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center"
                    onClick={handleUpdateMemo}
                    disabled={isLoading || !memoData}
                >
                    <Image
                        src="/img/button/confirm.png"
                        alt='Confirm'
                        width={50}
                        height={50}
                        className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-50' : ''}`}
                    />
                </button>
            </div>
            <div className="min-h-screen pt-[110px]">
                <EditContainer>
                    <div className="flex flex-col space-y-4 pt-[5px]">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="content" className="text-sm font-medium text-gray-700 whitespace-nowrap w-24">
                                내용
                            </label>
                            <Input
                                id="content"
                                type="text"
                                placeholder="Enter content"
                                value={memoData?.content || ''}
                                onChange={handleInputChange}
                                className='text-gray-700'
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </EditContainer>
            </div>
        </div>
    );
}
