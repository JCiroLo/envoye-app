import { create } from "zustand";

export type GuestMediaType = "image" | "video" | "audio";

type GuestSubmissionStore = {
  messageText: string;
  guestName: string;
  media: File | null;
  mediaPreviewUrl: string | null;
  mediaType: GuestMediaType | null;
  consented: boolean;
  setMessageText: (value: string) => void;
  setGuestName: (value: string) => void;
  setMedia: (file: File | null, type?: GuestMediaType | null) => void;
  setConsented: (value: boolean) => void;
  reset: () => void;
};

const revoke = (url: string | null) => {
  if (url) URL.revokeObjectURL(url);
};

const useGuestSubmissionStore = create<GuestSubmissionStore>((set, get) => ({
  messageText: "",
  guestName: "",
  media: null,
  mediaPreviewUrl: null,
  mediaType: null,
  consented: false,
  setMessageText: (messageText) => set({ messageText }),
  setGuestName: (guestName) => set({ guestName }),
  setMedia: (media, mediaType = null) => {
    revoke(get().mediaPreviewUrl);
    set({ media, mediaType, mediaPreviewUrl: media ? URL.createObjectURL(media) : null });
  },
  setConsented: (consented) => set({ consented }),
  reset: () => {
    revoke(get().mediaPreviewUrl);
    set({ messageText: "", guestName: "", media: null, mediaPreviewUrl: null, mediaType: null, consented: false });
  },
}));

export default useGuestSubmissionStore;
