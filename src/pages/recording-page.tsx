import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import GuestCapture from "@/components/guest-capture";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import { FramedSurface } from "@/components/event-frame";
import useGuestSubmissionStore from "@/stores/use-guest-submission-store";
import useEventStore from "@/stores/use-event-store";

const RecordingPage = () => {
  const { accessCode = "" } = useParams();
  const navigate = useNavigate();
  const state = useGuestSubmissionStore();
  const settings = useEventStore((store) => store.event?.settings);
  const allowText = settings?.allowText !== false;
  const hasMediaOptions = settings?.allowImages !== false || settings?.allowVideos !== false || settings?.allowAudio !== false;
  const hasContent = Boolean(state.media || (allowText && state.messageText.trim()));

  const continueFlow = () => {
    if (hasContent) navigate(`/invite/${accessCode}/privacy`);
  };

  return (
    <PageShell>
      <PageTransition>
        <section className="mx-auto max-w-3xl">
          <FramedSurface className="p-8 sm:p-12">
            <div className="text-center">
              <p className="text-sm font-extrabold uppercase tracking-[.18em] text-primary">
                Tu felicitación
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Deja un recuerdo</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {allowText ? "Escribe un mensaje si quieres y añade una sola foto, video o nota de voz." : "Elige una foto, video o nota de voz para tu felicitación."}
              </p>
            </div>
            <div className="mt-7">
              <div className="mb-4 ">
                <p className="text-sm font-bold text-foreground">Foto, video o audio</p>
                <p className="mt-1 text-xs text-muted-foreground">Solo puedes adjuntar un archivo multimedia.</p>
              </div>
              {state.media ? (
                <div className="mx-auto max-w-xl">
                  <div className="overflow-hidden rounded-2xl border border-border bg-foreground shadow-inner">
                    {state.mediaPreviewUrl && state.mediaType === "image" && (
                      <img
                        src={state.mediaPreviewUrl}
                        alt="Previsualización"
                        className="aspect-video w-full object-contain"
                      />
                    )}
                    {state.mediaPreviewUrl && state.mediaType === "video" && (
                      <video src={state.mediaPreviewUrl} controls className="aspect-video w-full" />
                    )}
                    {state.mediaPreviewUrl && state.mediaType === "audio" && (
                      <div className="flex aspect-video items-center justify-center bg-primary p-8">
                        <audio src={state.mediaPreviewUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => state.setMedia(null)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Cambiar opción
                  </Button>
                </div>
              ) : hasMediaOptions ? (
                <GuestCapture settings={settings} onCapture={(file, type) => state.setMedia(file, type)} />
              ) : (
                <p className="rounded-2xl bg-muted p-5 text-center text-sm text-muted-foreground">Este evento no recibe archivos multimedia.</p>
              )}
            </div>
            {allowText && <div className="mt-8">
              <label className="text-sm font-bold text-foreground">
                Mensaje <span className="font-medium text-muted-foreground">(opcional)</span>
              </label>
              <textarea
                value={state.messageText}
                onChange={(event) => state.setMessageText(event.target.value)}
                placeholder="Escribe algo bonito…"
                className="mt-2 block min-h-28 w-full resize-none rounded-2xl border border-input bg-background p-4 text-sm leading-6 text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
              />
            </div>}
            <div className="mt-8 flex justify-center space-x-4">
              <Link to={`/invite/${accessCode}`}>
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
              </Link>
              <Button disabled={!hasContent} onClick={continueFlow}>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FramedSurface>
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default RecordingPage;
