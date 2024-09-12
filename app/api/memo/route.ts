import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

// 날짜 포맷 함수
const formatDateForBackend = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

// 메모 타입 정의
type Memo = {
  memoId?: number;
  userId: number;
  todayId: number | null;
  bookId: number | null;
  date: string;
  content: string;
};

// 메모 생성
export const createMemo = async (memo: Omit<Memo, 'memoId'>): Promise<Memo> => {
  const response = await axios.post(`${BACKEND_API_URL}/api/memos`, memo);
  return response.data;
};

// 특정 날짜의 메모 조회
export const getMemosByDate = async (date: Date): Promise<Memo[]> => {
  const formattedDate = formatDateForBackend(date);
  const response = await axios.get(`${BACKEND_API_URL}/api/memos/date/${formattedDate}`);
  return response.data;
};

// 메모 수정
export const updateMemo = async (id: number, memoDetails: Partial<Memo>): Promise<Memo> => {
  const response = await axios.put(`${BACKEND_API_URL}/api/memos/${id}`, memoDetails);
  return response.data;
};

// 메모 삭제
export const deleteMemo = async (id: number): Promise<void> => {
  await axios.delete(`${BACKEND_API_URL}/api/memos/${id}`);
};

// 날짜 범위로 메모 조회
export const getMemosByDateRange = async (startDate: Date, endDate: Date): Promise<Memo[]> => {
  const response = await axios.get(`${BACKEND_API_URL}/api/memos/date-range`, {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  });
  return response.data;
};

// 모든 메모 조회
export const getAllMemos = async (): Promise<Memo[]> => {
  const response = await axios.get(`${BACKEND_API_URL}/api/memos`);
  return response.data;
};

// 특정 ID의 메모 조회
export const getMemoById = async (id: number): Promise<Memo> => {
  const response = await axios.get(`${BACKEND_API_URL}/api/memos/${id}`);
  return response.data;
};