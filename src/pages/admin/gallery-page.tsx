import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import Gallery3D from "@/components/gallery-3d";
import { api, getAdminToken } from "@/lib/api";
import useLetterStore from "@/stores/use-letter-store";
import type { EventTheme } from "@/lib/event-theme";

type Submission = {
  id: string;
  guest_name: string | null;
  message_text: string | null;
  media_type: "text" | "image" | "video" | "audio";
  mediaUrl: string | null;
  created_at: string;
};

const AdminGalleryPage = () => {
  const { letters, setLetters } = useLetterStore(
    useShallow((state) => ({
      letters: state.letters,
      setLetters: state.setLetters,
    })),
  );
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const [_, setTheme] = React.useState<EventTheme>();
  React.useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }
    Promise.all([
      api<{ submissions: Submission[] }>(`/api/events/${eventId}/submissions`, { token }),
      api<{ event: { theme_name: EventTheme } }>(`/api/events/${eventId}`, { token }),
    ]).then(([{ submissions }, { event }]) => {
      setTheme(event.theme_name);
      setLetters(
        submissions.map((item) => ({
          id: item.id,
          eventId,
          userName: item.guest_name || "Anónimo",
          message: item.message_text || "",
          mediaType: item.media_type,
          mediaUrl: item.mediaUrl || "",
          createdAt: new Date(item.created_at).getTime(),
        })),
      );
    });
  }, [eventId, navigate]);

  if (!letters)
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Cargando mural…</div>;

  return <Gallery3D eventId={eventId} onBack={() => navigate(`/admin/events/${eventId}`)} />;
};
export default AdminGalleryPage;
