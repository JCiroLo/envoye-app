import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";

type PrivacyDialogProps = {
  open: boolean;
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
};

const PrivacyDialog: React.FC<PrivacyDialogProps> = ({ open, onSubmit, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [isLoading, setLoading] = useState(false);

  const submitButtonText = useMemo(() => {
    if (step === 1) return "Acepto";
    if (step === 2) return name.trim() ? "Enviar" : "Enviar sin nombre";
    return "";
  }, [step, name]);

  function handleGoBack() {
    if (step === 1) return onClose();
    if (step === 2) return setStep(1);
  }

  async function handleSubmitAction() {
    if (step === 1) return setStep(2);
    setLoading(true);
    if (step === 2) await onSubmit(name);
    setLoading(false);
  }

  function handleCloseModal(state: boolean) {
    if (state) return;

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Antes de enviar ({step}/2)</DialogTitle>
          {step === 1 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogDescription className="leading-relaxed">
                Tu mensaje será público dentro del mural de este evento. Los anfitriones y asistentes autorizados podrán
                verlo durante la experiencia. ¿Aceptas continuar?
              </DialogDescription>
            </motion.div>
          ) : step === 2 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogDescription className="leading-relaxed">
                Puedes agregar tu nombre para que los anfitriones y asistentes autorizados puedan reconocerte. No es
                obligatorio.
                <Input
                  className="mt-6"
                  placeholder="Tu nombre"
                  value={name}
                  autoFocus
                  onChange={(event) => setName(event.target.value)}
                />
              </DialogDescription>
            </motion.div>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={handleGoBack}>
            Volver
          </Button>
          <Button isLoading={isLoading} onClick={handleSubmitAction}>
            {submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog;
