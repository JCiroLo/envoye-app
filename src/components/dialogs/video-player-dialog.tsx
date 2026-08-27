import * as React from "react";
import { Sparkles, Trash2, Video } from "lucide-react";
import Button from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { VideoSource, VideoSubmission } from "@/types";

const VideoPlayerDialog = ({
  video,
  onClose,
  onDelete,
}: {
  video: VideoSubmission | null;
  onClose: () => void;
  onDelete: (video: VideoSubmission) => void;
}) => {
  const [source, setSource] = React.useState<VideoSource>("original");
  const optimizedAvailable = Boolean(video?.optimizedUrl);
  const url = source === "optimized" ? video?.optimizedUrl : video?.originalUrl;

  React.useEffect(() => {
    setSource(video?.optimizedUrl ? "optimized" : "original");
  }, [video]);

  return (
    <Dialog open={Boolean(video)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-screen max-w-2xl gap-0 overflow-hidden rounded-4xl bg-card p-0">
        {video && (
          <>
            <DialogHeader className="px-6 pb-4 pt-6 pr-14 text-left">
              <DialogTitle>{video.guestName || "Anónimo"}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center gap-2 p-4">
              <Button
                className="w-full"
                size="sm"
                variant={source === "original" ? "default" : "secondary"}
                disabled={!video.originalUrl}
                onClick={() => setSource("original")}
              >
                <Video className="mr-1.5 h-3.5 w-3.5" /> Original
              </Button>
              <Button
                className="w-full"
                size="sm"
                variant={source === "optimized" ? "default" : "secondary"}
                disabled={!optimizedAvailable}
                onClick={() => setSource("optimized")}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Optimizado
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="shrink-0"
                onClick={() => onDelete(video)}
                aria-label="Eliminar video"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="aspect-video bg-black">
              {url ? (
                <video key={url} src={url} autoPlay controls playsInline preload="metadata" className="h-full w-full" />
              ) : (
                <div className="grid h-full place-items-center px-8 text-center text-sm text-white/70">
                  Este archivo ya no está disponible.
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
