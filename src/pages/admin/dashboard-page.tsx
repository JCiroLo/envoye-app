import * as React from "react";
import { CalendarPlus, LoaderCircle, LogOut } from "lucide-react";
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
    <PageShell className="w-full z-10" admin>
      <PageTransition>
        <section>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Tus eventos</h1>
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
          <div className="mt-8 flex flex-col gap-4">
            {loading && <LoaderCircle className="self-center mr-2 h-16 w-16 animate-spin" />}
            {events.map((event) => (
              <Link
                key={event.id}
                className="relative group rounded-3xl surface-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                to={`/admin/events/${event.id}`}
              >
                {event.status === "active" ? (
                  <span className="absolute right-5 top-5 rounded-full bg-lime-700 px-3 py-1 text-xs font-extrabold text-foreground">
                    Activo
                  </span>
                ) : event.status === "closed" ? (
                  <span className="absolute right-5 top-5 rounded-full bg-destructive px-3 py-1 text-xs font-extrabold text-foreground">
                    Cerrado
                  </span>
                ) : (
                  <span className="absolute right-5 top-5 rounded-full bg-muted px-3 py-1 text-xs font-extrabold text-foreground">
                    Borrador
                  </span>
                )}
                <h2 className="mt-2 text-2xl font-extrabold text-card-foreground">{event.name}</h2>
                <p className="text-sm text-muted-foreground">Código · {event.access_code}</p>
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
