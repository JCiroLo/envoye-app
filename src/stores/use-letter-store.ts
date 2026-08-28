import { create } from "zustand";

export type Letter = {
  id: string;
  eventId: string;
  userName: string;
  message: string;
  mediaType: "image" | "video" | "audio" | "text";
  mediaUrl: string;
  createdAt: number;
};

type LetterStore = {
  letters: Letter[];
  setLetters: (letters: Letter[]) => void;
  resetStore: () => void;
};

const useLetterStore = create<LetterStore>((set) => ({
  letters: [],
  setLetters: (letters) => {
    set({ letters });
  },
  resetStore: () => {
    set({ letters: [] });
  },
}));

export default useLetterStore;
