import { Memo } from "@/types";

export const saveMemos = (memos: Memo[]): void => {
    localStorage.setItem('memos', JSON.stringify(memos));
  };
  
  export const loadMemos = (): Memo[] => {
    const storedMemos = localStorage.getItem('memos');
    return storedMemos ? JSON.parse(storedMemos) : [];
  };