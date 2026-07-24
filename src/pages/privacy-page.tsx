import { ShieldCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import PageShell from "@/components/page-shell";
import useGuestSubmissionStore from "@/stores/use-guest-submission-store";
import PageTransition from "@/components/page-transition";

const PrivacyPage = () => {
  const { accessCode = "" } = useParams();
  const navigate = useNavigate();
  const { setConsented } = useGuestSubmissionStore();

  return (
    <PageShell>
      <PageTransition>
        <section className="surface-card w-full max-w-xl rounded-4xl p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ShieldCheck />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground">Antes de enviar</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Tu mensaje será público dentro del mural de este evento. Los anfitriones y asistentes autorizados podrán
            verlo durante la experiencia.
          </p>
          <div className="mt-8 flex gap-3">
            <Link className="flex-1" to={`/invite/${accessCode}/record`}>
              <Button variant="outline" className="w-full">
                Volver
              </Button>
            </Link>
            <Button
              className="flex-1"
              onClick={() => {
                setConsented(true);
                navigate(`/invite/${accessCode}/details`);
              }}
            >
              Acepto
            </Button>
          </div>
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default PrivacyPage;
