import * as React from "react";
import { ChevronLeftIcon, Clapperboard, Copy, ExternalLink, ImagePlus, Play, QrCode, Square } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sileo } from "sileo";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import Textarea from "@/components/ui/textarea";
// import { EventFrame } from "@/components/event-frame";
import { api, getAdminToken } from "@/lib/api";
import { type EventTheme } from "@/lib/event-theme";
import QrPreviewDialog from "@/components/dialogs/qr-preview-dialog";

type EventData = {
  id: string;
  name: string;
  event_date: string | null;
  welcome_message_text: string | null;
  invitation_frame: string;
  theme_name: EventTheme;
  allow_text: boolean;
  allow_images: boolean;
  allow_videos: boolean;
  allow_audio: boolean;
  cover_optimized_path: string | null;
  status: "draft" | "active" | "closed";
  access_code: string;
};
type QrData = { imageDataUrl: string; inviteUrl: string; accessCode: string };
const blank = {
  name: "",
  eventDate: "",
  welcomeMessageText: "",
  invitationFrame: "classic-letter",
  preset: "lavender",
  allowText: false,
  allowImages: true,
  allowVideos: true,
  allowAudio: true,
};
// const frames = [
//   { id: "classic-letter", label: "Carta" },
//   { id: "floral", label: "Flores" },
//   { id: "gallery", label: "Galería" },
// ];

const AdminEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const token = getAdminToken();
  const [form, setForm] = React.useState(blank);
  const [event, setEvent] = React.useState<EventData | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [acting, setActing] = React.useState(false);
  const [qrLoading, setQrLoading] = React.useState(false);
  const [qr, setQr] = React.useState<QrData | null>(null);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [cover, setCover] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    if (!eventId) return;
    api<{ event: EventData }>(`/api/events/${eventId}`, { token })
      .then(({ event }) => {
        setEvent(event);
        setForm({
          name: event.name,
          eventDate: event.event_date?.slice(0, 16) ?? "",
          welcomeMessageText: event.welcome_message_text ?? "",
          invitationFrame: event.invitation_frame,
          preset: event.theme_name,
          allowText: event.allow_text,
          allowImages: event.allow_images,
          allowVideos: event.allow_videos,
          allowAudio: event.allow_audio,
        });
      })
      .catch((error: Error) => sileo.error({ title: "No pudimos abrir el evento", description: error.message }));
  }, [eventId, navigate, token]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const theme = form.preset as EventTheme;

  const payload = () => ({
    name: form.name,
    eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
    welcomeMessageText: form.welcomeMessageText || null,
    invitationFrame: form.invitationFrame,
    theme,
    allowText: form.allowText,
    allowImages: form.allowImages,
    allowVideos: form.allowVideos,
    allowAudio: form.allowAudio,
  });

  const save = async () => {
    setSaving(true);
    try {
      const result = await api<{ event: EventData }>(eventId ? `/api/events/${eventId}` : "/api/events", {
        method: eventId ? "PATCH" : "POST",
        token: token ?? undefined,
        body: JSON.stringify(payload()),
      });
      const targetId = eventId ?? result.event.id;
      let savedEvent = result.event;
      if (cover) {
        const coverForm = new FormData();
        coverForm.set("cover", cover);
        const uploaded = await api<{ event: EventData }>(`/api/events/${targetId}/cover`, {
          method: "PUT",
          token: token ?? undefined,
          body: coverForm,
        });
        savedEvent = uploaded.event;
        setCover(null);
      }
      sileo.success({ title: eventId ? "Cambios guardados" : "Evento creado" });
      if (!eventId) navigate(`/admin/events/${targetId}`);
      else setEvent(savedEvent);
    } catch (error) {
      sileo.error({ title: "No pudimos guardar", description: error instanceof Error ? error.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!eventId || !event) return;
    const action = event.status === "active" ? "close" : "activate";
    setActing(true);
    try {
      const result = await api<{ event: EventData }>(`/api/events/${eventId}/${action}`, {
        method: "POST",
        token: token ?? undefined,
      });
      setEvent(result.event);
      sileo.success({ title: action === "close" ? "Evento cerrado" : "Evento activado" });
    } catch (error) {
      sileo.error({
        title: "No pudimos actualizar el estado",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setActing(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(event?.access_code ?? "");
      sileo.success({ title: "Código copiado" });
    } catch {
      sileo.error({ title: "No pudimos copiar el código" });
    }
  };

  const generateQr = async () => {
    if (qr) {
      setQrOpen(true);
      return;
    }

    if (!eventId) return;

    setQrLoading(true);

    try {
      setQr(await api<QrData>(`/api/events/${eventId}/qr`, { token: token ?? undefined }));
      setQrOpen(true);
    } catch (error) {
      sileo.error({
        title: "No pudimos generar el QR",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <PageShell className="w-full z-10" admin>
      <PageTransition>
        {/* <section style={themeStyle(theme)}> */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/admin"
              className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" /> Todos los eventos
            </Link>
            {event && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-extrabold text-foreground">
                {event.status === "active" ? "Activo" : event.status === "closed" ? "Cerrado" : "Borrador"}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {/* <aside style={themeStyle(theme)} className="w-full rounded-4xl p-5"> */}
            {eventId && (
              <aside className="w-full flex flex-col gap-2 rounded-4xl p-5">
                {/* <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/55">Vista previa</p>
              <div className="mt-5">
                <div className="relative overflow-hidden rounded-3xl bg-card p-6 text-center">
                  <EventFrame frame={form.invitationFrame} />
                  <p className="relative text-xs font-extrabold uppercase tracking-widest text-primary">
                    Estás invitado
                  </p>
                  <p className="relative mt-3 text-xl font-extrabold text-card-foreground">
                    {form.name || "Tu evento"}
                  </p>
                  <p className="relative mt-4 text-xs text-muted-foreground">
                    {form.welcomeMessageText || "Tu mensaje de bienvenida aparecerá aquí."}
                  </p>
                </div>
              </div> */}

                <Button
                  variant={event?.status === "active" ? "destructive" : "secondary"}
                  className="w-full"
                  isLoading={acting}
                  onClick={toggleStatus}
                >
                  {event?.status === "active" ? (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Cerrar evento
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Activar evento
                    </>
                  )}
                </Button>
                <Button className="w-full" onClick={copy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código
                </Button>
                <Button className="w-full" isLoading={qrLoading} onClick={generateQr}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generar QR
                </Button>
                <Link to={`/admin/events/${eventId}/media`}>
                  <Button className="w-full">
                    <Clapperboard className="mr-2 h-4 w-4" />
                    Ver multimedia
                  </Button>
                </Link>
                <Link to={`/admin/events/${eventId}/gallery`}>
                  <Button className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {event?.status === "closed" ? "Ver mural" : "Previsualizar mural"}
                  </Button>
                </Link>
              </aside>
            )}
            <section className="surface-card grow rounded-4xl p-6 sm:p-9">
              <h1 className="text-3xl font-extrabold text-foreground">
                {eventId ? "Personaliza tu evento" : "Crea un evento"}
              </h1>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-bold text-foreground">
                  Nombre
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="mt-2"
                    placeholder="Boda de Ana y Juan"
                  />
                </label>
                <label className="sm:col-span-2 text-sm font-bold text-foreground">
                  Fecha
                  <Input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => set("eventDate", e.target.value)}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="sm:col-span-2 text-sm font-bold text-foreground">
                  Mensaje de bienvenida
                  <Textarea
                    value={form.welcomeMessageText}
                    onChange={(e) => set("welcomeMessageText", e.target.value)}
                    className="mt-2"
                    placeholder="Unas palabras para tus invitados"
                  />
                </label>
              </div>
              {/* <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Tema completo</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {themeOptions.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => set("preset", preset)}
                      style={themeStyle(preset as EventTheme)}
                      className={`rounded-2xl border p-3 text-left text-sm font-bold capitalize transition ${form.preset === preset ? "border-primary bg-secondary text-primary" : "border-border bg-card text-card-foreground hover:bg-muted"}`}
                    >
                      <span className="mb-2 block h-5 w-5 rounded-full bg-primary" />
                      {preset}
                    </button>
                  ))}
                </div>
              </div> */}
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">
                  Foto de la invitación <span className="font-medium text-muted-foreground">(opcional)</span>
                </p>
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm font-semibold text-muted-foreground hover:bg-muted">
                  <ImagePlus className="h-5 w-5" /> {cover ? "Cambiar foto" : "Seleccionar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                  />
                </label>
                {cover && (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={URL.createObjectURL(cover)}
                    alt="Cover"
                    className="mt-2 h-96 rounded-2xl"
                  />
                )}
              </div>
              {/* <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Marco de invitación</p>
                <div style={themeStyle(theme)} className="mt-3 grid grid-cols-1 gap-2">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => set("invitationFrame", frame.id)}
                      className={`relative w-[50%] overflow-hidden aspect-video rounded-2xl border bg-secondary p-3 text-xs font-bold transition ${form.invitationFrame === frame.id ? "border-primary text-primary" : "border-border text-secondary-foreground"}`}
                    >
                      <EventFrame frame={frame.id} />
                      <span className="relative">
                        {form.invitationFrame === frame.id && <Check className="mx-auto mb-1 h-4 w-4" />}
                        {frame.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div> */}
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Permitir aportes</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                  {(
                    [
                      // ["allowText", "Texto"],
                      ["allowImages", "Fotos"],
                      ["allowVideos", "Videos"],
                      ["allowAudio", "Audio"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) => set(key, e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <Button className="mt-9 w-full" onClick={save} isLoading={saving}>
                Guardar cambios
              </Button>
            </section>
          </div>
          <QrPreviewDialog
            open={qrOpen}
            image={qr?.imageDataUrl}
            accessCode={qr?.accessCode}
            onClose={() => setQrOpen(false)}
          />
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default AdminEventPage;
