'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ResetChatModal from '../modal/ResetChatModal';
import { Search, ChevronLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Baby } from '@/types/index';
import { jwtDecode } from 'jwt-decode';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/useAuth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Message {
  userId: number;
  babyId: number;
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

const DummyChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [babyPhoto, setBabyPhoto] = useState<string>("/img/mg-logoback.png");
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const { token, userId, error: authError } = useAuth();
  const { babyId } = useBabySelection();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !composing) {
      handleSendMessage();
    }
  };

  const handleCompositionStart = () => {
    setComposing(true);
  };

  const handleCompositionEnd = () => {
    setComposing(false);
  };

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

  const handleResetChat = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetChat = async () => {
    if (!token || userId === null || babyId === null) {
      setError('사용자 정보나 인증 토큰이 없습니다.');
      return;
    }

    try {
      // await axios.post(`${BACKEND_API_URL}/api/chat/reset/${userId}/${babyId}`, {}, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      await fetchWithAuth(`${BACKEND_API_URL}/api/chat/reset/${userId}/${babyId}`, token, {
        method: 'POST',
      });
      setMessages([]);
      setIsResetModalOpen(false);
    } catch (error) {
      console.error('Error resetting chat history:', error);
      setError('채팅 내역 초기화에 실패했습니다.');
    }
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
    if (!token) return;
    console.log('chatbot page token: ', token);
    console.log('chatbot page userId: ', userId);
    if (userId) {
      fetchBabiesInfo(userId).then(() => {
        console.log('Babies fetched and set');
      });
    }
  }, [token]);

  // userId나 babyId가 변경될 때 메시지를 가져오는 useEffect 추가
  useEffect(() => {
    if (userId && babyId && token) {
      console.log('babyId', babyId);
      fetchMessages();
    }
  }, [userId, babyId, token]);

  // 아이 정보 가져오기
  useEffect(() => {
    if (userId) {
      fetchBabiesInfo(userId);
    }
  }, [userId]);

  const fetchBabiesInfo = async (userId: number) => {
    if (!token) return;
    try {
      const userResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby/user/${userId}`, token, {
        method: 'GET',
      });

      if (userResponse && Array.isArray(userResponse) && userResponse.length > 0) {

        const fetchedBabies: Baby[] = await Promise.all(userResponse.map(async (baby: any) => {
          const photoResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby-photos/baby/${baby.babyId}`, token, {
            method: 'GET',
          });
          return {
            userId: baby.userId,
            babyId: baby.babyId,
            babyName: baby.babyName,
            photoUrl: photoResponse[0]?.filePath || "/img/mg-logoback.png"
          };
        }));

        setBabies(fetchedBabies);

        // localStorage에서 저장된 선택된 아이 정보 확인
        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        if (storedSelectedBaby) {
          const parsedSelectedBaby = JSON.parse(storedSelectedBaby);
          const foundBaby = fetchedBabies.find(baby => baby.babyId === parsedSelectedBaby.babyId);
          if (foundBaby) {
            setSelectedBaby(foundBaby);
          } else {
            // 저장된 아이가 현재 목록에 없으면 첫 번째 아이 선택
            setSelectedBaby(fetchedBabies[0]);
            localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
          }
        } else {
          // 저장된 선택 정보가 없으면 첫 번째 아이 선택
          setSelectedBaby(fetchedBabies[0]);
          localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
        }
      } else {
        console.log("No baby information found for this user.");
        localStorage.removeItem('selectedBaby');
      }
    } catch (error) {
      console.error('Failed to fetch baby information:', error);
      localStorage.removeItem('selectedBaby');
    }
  };

  const fetchMessages = async () => {
    if (!token || userId === null || babyId === null) {
      setError('사용자 정보나 인증 토큰이 없습니다.');
      return;
    }

    try {
      const response = await fetchWithAuth(`${BACKEND_API_URL}/api/chat/history/${userId}/${babyId}`, token, {
        method: 'GET',
      });
      const formattedMessages = response.map((msg: any) => ({
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
    console.log('Sending message. userId:', userId, 'babyId:', babyId, 'authToken:', token, 'inputMessage:', inputMessage);

    if (inputMessage.trim() === '' || userId === null || babyId === null) {
      setError('메시지를 전송할 수 없습니다. 모든 정보가 올바르게 설정되었는지 확인해 주세요.');
      return;
    }

    console.log('Sending token:', token);

    const newMessage: Message = {
      userId: userId,
      babyId: babyId,
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    try {
      if (!token) return;
      const response = await fetchWithAuth(`${BACKEND_API_URL}/api/chat/send`, token, {
        method: 'POST',
        body: {
          userId: userId,
          babyId: babyId,
          content: inputMessage,
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
      });

      console.log('Server response:', response);

      if (response && response.content) {
        const botResponse: Message = {
          userId: userId,
          babyId: babyId,
          id: Date.now(),
          text: response.content,
          sender: 'bot',
          timestamp: new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Unexpected response format from server');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response);
        console.error('Response status:', error.response?.status);
      }
      setError('메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }

    setTimeout(scrollToBottom, 100);
  };

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="w-full max-w-md mt-8 flex justify-between items-center px-4 gap-4">
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
          <button
            onClick={handleBackClick}
            className="absolute top-9 left-4 w-10 h-10 flex items-center justify-center"
          >
            <Image
              src="/img/button/back.png"
              alt='Back'
              width={50}
              height={50}
            />
          </button>
          <Dropdown>
            <DropdownTrigger>
              <button className="focus:outline-none focus:ring-0 w-[45px] h-[45px] rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src={selectedBaby?.photoUrl || "/img/mg-logoback.png"}
                  alt="Baby Photo"
                  width={45}
                  height={45}
                  className="rounded-full object-cover object-center w-[45px] h-[45px]"
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
        {/* 채팅 초기화 아이콘 */}
        <button
          onClick={handleResetChat}
          className="ml-2 p-2 rounded-full hover:bg-gray-200 transition duration-200"
          aria-label="채팅 초기화"
        >
          <Trash2 size={20} color="#6B46C1" />
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-center my-2">
          {error}
        </div>
      )}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-hidden scrollbar-hide w-full"
        style={{
          marginTop: '10px',
          marginBottom: '190px',
          height: 'calc(100vh - 160px)',
          overflowY: 'auto',
        }}
      >
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={`${message.id}-${index}`}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end text-gray-800' : 'justify-start text-gray-800'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-white'
                  }`}
              >
                <p className="message-text">{message.text}</p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">메시지가 없습니다.</div>
        )}
        <div ref={messagesEndRef} />
        <ResetChatModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onReset={confirmResetChat}
        />
      </div>
      <div className="fixed bottom-32 left-5 right-5 p-4 flex items-center">
        <div className="flex items-center max-w-screen-lg mx-auto w-full">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="메시지를 입력하세요..."
            className="flex-1 py-2 px-4 rounded-full border-2 border-purple-300 focus:outline-none focus:border-purple-500 text-gray-700"
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