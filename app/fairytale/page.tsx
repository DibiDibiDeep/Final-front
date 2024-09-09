'use client';
import React, { useState } from 'react';
import axios from 'axios';

interface DiaryData {
    name: string;
    emotion: string;
    health: string;
    nutrition: string;
    activities: string[];
    social: string;
    special: string;
    keywords: string[];
    diary: string;
    user_id: number;
    baby_id: number;
    role: string;
}

interface FairyTale {
    title: string;
    pages: {
        text: string;
        image_url: string;
    }[];
}

const FairyTaleGenerator: React.FC = () => {
    const [fairyTale, setFairyTale] = useState<FairyTale | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [storageResult, setStorageResult] = useState<string | null>(null);

    const generateAndStoreFairyTale = async () => {
        setLoading(true);
        setError(null);
        setStorageResult(null);

        const data: DiaryData = {
            name: "지수",
            emotion: "즐거움과 신남",
            health: "활기차고 건강함",
            nutrition: "식사에 대한 정보는 제공되지 않음",
            activities: [
                "아이스크림 가게 역할놀이",
                "놀이터에서 놀기",
                "붓으로 그림 그리기"
            ],
            social: "친구들과 함께 즐겁게 놀며 웃음소리를 나누었음",
            special: "아이스크림 가게 역할을 진지하게 맡아 연기함",
            keywords: [
                "아이스크림",
                "역할놀이",
                "놀이터",
                "그림",
                "웃음",
                "잠자리"
            ],
            diary: "오늘은 정말 신나는 하루였어! 😄 \n아침에 일어나서 기분이 너무 좋았어. ☀️ \n나는 친구들과 함께 아이스크림 가게 역할놀이를 했어. 🍦 \n내가 아이스크림 가게 주인 역할을 맡았는데, 진짜로 가게를 운영하는 것처럼 연기했어! 🎭 \n친구들이 와서 다양한 맛의 아이스크림을 주문했어. \n우리는 서로 웃으면서 즐거운 시간을 보냈어! 😂 \n\n그 다음에는 놀이터로 갔어. 🛝 \n미끄럼틀도 타고, 그네도 타고, 정말 신났어! \n친구들과 함께 뛰어놀면서 웃음소리가 끊이지 않았어. 🎉 \n놀이터에서의 시간은 항상 너무 재밌어! \n\n마지막으로 붓으로 그림을 그렸어. 🎨 \n색깔이 너무 예쁘고, 내 그림이 멋지게 나왔어! \n오늘 하루는 정말 즐거웠고, 나는 건강하고 활기차! 💪 \n내일도 이렇게 신나는 하루가 되길 바래! 🌈",
            user_id: 1,
            baby_id: 1,
            role: "child"
        };

        try {
            // 동화 생성
            const response = await axios.post<FairyTale>('http://localhost:8000/generate_fairytale', data);
            setFairyTale(response.data);

            // 생성된 동화 저장
            const storageResponse = await axios.post('/api/store_fairytale', response.data);
            setStorageResult(`동화가 성공적으로 저장되었습니다. Book ID: ${storageResponse.data.bookId}`);
        } catch (err) {
            setError('동화를 생성하거나 저장하는 중 오류가 발생했습니다.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">지수의 동화 생성기</h1>
            <button
                onClick={generateAndStoreFairyTale}
                className="w-full bg-primary hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out text-lg mb-4"
                disabled={loading}
            >
                {loading ? '동화 생성 및 저장 중...' : '지수의 하루로 동화 만들기'}
            </button>
            {/* {error && <p className="text-red-500 mt-2 text-center">{error}</p>} */}
            {storageResult && <p className="text-green-500 mt-2 text-center">{storageResult}</p>}
            {fairyTale && (
                <div className="mt-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">{fairyTale.title}</h2>
                    {fairyTale.pages.map((page, index) => (
                        <div key={index} className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
                            <p className="mb-4 text-sm text-gray-700 leading-relaxed">{page.text}</p>
                            <img
                                src={page.image_url}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto rounded-lg shadow-sm"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FairyTaleGenerator;
