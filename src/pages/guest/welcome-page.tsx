import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sileo } from "sileo";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageShell from "@/components/page-shell";
import QrScanner from "@/components/qr-scanner";
import PageTransition from "@/components/page-transition";

const WelcomePage = () => {
  const [code, setCode] = React.useState("");
  const [step, setStep] = React.useState<"qr" | "code" | "scanning">("qr");
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
    <PageShell className="flex items-end">
      <PageTransition>
        <section className="relative w-full max-w-xl rounded-4xl text-center">
          <h1 className="text-3xl font-extrabold text-foreground">Tienes una invitación</h1>
          <p className="mt-1 mb-8 text-muted-foreground">
            Escanea el código QR o usa el código de tu invitación para continuar.
          </p>
          {step === "qr" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button className="w-full" onClick={() => setStep("scanning")}>
                Escanear QR
              </Button>
              <Button type="button" variant="ghost" className="mt-1 w-full" onClick={() => setStep("code")}>
                Usar código de invitación
              </Button>
            </motion.div>
          )}
          {step === "code" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <form
                className="flex gap-2"
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
              <Button type="button" variant="ghost" className="mt-1 w-full" onClick={() => setStep("qr")}>
                Usar QR
              </Button>
            </motion.div>
          )}
          {step === "scanning" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <QrScanner onScanComplete={enter} />
              <Button type="button" variant="ghost" className="mt-1 w-full" onClick={() => setStep("qr")}>
                Atrás
              </Button>
            </motion.div>
          )}
        </section>
      </PageTransition>
    </PageShell>
  );
};
export default WelcomePage;
