import * as React from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  CircleAlert,
  Clapperboard,
  Clock3,
  Film,
  Image,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Video,
  Mic,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sileo } from "sileo";
import { api, getAdminToken } from "@/lib/api";
import VideoPlayerDialog from "@/components/dialogs/video-player-dialog";
import Button from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import { formatDate, formatDuration } from "@/utils/date-tools";
import type { MediaSubmission } from "@/types";

const statusLabels: Record<MediaSubmission["processingStatus"], string> = {
  pending: "En cola",
  processing: "Optimizando",
  ready: "Optimizado",
  failed: "No optimizado",
};

const statusClasses: Record<MediaSubmission["processingStatus"], string> = {
  pending: "bg-amber-500/15 text-amber-700",
  processing: "bg-sky-500/15 text-sky-700",
  ready: "bg-emerald-500/15 text-emerald-700",
  failed: "bg-destructive/15 text-destructive",
};

const VideoRow = ({ video, onOpen }: { video: MediaSubmission; onOpen: (video: MediaSubmission) => void }) => (
  <button
    type="button"
    onClick={() => onOpen(video)}
    className="group flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
  >
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
      {video.mediaType === "image" ? <Image className="h-5 w-5" /> : video.mediaType === "audio" ? <Mic className="h-5 w-5" /> : <Video className="h-5 w-5" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">
        <span className="truncate font-extrabold text-card-foreground">{video.guestName || "Anónimo"}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClasses[video.processingStatus]}`}
        >
          {statusLabels[video.processingStatus]}
        </span>
      </span>
      <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> {formatDate(video.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" /> {formatDuration(video.durationSeconds)}
        </span>
      </span>
      <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          <Film className="h-3.5 w-3.5" /> {video.mediaType === "image" ? "Foto" : video.mediaType === "audio" ? "Audio" : "Video"} · Original{video.optimizedUrl ? " · Optimizado disponible" : ""}
      </span>
    </span>
    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
  </button>
);

const DeleteVideoDialog = ({
  video,
  deleting,
  onCancel,
  onConfirm,
}: {
  video: MediaSubmission | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Dialog open={Boolean(video)} onOpenChange={(open) => !open && onCancel()}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
          <DialogTitle>¿Eliminar este archivo?</DialogTitle>
        <DialogDescription>
          Se eliminarán permanentemente el archivo original y su versión optimizada de este evento.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-2">
        <Button variant="secondary" disabled={deleting} onClick={onCancel}>Cancelar</Button>
        <Button variant="destructive" isLoading={deleting} onClick={onConfirm}>
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar archivo
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const AdminVideoLibraryPage = () => {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = React.useState<MediaSubmission[] | null>(null);
  const [selectedVideo, setSelectedVideo] = React.useState<MediaSubmission | null>(null);
  const [videoToDelete, setVideoToDelete] = React.useState<MediaSubmission | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const loadVideos = React.useCallback(
    async (refresh = false) => {
      const token = getAdminToken();
      if (!token) {
        navigate("/admin/login");
        return;
      }

      refresh ? setRefreshing(true) : setLoading(true);
      try {
        const result = await api<{ media: MediaSubmission[] }>(`/api/events/${eventId}/media`, { token });
        setVideos(result.media);
      } catch (error) {
        sileo.error({
          title: "No pudimos cargar la multimedia",
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, navigate],
  );

  React.useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  const requestDelete = (video: MediaSubmission) => {
    setSelectedVideo(null);
    setVideoToDelete(video);
  };

  const deleteVideo = async () => {
    const token = getAdminToken();
    if (!token || !videoToDelete) return;

    setDeleting(true);
    try {
      await api(`/api/events/${eventId}/media/${videoToDelete.id}`, { method: "DELETE", token });
      setVideos((current) => current?.filter((video) => video.id !== videoToDelete.id) ?? null);
      setVideoToDelete(null);
      sileo.success({ title: "Archivo eliminado", description: "También eliminamos sus archivos asociados." });
    } catch (error) {
      sileo.error({ title: "No pudimos eliminar el archivo", description: error instanceof Error ? error.message : undefined });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell className="w-full z-10" admin>
      <PageTransition>
        <section className="mx-auto w-full max-w-xl pb-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/admin/events/${eventId}`}
              className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Volver al evento
            </Link>
            <Button size="sm" variant="secondary" isLoading={refreshing} onClick={() => void loadVideos(true)}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Actualizar
            </Button>
          </div>

          <div className="mt-7">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-muted-foreground">Biblioteca</p>
            <h1 className="mt-1 text-3xl font-extrabold text-foreground">Contenido multimedia</h1>
            <p className="mt-2 text-sm text-muted-foreground">Fotos, audios y videos enviados por tus invitados.</p>
          </div>

          {loading ? (
            <div className="grid min-h-80 place-items-center">
              <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : videos?.length ? (
            <div className="mt-5 space-y-3">
              {videos.map((video) => (
                <VideoRow key={video.id} video={video} onOpen={setSelectedVideo} />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid min-h-72 place-items-center rounded-4xl border border-dashed border-border bg-card/60 p-8 text-center">
              <div>
                <Clapperboard className="mx-auto h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-extrabold text-foreground">Aún no hay contenido multimedia</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Las fotos, audios y videos que envíen tus invitados aparecerán aquí.
                </p>
              </div>
            </div>
          )}

          {!loading && videos?.some((video) => video.processingStatus === "failed") && (
            <p className="mt-5 flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
              <CircleAlert className="h-4 w-4 shrink-0" /> Algunos archivos no pudieron optimizarse; su versión original
              sigue disponible.
            </p>
          )}
        </section>
      </PageTransition>
      <VideoPlayerDialog video={selectedVideo} onClose={() => setSelectedVideo(null)} onDelete={requestDelete} />
      <DeleteVideoDialog video={videoToDelete} deleting={deleting} onCancel={() => setVideoToDelete(null)} onConfirm={() => void deleteVideo()} />
    </PageShell>
  );
};

export default AdminVideoLibraryPage;
