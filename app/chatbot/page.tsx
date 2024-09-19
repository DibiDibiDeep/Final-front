'use client'

import React, { useState, useEffect, useRef } from 'react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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
      
      // 봇의 응답 시뮬레이션
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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4"  style={{ maxHeight: 'calc(100vh - 120px)' }}>
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
              <p>{message.text}</p>
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