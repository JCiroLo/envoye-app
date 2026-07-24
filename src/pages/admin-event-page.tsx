import * as React from "react";
import { Check, ChevronLeftIcon, Copy, Download, ExternalLink, Play, QrCode, Square, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sileo } from "sileo";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import Textarea from "@/components/ui/textarea";
import { EventFrame } from "@/components/event-frame";
import { api, getAdminToken } from "@/lib/api";
import { themeOptions, themeStyle, type EventTheme } from "@/lib/event-theme";

type EventData = {
  id: string;
  name: string;
  event_date: string | null;
  welcome_message_text: string | null;
  invitation_frame: string;
  theme: EventTheme;
  settings: { allowText: boolean; allowImages: boolean; allowVideos: boolean; allowAudio: boolean };
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
  allowText: true,
  allowImages: true,
  allowVideos: true,
  allowAudio: true,
};
const frames = [
  { id: "classic-letter", label: "Carta" },
  { id: "floral", label: "Flores" },
  { id: "gallery", label: "Galería" },
];

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
          preset: event.theme.preset,
          ...event.settings,
        });
      })
      .catch((error: Error) => sileo.error({ title: "No pudimos abrir el evento", description: error.message }));
  }, [eventId, navigate, token]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const theme: EventTheme = { preset: form.preset, colors: {} };

  const payload = () => ({
    name: form.name,
    eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
    welcomeMessageText: form.welcomeMessageText || null,
    invitationFrame: form.invitationFrame,
    theme,
    settings: {
      allowText: form.allowText,
      allowImages: form.allowImages,
      allowVideos: form.allowVideos,
      allowAudio: form.allowAudio,
    },
  });

  const save = async () => {
    setSaving(true);
    try {
      const result = await api<{ event: EventData }>(eventId ? `/api/events/${eventId}` : "/api/events", {
        method: eventId ? "PATCH" : "POST",
        token: token ?? undefined,
        body: JSON.stringify(payload()),
      });
      sileo.success({ title: eventId ? "Cambios guardados" : "Evento creado" });
      if (!eventId) navigate(`/admin/events/${result.event.id}`);
      else setEvent(result.event);
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
    if (!eventId) return;
    setQrLoading(true);
    try {
      setQr(await api<QrData>(`/api/events/${eventId}/qr`, { token: token ?? undefined }));
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
    <PageShell>
      <PageTransition>
        <section style={themeStyle(theme)} className="mx-auto max-w-5xl">
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
          <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
            <section className="surface-card rounded-[2rem] p-6 sm:p-9">
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Configuración</p>
              <h1 className="mt-2 text-3xl font-extrabold text-foreground">
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
                <label className="text-sm font-bold text-foreground">
                  Fecha
                  <Input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => set("eventDate", e.target.value)}
                    className="mt-2"
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
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Tema completo</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {themeOptions.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => set("preset", preset)}
                      style={themeStyle({ preset })}
                      className={`rounded-2xl border p-3 text-left text-sm font-bold capitalize transition ${form.preset === preset ? "border-primary bg-secondary text-primary" : "border-border bg-card text-card-foreground hover:bg-muted"}`}
                    >
                      <span className="mb-2 block h-5 w-5 rounded-full bg-primary" />
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Marco de invitación</p>
                <div style={themeStyle(theme)} className="mt-3 grid grid-cols-3 gap-2">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => set("invitationFrame", frame.id)}
                      className={`relative h-24 overflow-hidden rounded-2xl border bg-secondary p-3 text-xs font-bold transition ${form.invitationFrame === frame.id ? "border-primary text-primary" : "border-border text-secondary-foreground"}`}
                    >
                      <EventFrame frame={frame.id} />
                      <span className="relative">
                        {form.invitationFrame === frame.id && <Check className="mx-auto mb-1 h-4 w-4" />}
                        {frame.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Permitir aportes</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                  {(
                    [
                      ["allowText", "Texto"],
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
              <Button className="mt-9" onClick={save} isLoading={saving}>
                Guardar cambios
              </Button>
            </section>
            <aside style={themeStyle(theme)} className="theme-mural rounded-4xl p-5 shadow-xl">
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/55">Vista previa</p>
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
              </div>
              {eventId && (
                <div className="mt-6 space-y-2">
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
                  <Button variant="outline" className="w-full" onClick={copy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar código
                  </Button>
                  <Button variant="outline" className="w-full" isLoading={qrLoading} onClick={generateQr}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generar QR
                  </Button>
                  {event?.status === "closed" && (
                    <Link to={`/admin/events/${eventId}/gallery`}>
                      <Button className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver mural
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </aside>
          </div>
          {qr && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4 backdrop-blur-sm">
              <div style={themeStyle(theme)} className="surface-card w-full max-w-sm rounded-[2rem] p-7 text-center">
                <button
                  onClick={() => setQr(null)}
                  className="float-right rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Código de invitación</p>
                <h2 className="mt-2 text-2xl font-extrabold text-foreground">{qr.accessCode}</h2>
                <div className="mx-auto mt-6 grid h-64 w-64 place-items-center rounded-full bg-secondary p-5">
                  <div className="rounded-[1.35rem] bg-card p-3 shadow-lg">
                    <img src={qr.imageDataUrl} alt={`QR para ${qr.accessCode}`} className="h-48 w-48" />
                  </div>
                </div>
                <p className="mt-5 break-all text-xs text-muted-foreground">{qr.inviteUrl}</p>
                <a href={qr.imageDataUrl} download={`envoye-${qr.accessCode}.png`}>
                  <Button className="mt-5 w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar QR
                  </Button>
                </a>
              </div>
            </div>
          )}
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default AdminEventPage;
