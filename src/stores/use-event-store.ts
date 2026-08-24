import { create } from "zustand";
import type { EventTheme } from "@/lib/event-theme";
import { api } from "@/lib/api";

export type PublicEvent = {
  name: string;
  event_date: string | null;
  welcome_message_text: string | null;
  invitation_frame: string;
  theme_name: EventTheme;
  allow_text: boolean;
  allow_images: boolean;
  allow_videos: boolean;
  allow_audio: boolean;
  cover_url: string | null;
  cover_placeholder_url: string | null;
};

type EventStore = {
  event: PublicEvent | null;
  accessCode: string | null;
  loading: boolean;
  error: string;
  setEvent: (event: PublicEvent | null) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  loadEvent: (accessCode: string) => Promise<void>;
  clearEvent: () => void;
};

const useEventStore = create<EventStore>((set, get) => ({
  event: null,
  accessCode: null,
  loading: false,
  error: "",
  setEvent: (event) => set({ event }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  loadEvent: async (accessCode) => {
    const normalizedCode = accessCode.trim().toUpperCase();
    const current = get();

    if (current.accessCode === normalizedCode && (current.event || current.loading || current.error)) return;

    set({ accessCode: normalizedCode, event: null, error: "", loading: true });

    try {
      const { event } = await api<{ event: PublicEvent }>(`/api/public/events/${normalizedCode}`);
      if (get().accessCode === normalizedCode) set({ event, loading: false });
    } catch (error) {
      if (get().accessCode === normalizedCode) {
        set({ error: error instanceof Error ? error.message : "No pudimos cargar el evento", loading: false });
      }
    }
  },
  clearEvent: () => set({ event: null, accessCode: null, error: "", loading: false }),
}));

export default useEventStore;
