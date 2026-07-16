import * as React from 'react'
import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import QrScanner from '@/components/qr-scanner'
import LetterForm from '@/components/letter-form'
import Gallery3D from '@/components/gallery-3d'
import { QrCode, Sparkles, Image, CheckCircle, ArrowRight } from 'lucide-react'

type AppState = 'home' | 'scan' | 'compose' | 'success' | 'gallery'

const App = () => {
  const [state, setState] = React.useState<AppState>('home')
  const [activeEventId, setActiveEventId] = React.useState('default-event')

  const handleScanComplete = (eventId: string) => {
    setActiveEventId(eventId)
    setState('compose')
  }

  const handleLetterFormComplete = () => {
    setState('success')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {state === 'home' && (
        <Card className="w-full max-w-md mx-auto text-center border-2 border-primary/20 shadow-xl bg-white/80 backdrop-blur-md overflow-hidden relative">
          {/* Pastel top decoration */}
          <div className="h-4 bg-gradient-to-r from-primary via-secondary to-accent" />
          
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-fuchsia-600 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Mural Mágico
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium px-4">
              Escanea tu invitación QR, tómate fotos o videos y comparte tus felicitaciones en un mural 3D interactivo.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => setState('scan')}
              className="w-full flex items-center justify-center gap-2 group"
            >
              <QrCode className="w-5 h-5 text-purple-700" />
              <span>Escanear Invitación QR</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setActiveEventId('default-event')
                setState('gallery')
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Image className="w-5 h-5 text-pink-700" />
              <span>Ver Mural de Felicitaciones</span>
            </Button>

            <div className="pt-4 text-xs font-semibold text-gray-400">
              Desarrollado para eventos especiales ✨
            </div>
          </CardContent>
        </Card>
      )}

      {state === 'scan' && (
        <QrScanner
          onScanComplete={handleScanComplete}
          onCancel={() => setState('home')}
        />
      )}

      {state === 'compose' && (
        <LetterForm
          eventId={activeEventId}
          onComplete={handleLetterFormComplete}
          onCancel={() => setState('scan')}
        />
      )}

      {state === 'success' && (
        <Card className="w-full max-w-md mx-auto text-center border-2 border-accent/30 shadow-xl bg-white/90 backdrop-blur-md p-6">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-3">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-800">
              ¡Mensaje Enviado!
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium px-2">
              Tu carta de felicitación y multimedia han sido agregados con éxito al mural del evento.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => setState('gallery')}
              className="w-full flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-purple-700" />
              <span>Ir al Mural 3D</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setState('home')}
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      )}

      {state === 'gallery' && (
        <div className="fixed inset-0 z-50">
          <Gallery3D
            eventId={activeEventId}
            onBack={() => setState('home')}
          />
        </div>
      )}
    </div>
  )
}

export default App
