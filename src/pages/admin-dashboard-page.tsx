import * as React from "react";
import { CalendarPlus, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { sileo } from "sileo";
import Button from "@/components/ui/button";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import { api, getAdminToken, setAdminToken } from "@/lib/api";

type EventSummary = {
  id: string;
  name: string;
  event_date: string | null;
  status: string;
  access_code: string;
  theme?: { preset: string };
};
const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState<EventSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const token = getAdminToken();

  React.useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    api<{ events: EventSummary[] }>("/api/events", { token: token ?? undefined })
      .then(({ events }) => setEvents(events))
      .catch((err: Error) => sileo.error({ title: "No pudimos cargar tus eventos", description: err.message }))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  return (
    <PageShell centered={false}>
      <PageTransition>
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Panel de administración</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">Tus eventos</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setAdminToken(null);
                  navigate("/admin/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
              <Link to="/admin/events/new">
                <Button>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Nuevo evento
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && <p className="text-muted-foreground">Cargando eventos…</p>}
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/admin/events/${event.id}`}
                className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {event.status === "active" ? (
                  <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Activo</p>
                ) : event.status === "closed" ? (
                  <p className="text-xs font-extrabold uppercase tracking-wider text-destructive">Cerrado</p>
                ) : (
                  <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Borrador</p>
                )}
                <h2 className="mt-2 text-2xl font-extrabold text-card-foreground">{event.name}</h2>
                <p className="mt-4 text-sm text-muted-foreground">Código · {event.access_code}</p>
              </Link>
            ))}
            {!loading && !events.length && (
              <div className="rounded-3xl border border-dashed border-border p-8 text-muted-foreground">
                Aún no has creado eventos.
              </div>
            )}
          </div>
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default AdminDashboardPage;
