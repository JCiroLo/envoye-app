import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sileo } from "sileo";
import PrivacyDialog from "@/components/dialogs/privacy-dialog";
import Button from "@/components/ui/button";
import GuestCapture from "@/components/guest-capture";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import { FramedSurface } from "@/components/event-frame";
import useGuestSubmissionStore from "@/stores/use-guest-submission-store";
import useEventStore from "@/stores/use-event-store";
import { ApiError, api } from "@/lib/api";

const RecordingPage = () => {
  const { accessCode = "" } = useParams();
  const navigate = useNavigate();
  const state = useGuestSubmissionStore();
  const event = useEventStore((store) => store.event);

  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  const submissionErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      const messages: Record<string, string> = {
        FILE_TOO_LARGE: "El archivo es demasiado grande. Intenta con un video o audio más corto.",
        EVENT_CLOSED: "Este evento ya no está recibiendo felicitaciones.",
        MEDIA_NOT_ALLOWED: "Ese tipo de contenido no está habilitado para este evento.",
        UNSUPPORTED_MEDIA: "No pudimos leer ese archivo. Prueba con otro formato.",
        CONTENT_REQUIRED: "Añade un mensaje o archivo antes de enviarlo.",
        CONSENT_REQUIRED: "Debes aceptar el aviso de privacidad para poder enviarlo.",
        INVALID_MESSAGE: "Revisa el contenido de tu mensaje e inténtalo de nuevo.",
        EVENT_CHECK_FAILED: "No pudimos conectar con el evento. Inténtalo de nuevo en unos momentos.",
        SUBMISSION_SAVE_FAILED: "No pudimos guardar tu felicitación. Inténtalo nuevamente.",
      };
      return messages[error.code ?? ""] ?? "No pudimos enviar tu felicitación. Inténtalo de nuevo.";
    }
    return "Revisa tu conexión a internet e inténtalo de nuevo.";
  };

  const hasMediaOptions = event?.allow_images || event?.allow_videos || event?.allow_audio;
  const hasContent = Boolean(state.media || (event?.allow_text && state.messageText.trim()));

  const message = useMemo(() => {
    const text = ["Añada un mensaje personalizado para tu felicitación. Puedes usar"];

    if (event?.allow_text) text.push("texto");
    if (event?.allow_images) text.push("fotos");
    if (event?.allow_videos) text.push("videos");
    if (event?.allow_audio) text.push("notas de voz");

    return text.join(", ");
  }, [event?.allow_text, event?.allow_images, event?.allow_videos, event?.allow_audio]);

  async function send(name: string) {
    if (!hasContent) return;

    if (name) state.setGuestName(name);

    try {
      const form = new FormData();

      if (state.messageText) form.set("messageText", state.messageText);
      if (state.guestName.trim()) form.set("guestName", state.guestName.trim());

      form.set("consentedToPublicDisplay", "true");

      if (state.media) form.set("media", state.media);

      await api(`/api/public/events/${accessCode}/submissions`, { method: "POST", body: form });

      navigate(`/invite/${accessCode}/confirmation`, { state: { submitted: true } });
    } catch (err) {
      sileo.error({
        title: "No pudimos enviar tu mensaje",
        description: submissionErrorMessage(err),
      });
    }
  }

  return (
    <PageShell className="flex items-end" background={event?.cover_url}>
      <PageTransition>
        <section className="mx-auto max-w-3xl">
          <FramedSurface className="p-8 sm:p-12">
            <div className="text-center">
              <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Deja un recuerdo</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{message}.</p>
            </div>
            <div className="mt-7">
              {state.media ? (
                <div className="flex flex-col items-center">
                  {state.mediaPreviewUrl && state.mediaType === "image" && (
                    <img src={state.mediaPreviewUrl} alt="preview" className="max-h-64 rounded-2xl" />
                  )}
                  {state.mediaPreviewUrl && state.mediaType === "video" && (
                    <video src={state.mediaPreviewUrl} controls className="max-h-64 rounded-2xl" />
                  )}
                  {state.mediaPreviewUrl && state.mediaType === "audio" && (
                    <audio src={state.mediaPreviewUrl} controls className="w-full my-2" />
                  )}
                  <Button size="sm" variant="destructive" className="mt-4" onClick={() => state.setMedia(null)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                </div>
              ) : hasMediaOptions ? (
                <GuestCapture
                  settings={{
                    allowImages: event?.allow_images,
                    allowVideos: event?.allow_videos,
                    allowAudio: event?.allow_audio,
                  }}
                  onCapture={(file, type) => state.setMedia(file, type)}
                />
              ) : (
                <p className="rounded-2xl bg-muted p-5 text-center text-sm text-muted-foreground">
                  Este evento no recibe archivos multimedia.
                </p>
              )}
            </div>
            {event?.allow_text && (
              <div className="mt-8">
                <label className="text-sm font-bold text-foreground">
                  Mensaje <span className="font-medium text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  value={state.messageText}
                  onChange={(event) => state.setMessageText(event.target.value)}
                  placeholder="Escribe algo bonito…"
                  className="mt-2 block min-h-28 w-full resize-none rounded-2xl border border-input bg-background p-4 text-sm leading-6 text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
                />
              </div>
            )}
            <div className="mt-8 flex justify-center space-x-4">
              <Link to={`/invite/${accessCode}`}>
                <Button size="lg" variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
              </Link>
              <Button size="lg" disabled={!hasContent} onClick={() => setPrivacyDialogOpen(true)}>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FramedSurface>
        </section>
        <PrivacyDialog open={privacyDialogOpen} onSubmit={send} onClose={() => setPrivacyDialogOpen(false)} />
      </PageTransition>
    </PageShell>
  );
};
export default RecordingPage;
