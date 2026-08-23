import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";
import PageShell from "@/components/page-shell";
import useGuestSubmissionStore from "@/stores/use-guest-submission-store";
import PageTransition from "@/components/page-transition";
import useEventStore from "@/stores/use-event-store";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const event = useEventStore((store) => store.event);

  function reset() {
    useGuestSubmissionStore.getState().reset();
    navigate("/");
  }

  return (
    <PageShell className="flex items-end" background={event?.cover_url}>
      <PageTransition className="z-10">
        <Confetti />
        <section className="max-w-lg rounded-4xl p-10 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-accent-foreground" />
          <h1 className="mt-5 text-4xl font-extrabold text-foreground">¡Todo listo!</h1>
          <p className="mt-3 text-muted-foreground">
            Tu recuerdo ya fue enviado al evento. Puedes cerrar esta pestaña cuando quieras.
          </p>
          <Button className="mt-12 w-full" onClick={reset}>
            Enviar otro mensaje
          </Button>
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default ConfirmationPage;
