import { ArrowRight } from "lucide-react";
import Countdown from "react-countdown";
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
    <PageShell className="flex items-end w-full" background={event?.cover_url} backgroundPlaceholder={event?.cover_placeholder_url}>
      <PageTransition className="w-full">
        <div className="w-full max-w-2xl">
          <FramedSurface className="text-center">
            {error ? (
              <div className="p-6">
                <h1 className="text-3xl font-extrabold text-foreground">Invitación no disponible</h1>
                <p className="mt-4 text-muted-foreground">
                  Se ha producido un error al cargar la invitación. Revisa el código de invitación o pregunta a tu
                  organizador si el evento sigue abierto.
                </p>
                <Link to="/">
                  <Button className="mt-7 w-full">Volver</Button>
                </Link>
              </div>
            ) : event ? (
              <>
                {event.event_date && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString("es-CO", { dateStyle: "full" })}
                  </p>
                )}
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground text-balance sm:text-5xl">
                  {event.name}
                </h1>
                {event.welcome_message_text && (
                  <p className="mx-auto mt-8 max-w-lg text-base leading-7">{event.welcome_message_text}</p>
                )}
                {event.event_date && (
                  <div className="mt-6 px-5 py-3 text-sm text-muted-foreground">
                    <Countdown
                      date={new Date(event.event_date)}
                      renderer={({ completed, days, hours, minutes, seconds }) =>
                        completed ? (
                          <span className="text-2xl font-extrabold text-foreground">00:00:00</span>
                        ) : (
                          <span className="text-2xl font-extrabold text-foreground">
                            {days ? `${days}d ` : ""}
                            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
                            {String(seconds).padStart(2, "0")}
                          </span>
                        )
                      }
                      daysInHours
                    />
                  </div>
                )}
                <Link to={`/invite/${accessCode}/record`} state={{ startsSubmission: true }}>
                  <Button size="lg" className="mt-9 gap-2">
                    Dejar mi mensaje <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : null}
          </FramedSurface>
        </div>
      </PageTransition>
    </PageShell>
  );
};
export default InvitePage;
