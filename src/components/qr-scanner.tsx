import * as React from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { QrCode, Camera, AlertCircle } from 'lucide-react'

type QrScannerProps = {
  onScanComplete: (eventId: string) => void
  onCancel: () => void
}

const QrScanner = ({ onScanComplete, onCancel }: QrScannerProps) => {
  const [error, setError] = React.useState<string | null>(null)
  const [manualCode, setManualCode] = React.useState('')
  const [scannerStarted, setScannerStarted] = React.useState(false)
  const scannerRef = React.useRef<Html5Qrcode | null>(null)
  const elementId = 'qr-scanner-element'

  React.useEffect(() => {
    const scanner = new Html5Qrcode(elementId)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7
            return { width: size, height: size }
          },
        },
        (decodedText) => {
          // Success: QR Code read successfully!
          cleanupScanner().then(() => {
            onScanComplete(decodedText)
          })
        },
        () => {
          // Silent failure on every frame without a QR code
        }
      )
      .then(() => {
        setScannerStarted(true)
      })
      .catch((err) => {
        console.error('Failed to start QR scanner:', err)
        setError('No se pudo acceder a la cámara. Por favor asegúrate de dar permisos o ingresa el código de forma manual.')
      })

    const cleanupScanner = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop()
        } catch (e) {
          console.error('Error stopping scanner during cleanup:', e)
        }
      }
    }

    return () => {
      cleanupScanner()
    }
  }, [onScanComplete])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScanComplete(manualCode.trim())
    }
  }

  const handleSimulateScan = () => {
    onScanComplete('wedding-magic-2026')
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-2 border-primary/30 shadow-lg bg-white/80 backdrop-blur-md">
      <CardHeader className="text-center pb-2 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground mb-2">
          <QrCode className="w-6 h-6 text-purple-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Escanear Invitación</CardTitle>
        <CardDescription className="text-gray-500">
          Apunta con la cámara al código QR del evento
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 flex flex-col items-center">
        {/* Scanner Viewport */}
        <div className="relative w-full aspect-square max-w-[280px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner border-4 border-white mb-6">
          <div id={elementId} className="w-full h-full" />
          
          {/* Laser overlay animation */}
          {scannerStarted && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Scan box frame corners */}
              <div className="absolute w-[70%] h-[70%] border-2 border-dashed border-white/40 rounded-lg animate-pulse" />
              <div className="absolute w-[70%] h-[2px] bg-purple-500/80 shadow-[0_0_8px_#a855f7] animate-bounce" />
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

        {/* Manual code input fallback */}
        <form onSubmit={handleManualSubmit} className="w-full space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ingresa código manualmente (ej. boda-2026)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 border-primary/20 text-center font-medium placeholder:text-gray-400 focus-visible:ring-primary"
            />
            <Button type="submit" variant="secondary" className="px-4 shrink-0">
              Unirse
            </Button>
          </div>
        </form>

        <div className="w-full flex flex-col gap-2 mt-6">
          <Button
            type="button"
            variant="pastel"
            onClick={handleSimulateScan}
            className="w-full border border-teal-200/50"
          >
            Simular Escaneo (Demo Boda)
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Volver al Inicio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QrScanner
