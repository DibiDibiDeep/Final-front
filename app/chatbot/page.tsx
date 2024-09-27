'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(IS_DEVELOPMENT ? DUMMY_SESSION : null);


  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
    if (!IS_DEVELOPMENT) {
      // 실제 환경에서만 로컬 스토리지에서 세션 정보를 로드
      const storedSession = localStorage.getItem('session');
      const storedSelectedBaby = localStorage.getItem('selectedBaby');
      
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }

      if (storedSelectedBaby) {
        try {
          const selectedBabyObj = JSON.parse(storedSelectedBaby);
          setBabyId(selectedBabyObj.babyId);
        } catch (error) {
          console.error('Error parsing selectedBaby:', error);
          setError('Error loading baby information. Please try logging in again.');
        }
      }
      
      if (!storedSession || !storedSelectedBaby) {
        setError('Session or baby information not found. Please log in again.');
      }
    }
  }, []);

  useEffect(() => {
    // Fetch previous messages when session and babyId are available
    if (session && babyId) {
      console.log('Fetching messages for userId:', session.userId, 'and babyId:', babyId);
      fetchMessages();
    }
  }, [session, babyId]);

  const fetchMessages = async () => {
    if (userId === null || babyId === null) {
      setError('User ID or Baby ID is not available');
      console.error('User ID or Baby ID is not available');
      return;
    }
  
    try {
      const response = await axios.get(`${BACKEND_API_URL}/api/chat/history/${userId}/${babyId}`);
      const formattedMessages = response.data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    setError(null); // Clear any previous errors
    console.log('Sending message. userId:', userId, 'babyId:', babyId, 'inputMessage:', inputMessage);

    if (inputMessage.trim() !== ''  && session && babyId !== null) {
      const newMessage: Message = {
        userId: session.userId,
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
          userId: session.userId,
          babyId: babyId,
          content: inputMessage,
          sender: 'user',
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${session.userId}` // 만약 JWT를 사용한다면
          }
        });
        
        console.log('Server response:', response.data);
        console.log('session', session)

        if (response.data && response.data.content) {
          const botResponse: Message = {
            userId: session.userId,
            babyId: babyId,
            id: messages.length + 2,
            text: response.data.content,
            sender: 'bot',
            timestamp: new Date(response.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        } else {
          console.error('Unexpected response format:', response.data);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        // 사용자에게 오류 메시지를 표시
        const errorMessage: Message = {
          userId: session.userId,
          babyId: babyId,
          id: messages.length + 2,
          text: "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } else {
      console.error('Cannot send message: input is empty or userId/babyId is not set');
    }
    setTimeout(scrollToBottom, 100);
  };

  return (
    <div className="flex flex-col pb-32 pt-6 h-screen">
      <div className="fixed top-[37px] right-[23px] flex items-center space-x-[13px] z-30">
        <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
          <Image
            src={babyPhoto}
            alt="Baby Photo"
            width={45}
            height={45}
            className="w-full h-full object-cover"
          />
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
        className="flex-1 overflow-hidden"
        style={{
          marginTop: '80px', // 상단 고정 영역의 높이만큼 여백
          marginBottom: '80px', // 하단 입력 영역의 높이만큼 여백
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