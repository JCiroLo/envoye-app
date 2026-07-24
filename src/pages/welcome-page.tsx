import * as React from "react";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import { sileo } from "sileo";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageShell from "@/components/page-shell";
import QrScanner from "@/components/qr-scanner";
import PageTransition from "@/components/page-transition";

const WelcomePage = () => {
  const [code, setCode] = React.useState("");
  const [scanning, setScanning] = React.useState(false);
  const navigate = useNavigate();

  const enter = (value: string) => {
    const normalized = value.trim().replace(/\/$/, "").split("/").pop()?.toUpperCase();

    if (normalized) {
      navigate(`/invite/${normalized}`);
      return;
    }

    sileo.error({ title: "No pudimos identificar tu invitación" });
  };

  return (
    <PageShell compact>
      <PageTransition>
        <section className="surface-card relative w-full max-w-xl rounded-4xl p-7 text-center sm:p-10">
          {scanning ? (
            <QrScanner onScanComplete={enter} onCancel={() => setScanning(false)} />
          ) : (
            <>
              <div className="absolute left-1/2 top-full -translate-x-1/2 flex items-center gap-2 text-xs opacity-50">
                Powered by <span className="brand-mark text-2xl text-primary">Envoye</span>
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <QrCode />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground">Tienes una invitación</h1>
              <p className="mt-3 text-muted-foreground">Escanea el código QR o escribe el código que recibiste.</p>
              <form
                className="mt-8 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  enter(code);
                }}
              >
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Código"
                  className="text-center"
                />
                <Button>Continuar</Button>
              </form>
              <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => setScanning(true)}>
                Escanear QR
              </Button>
            </>
          )}
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default WelcomePage;
