import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, AlertCircle } from "lucide-react";

type QrScannerProps = {
  onScanComplete: (eventId: string) => void;
};

const QrScanner = ({ onScanComplete }: QrScannerProps) => {
  const [error, setError] = React.useState<string | null>(null);
  const [scannerStarted, setScannerStarted] = React.useState(false);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const elementId = "qr-scanner-element";

  React.useEffect(() => {
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          cleanupScanner().then(() => {
            onScanComplete(decodedText);
          });
        },
        () => {},
      )
      .then(() => {
        setScannerStarted(true);
      })
      .catch((err) => {
        console.error("Failed to start QR scanner:", err);
        setError(
          "No se pudo acceder a la cámara. Por favor asegúrate de dar permisos o ingresa el código de la invitación de forma manual.",
        );
      });

    const cleanupScanner = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          console.error("Error stopping scanner during cleanup:", e);
        }
      }
    };

    return () => {
      cleanupScanner();
    };
  }, [onScanComplete]);

  return (
    <div className="relative w-full mx-auto aspect-square max-w-70 bg-slate-950 rounded-2xl overflow-hidden shadow-inner">
      <div id={elementId} className="w-full h-full" />

      {scannerStarted && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute w-[70%] h-[70%] border-2 border-dashed border-white/40 rounded-lg animate-pulse" />
          <div className="absolute w-[70%] h-0.5 bg-purple-500/80 shadow-[0_0_8px_#a855f7] animate-bounce" />
        </div>
      )}

      {!scannerStarted && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/90 p-4 text-center">
          <Camera className="w-8 h-8 animate-spin text-purple-400 mb-2" />
          <span className="text-xs font-medium text-slate-300">Iniciando cámara...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-red-950/95 p-4 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
          <span className="text-xs text-rose-200 px-2">{error}</span>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
