'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Baby } from '@/types/index';
import { jwtDecode } from 'jwt-decode';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface Message {
  userId: number;
  babyId: number;
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface Session {
  userId: number;
  email: string;
  token: string;
  // 필요한 다른 세션 정보들을 여기에 추가할 수 있습니다.
}

// 더미 세션 데이터
const DUMMY_SESSION: Session = {
  userId: 3,
  email: 'mmongeul@gmail.com',
  token: 'dummy-token-for-development'
};

const dummyMessages: Message[] = [
  { userId: 0, babyId: 0, id: 1, text: "안녕하세요! 무엇을 도와드릴까요?", sender: 'bot', timestamp: '10:00' }
];

const DummyChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [babyPhoto, setBabyPhoto] = useState<string>("/img/mg-logoback.png");
  const [userId, setUserId] = useState<number | null>(null);
  const [babyId, setBabyId] = useState<number | null>(null);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleBabySelect = (baby: Baby) => {
    setSelectedBaby(baby);
    setBabyPhoto(baby.photoUrl || "/img/mg-logoback.png");
    localStorage.setItem('selectedBaby', JSON.stringify(baby));
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (searchTerm && chatContainerRef.current) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      const elements = chatContainerRef.current.getElementsByClassName('message-text');
      let firstMatch: HTMLElement | null = null;

      Array.from(elements).forEach((el) => {
        const element = el as HTMLElement;
        const html = element.innerText.replace(regex, '<mark style="background-color: yellow; color: black;">$1</mark>');
        element.innerHTML = html;
        
        if (!firstMatch && html !== element.innerText) {
          firstMatch = element;
        }
      });

      if (firstMatch) {
        (firstMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedToken: any = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        setToken(storedToken);
        setUserId(decodedToken.userId);
        console.log('Stored token:', storedToken); // 디버깅을 위한 로그
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('토큰 디코딩에 실패했습니다. 다시 로그인해 주세요.');
      }
    } else {
      setError('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }
  
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const parsedUserId = JSON.parse(storedUserId);
      setUserId(parsedUserId);
    }

    const storedSelectedBaby = localStorage.getItem('selectedBaby');
    if (storedSelectedBaby) {
      const selectedBabyObj = JSON.parse(storedSelectedBaby);
      setBabyId(selectedBabyObj.babyId);
      setSelectedBaby(selectedBabyObj);
    }
  }, []);

  // userId나 babyId가 변경될 때 메시지를 가져오는 useEffect 추가
  useEffect(() => {
    if (userId !== null && babyId !== null) {
      fetchMessages();
    }
  }, [userId, babyId]);

  const fetchMessages = async () => {
    if (!token || userId === null || babyId === null) {
      setError('사용자 정보나 인증 토큰이 없습니다.');
      return;
    }
  
    try {
      const response = await axios.get(`${BACKEND_API_URL}/api/chat/history/${userId}/${babyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const formattedMessages = response.data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('메시지를 불러오는데 실패했습니다.');
    }
  };

  const handleSendMessage = async () => {
    setError(null); // Clear any previous errors
    console.log('Sending message. userId:', userId, 'babyId:', babyId, 'inputMessage:', inputMessage);

    if (inputMessage.trim() === '' || userId === null || babyId === null) {
      setError('메시지를 전송할 수 없습니다. 모든 정보가 올바르게 설정되었는지 확인해 주세요.');
      return;
    }

    console.log('Sending token:', token);
  
    const newMessage: Message = {
      userId: userId,
      babyId: babyId,
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      try {
        const response = await axios.post(`${BACKEND_API_URL}/api/chat/send`, {
          userId: userId,
          babyId: babyId,
          content: inputMessage,
          sender: 'user',
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Server response:', response.data);

        if (response.data && response.data.content) {
          const botResponse: Message = {
            userId: userId,
            babyId: babyId,
            id: messages.length + 2,
            text: response.data.content,
            sender: 'bot',
            timestamp: new Date(response.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        } else {
          console.error('Unexpected response format:', response.data);
          throw new Error('Unexpected response format from server');
        }

      } catch (error) {
        console.error('Error sending message:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
        }
        setError('메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    
      setTimeout(scrollToBottom, 100);
    };

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="w-full max-w-md mt-8 flex justify-between items-center px-4">
        <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={handleBackClick}
            className="absolute top-9 left-4 w-10 h-10 flex items-center justify-center"
            >
            <ChevronLeft size={24} color="#6B46C1" />
            </button>
            <Dropdown>
                <DropdownTrigger>
                    <button className="focus:outline-none focus:ring-0 w-[45px] h-[45px] rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                            src={selectedBaby?.photoUrl || "/img/mg-logoback.png"}
                            alt="Baby Photo"
                            width={45}
                            height={45}
                            className="rounded-full object-cover object-center"
                        />
                    </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Baby Selection">
                    {babies.map((baby) => (
                        <DropdownItem key={baby.babyId} onPress={() => handleBabySelect(baby)}>
                            <div className="flex items-center">
                                <Image
                                    src={baby.photoUrl || "/img/mg-logoback.png"}
                                    alt={`Baby ${baby.babyId}`}
                                    width={30}
                                    height={30}
                                    className="rounded-full mr-2 object-cover w-8 h-8"
                                />
                                <span className="text-gray-700">{baby.babyName}</span>
                            </div>
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>

        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 p-2 pr-10 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-md"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-hidden scrollbar-hide"
        style={{
          marginTop: '10px', // 상단 고정 영역의 높이만큼 여백
          marginBottom: '190px', // 하단 입력 영역의 높이만큼 여백
          height: 'calc(100vh - 160px)',
          overflowY: 'auto', // 전체 높이에서 상하단 영역 높이를 뺌
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-white'
              }`}
            >
              <p className="message-text">{message.text}</p>
              <span className="text-xs text-gray-400 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="fixed bottom-32 left-5 right-5 p-4 flex items-center">
        <div className="flex items-center max-w-screen-lg mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 py-2 px-4 rounded-full border-2 border-purple-300 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-full font-bold hover:bg-purple-700 transition duration-200"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default DummyChatInterface;