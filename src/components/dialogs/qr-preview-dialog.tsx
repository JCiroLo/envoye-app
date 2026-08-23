import { DownloadIcon } from "lucide-react";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QrPreviewProps = {
  open: boolean;
  image?: string;
  accessCode?: string;
  onClose: () => void;
};

const QrPreviewDialog: React.FC<QrPreviewProps> = ({ open, image, accessCode, onClose }) => {
  function handleCloseModal(state: boolean) {
    if (state) return;

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR de invitación</DialogTitle>
          <DialogDescription className="leading-relaxed">
            <div className="relative mx-auto h-64 w-64 rounded-full bg-secondary/60">
              <img className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-2 h-56 w-56" src={image} alt={`QR para ${accessCode}`} />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Volver
          </Button>
          <a href={image} download={`envoye-${accessCode}.png`}>
            <Button className="w-full">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Descargar QR
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrPreviewDialog;
