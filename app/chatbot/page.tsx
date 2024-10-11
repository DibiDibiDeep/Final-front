'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ResetChatModal from '../modal/ResetChatModal';
import { Search, RotateCcw, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Baby } from '@/types/index';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/authHooks';
import toast from 'react-hot-toast';

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
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [composing, setComposing] = useState(false);
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const { token, userId, error: authError } = useAuth();
  const { babyId } = useBabySelection();

  const router = useRouter();

  const handleSearchFocus = () => setIsSearchFocused(true);

  const handleSearchBlur = () => setIsSearchFocused(false);

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

  const scrollToMatch = (index: number) => {
    if (chatContainerRef.current && index >= 0 && index < searchMatches.length) {
      const elements = chatContainerRef.current.getElementsByClassName('message-text');
      const element = elements[searchMatches[index]] as HTMLElement;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevMatch = () => {
    if (currentMatchIndex > 0) {
      const newIndex = currentMatchIndex - 1;
      setCurrentMatchIndex(newIndex);
      scrollToMatch(newIndex);
    }
  };

  const handleNextMatch = () => {
    if (currentMatchIndex < searchMatches.length - 1) {
      const newIndex = currentMatchIndex + 1;
      setCurrentMatchIndex(newIndex);
      scrollToMatch(newIndex);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchMatches([]);
    setCurrentMatchIndex(-1);
    clearHighlights();
  };

  const handleSearch = useCallback(() => {
    if (searchTerm && chatContainerRef.current) {
      const regex = new RegExp(searchTerm, 'gi');
      const elements = chatContainerRef.current.getElementsByClassName('message-text');
      const newMatches: number[] = [];

      Array.from(elements).forEach((el, index) => {
        const element = el as HTMLElement;
        if (regex.test(element.innerText)) {
          newMatches.push(index);
        }
      });

      setSearchMatches(newMatches);
      setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);

      if (newMatches.length > 0) {
        scrollToMatch(0);
      }

      highlightMatches();
    } else {
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
      clearHighlights();
    }
  }, [searchTerm]);

  const highlightMatches = () => {
    if (chatContainerRef.current) {
      const elements = chatContainerRef.current.getElementsByClassName('message-text');
      Array.from(elements).forEach((el, index) => {
        const element = el as HTMLElement;
        if (searchMatches.includes(index)) {
          const regex = new RegExp(`(${searchTerm})`, 'gi');
          element.innerHTML = element.innerText.replace(regex, '<mark style="background-color: yellow; color: black;">$1</mark>');
        } else {
          element.innerHTML = element.innerText;
        }
      });
    }
  };

  const clearHighlights = () => {
    if (chatContainerRef.current) {
      const elements = chatContainerRef.current.getElementsByClassName('message-text');
      Array.from(elements).forEach((el) => {
        const element = el as HTMLElement;
        element.innerHTML = element.innerText;
      });
    }
  };

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

  // const confirmResetChat = async () => {
  //   if (!token || userId === null || babyId === null) {
  //     setError('사용자 정보나 인증 토큰이 없습니다.');
  //     return;
  //   }

  //   try {
  //     await fetchWithAuth(`${BACKEND_API_URL}/api/chat/reset/${userId}/${babyId}`, token, {
  //       method: 'DELETE',
  //     });
  //     setMessages([]);
  //     setIsResetModalOpen(false);
  //   } catch (error) {
  //     console.error('Error resetting chat history:', error);
  //     setError('채팅 내역 초기화에 실패했습니다.');
  //   }
  // };

  const confirmResetChat = async () => {
    if (userId === null || babyId === null) {
      // console.error('User ID or Baby ID is not available');
      return;
    }

    try {
      // 서버에 채팅 히스토리 리셋 요청 보내기
      await fetchWithAuth(`${BACKEND_API_URL}/api/chat/reset/${userId}/${babyId}`, {
        method: 'POST',
      });

      // 화면에 표시된 메시지 초기화
      setMessages([]);

      // 로컬 스토리지에서 채팅 캐시 삭제
      localStorage.removeItem(`chatCache_${userId}_${babyId}`);

      // 사용자에게 초기화 완료 메시지 표시
      setError('채팅 내역이 삭제되었습니다.');
      setTimeout(() => setError(null), 3000); // 3초 후 메시지 제거

      // 모달 닫기
      setIsResetModalOpen(false);
    } catch (error) {
      // console.error('Failed to reset chat history:', error);
      setError('채팅 내역 삭제에 실패했습니다.');
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [handleSearch, searchTerm]);

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

  // useEffect(() => {
  //   const storedToken = localStorage.getItem('authToken');
  //   if (storedToken) {
  //     try {
  //       const decodedToken: any = jwtDecode(storedToken);
  //       const currentTime = Date.now() / 1000;
  //       setToken(storedToken);
  //       setUserId(decodedToken.userId);
  //       console.log('Stored token:', storedToken); // 디버깅을 위한 로그
  //     } catch (error) {
  //       console.error('Error decoding token:', error);
  //       setError('토큰 디코딩에 실패했습니다. 다시 로그인해 주세요.');
  //     }
  //   } else {
  //     setError('인증 토큰이 없습니다. 로그인이 필요합니다.');
  //   }

  //   const storedUserId = localStorage.getItem('userId');
  //   if (storedUserId) {
  //     const parsedUserId = JSON.parse(storedUserId);
  //     setUserId(parsedUserId);
  //   }

  //   const storedSelectedBaby = localStorage.getItem('selectedBaby');
  //   if (storedSelectedBaby) {
  //     const selectedBabyObj = JSON.parse(storedSelectedBaby);
  //     setBabyId(selectedBabyObj.babyId);
  //     setSelectedBaby(selectedBabyObj);
  //   }
  // }, []);

  useEffect(() => {
    if (!token) return;
    // console.log('chatbot page token: ', token);
    // console.log('chatbot page userId: ', userId);
    if (userId) {
      fetchBabiesInfo(userId).then(() => {
        // console.log('Babies fetched and set');
      });
    }
  }, [token]);

  // userId나 babyId가 변경될 때 메시지를 가져오는 useEffect 추가
  useEffect(() => {
    if (userId && babyId && token) {
      // console.log('babyId', babyId);
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
      const userResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby/user/${userId}`, {
        method: 'GET',
      });

      if (userResponse && Array.isArray(userResponse) && userResponse.length > 0) {

        const fetchedBabies: Baby[] = await Promise.all(userResponse.map(async (baby: any) => {
          const photoResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby-photos/baby/${baby.babyId}`, {
            method: 'GET',
          });
          return {
            userId: baby.userId,
            babyId: baby.babyId,
            babyName: baby.babyName,
            gender: baby.gender,
            birth: baby.birth,
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
       // console.log("No baby information found for this user.");
        localStorage.removeItem('selectedBaby');
      }
    } catch (error) {
      // console.error('Failed to fetch baby information:', error);
      localStorage.removeItem('selectedBaby');
    }
  };

  const fetchMessages = async () => {
    if (!token || userId === null || babyId === null) {
      setError('사용자 정보나 인증 토큰이 없습니다.');
      return;
    }

    try {
      const response = await fetchWithAuth(`${BACKEND_API_URL}/api/chat/history/${userId}/${babyId}`, {
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
      // console.error('Error fetching messages:', error);
      setError('메시지를 불러오는데 실패했습니다.');
    }
  };

  const handleSendMessage = async () => {
    setError(null); // Clear any previous errors
    // console.log('Sending message. userId:', userId, 'babyId:', babyId, 'authToken:', token, 'inputMessage:', inputMessage);

    if (inputMessage.trim() === '' || userId === null || babyId === null) {
      setError('메시지를 전송할 수 없습니다. 모든 정보가 올바르게 설정되었는지 확인해 주세요.');
      return;
    }
    setIsWaitingForBot(true);
    // console.log('Sending token:', token);

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

      const payload = {
        userId: userId,
        babyId: babyId,
        content: inputMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
        id: Date.now()
      };

      const response = await fetchWithAuth(`${BACKEND_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // console.log('Server response:', response);

      if (response && response.content) {
        let botContent = response.content;
        // 날짜 부분 제거
        botContent = botContent.replace(/^\d{4}-\d{2}-\d{2}: /, '');
        const botResponse: Message = {
          userId: userId,
          babyId: babyId,
          id: Date.now(),
          text: botContent,
          sender: 'bot',
          timestamp: new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setBotMessages(prevBotMessages => [...prevBotMessages, botResponse]);

        // ML 서버에서 일기 저장 완료시
        if (response.diarySaved) {
          toast.success('일기가 성공적으로 저장되었습니다.', {
            duration: 3000,
            position: 'top-center',
          });
        }
      } else {
        // console.error('Unexpected response format:', response);
        throw new Error('서버로부터 유효한 응답을 받지 못했습니다.');
      }

    } catch (error) {
      // console.error('Error sending message:', error);
      setError('메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      toast.error('메시지 전송에 실패했습니다.', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsWaitingForBot(false);
    }
    setTimeout(scrollToBottom, 100);
  };

  //   const handleSaveDiary = async (content: any) => {
  //     if (!userId || !babyId || isProcessingSave) {
  //         console.error('User ID or Baby ID is not available or save is already in progress');
  //         return;
  //     }

  //     setIsProcessingSave(true);

  //     const currentDate = new Date().toISOString().split('T')[0];

  //     try {
  //       const response = await fetchWithAuth(`${BACKEND_API_URL}/api/today-sum`, {
  //           method: 'POST',
  //           headers: {
  //               'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //               userId: userId,
  //               babyId: babyId,
  //               content: content, // 챗봇의 응답 내용을 저장
  //               date: currentDate,
  //           }),
  //       });

  //         if (response.status === 200) {
  //             console.log('Diary saved successfully');
              
  //             // 성공 메시지를 채팅 메시지로 추가
  //             const successMessage: Message = {
  //                 userId: userId,
  //                 babyId: babyId,
  //                 id: Date.now(),
  //                 text: "일기가 저장되었습니다.",
  //                 sender: 'bot',
  //                 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  //             };
  //             setMessages(prevMessages => [...prevMessages, successMessage]);

  //             // 토스트 메시지 표시
  //             toast.success('일기가 성공적으로 저장되었습니다.');
  //         } else {
  //             console.error('Invalid server response:', response);
  //             throw new Error('일기 저장에 실패했습니다. 다시 시도해주세요.');
  //         }
  //     } catch (error) {
  //         console.error('Failed to save diary:', error);
  //         toast.error('일기 저장에 실패했습니다. 다시 시도해주세요.');
  //     } finally {
  //         setIsProcessingSave(false);
  //     }
  // };

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="w-full max-w-md mt-8 flex justify-between items-center px-4 gap-4">
        <div className="flex items-center gap-2 lg:w-1/5">
          <button
            onClick={handleBackClick}
            className="w-10 h-10 flex items-center justify-center lg:absolute lg:left-4"
          >
            <Image
              src="/img/button/back.png"
              alt='Back'
              width={40}
              height={40}
            />
          </button>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <div className={`flex items-center bg-white rounded-full transition-all duration-300 ${isSearchFocused ? 'shadow-lg' : 'shadow'}`}>
              <div className="pl-4">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full py-2 px-3 rounded-full focus:outline-none"
              />
              {searchTerm && (
                <div className="flex items-center">
                  {searchMatches.length > 0 && (
                    <>
                      <button onClick={handlePrevMatch} aria-label="이전 검색 결과">
                        <ChevronUp size={16} className="text-gray-500" />
                      </button>
                      <button onClick={handleNextMatch} aria-label="다음 검색 결과">
                        <ChevronDown size={16} className="text-gray-500" />
                      </button>
                    </>
                  )}
                  <button onClick={handleClearSearch} className="p-1 ml-2 pr-4" aria-label="검색 초기화">
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleResetChat}
          className="rounded-full hover:bg-gray-200 transition duration-200 mr-4"
          aria-label="채팅 초기화"
        >
          <RotateCcw size={20} color="#6B46C1" />
        </button>
      </div>
      {error && (
        <div className="absolute text-red-500 text-center pt-64">
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
          <div className="text-center text-gray-500 mt-60">메시지가 없습니다.</div>
        )}
        <div ref={messagesEndRef} />
        <ResetChatModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onReset={confirmResetChat}
          userId={userId}
          babyId={babyId}
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
            disabled={isWaitingForBot}
            className="flex-1 py-2 px-4 rounded-full border-2 border-purple-300 focus:outline-none focus:border-purple-500 text-gray-700"
          />
          <button
            onClick={handleSendMessage}
            className={`ml-2 bg-purple-600 text-white px-4 py-2 rounded-full font-bold transition duration-200 ${
              isWaitingForBot
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-purple-700'
            }`}
            disabled={isWaitingForBot}
          >
            {isWaitingForBot ? '전송' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DummyChatInterface;