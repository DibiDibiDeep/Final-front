'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

const dummyMessages: Message[] = [
  { id: 1, text: "안녕하세요! 무엇을 도와드릴까요?", sender: 'bot', timestamp: '10:00' },
  { id: 2, text: "날씨가 어떤지 알려줘", sender: 'user', timestamp: '10:01' },
  { id: 3, text: "오늘의 날씨는 맑고 기온은 22도입니다.", sender: 'bot', timestamp: '10:01' },
  { id: 4, text: "고마워", sender: 'user', timestamp: '10:02' },
  { id: 5, text: "천만에요. 더 필요한 것이 있으신가요?", sender: 'bot', timestamp: '10:02' },
];

const DummyChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [babyPhoto, setBabyPhoto] = useState<string>("/img/mg-logoback.png");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      // TypeScript에게 firstMatch가 HTMLElement임을 명시적으로 알려줍니다.
      (firstMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    }
  }, [searchTerm]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          text: "죄송합니다. 현재 더미 데이터만 제공 중입니다.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col pb-48">
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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
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