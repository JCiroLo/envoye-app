import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import Button from "@/components/ui/button";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import { FramedSurface } from "@/components/event-frame";
import useEventStore from "@/stores/use-event-store";

const InvitePage = () => {
  const { accessCode = "" } = useParams();
  const { event, error } = useEventStore(
    useShallow((state) => ({
      event: state.event,
      error: state.error,
    })),
  );

  return (
    <PageShell>
      <PageTransition>
        <div className="w-full max-w-2xl">
          <FramedSurface className="p-8 text-center sm:p-12">
            {error ? (
              <>
                <h1 className="text-3xl font-extrabold text-foreground">Invitación no disponible</h1>
                <p className="mt-4 text-muted-foreground">
                  Se ha producido un error al cargar la invitación. Revisa el código de invitación o pregunta a tu
                  organizador si el evento sigue abierto.
                </p>
                <Link to="/">
                  <Button className="mt-7 w-full">Volver</Button>
                </Link>
              </>
            ) : !event ? (
              <p className="py-10 text-muted-foreground">Abriendo invitación…</p>
            ) : (
              <>
                <p className="text-xs font-extrabold uppercase tracking-[.22em] text-primary">
                  Estás invitado
                </p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground text-balance sm:text-5xl">
                  {event.name}
                </h1>
                {event.event_date && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString("es-CO", { dateStyle: "full" })}
                  </p>
                )}
                {event.welcome_message_text && (
                  <p className="mx-auto mt-8 max-w-lg rounded-2xl bg-secondary p-5 text-base leading-7 text-secondary-foreground">
                    {event.welcome_message_text}
                  </p>
                )}
                <Link to={`/invite/${accessCode}/record`} state={{ startsSubmission: true }}>
                  <Button size="lg" className="mt-9 gap-2">
                    Dejar mi mensaje <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </FramedSurface>
        </div>
      </PageTransition>
    </PageShell>
  );
};
export default InvitePage;
