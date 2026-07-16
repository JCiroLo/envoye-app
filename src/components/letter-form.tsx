import * as React from 'react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import MediaCapture from '@/components/media-capture'
import useLetterStore from '@/stores/use-letter-store'
import { Heart, CheckCircle, ArrowLeft } from 'lucide-react'

type LetterFormProps = {
  eventId: string
  onComplete: () => void
  onCancel: () => void
}

const LetterForm = ({ eventId, onComplete, onCancel }: LetterFormProps) => {
  const [userName, setUserName] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null)
  const [mediaType, setMediaType] = React.useState<'image' | 'video' | null>(null)
  const [step, setStep] = React.useState<1 | 2>(1) // 1: Details & Message, 2: Media Capture
  
  const addLetter = useLetterStore((state) => state.addLetter)

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim() && message.trim()) {
      setStep(2)
    }
  }

  const handleCaptureComplete = (capturedUrl: string, type: 'image' | 'video') => {
    setMediaUrl(capturedUrl)
    setMediaType(type)
  }

  const handleSave = () => {
    if (!userName.trim() || !message.trim()) return

    addLetter({
      eventId,
      userName: userName.trim(),
      message: message.trim(),
      mediaType: mediaType || 'image',
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80', // Fallback to wedding placeholder if no media was taken
    })

    onComplete()
  }

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-secondary/30 shadow-lg bg-white/95 backdrop-blur-md">
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="mx-auto w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground mb-2">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500/20" />
        </div>
        <CardTitle className="text-4xl font-extralight text-gray-800">
          {step === 1 ? 'Escribir Felicitacion' : 'Anadir Foto o Video'}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {step === 1 
            ? 'Dedica unas lindas palabras a los anfitriones del evento'
            : 'Captura un momento divertido para que lo recuerden por siempre'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="userName" className="text-sm font-semibold text-gray-700 block">
                Tu Nombre
              </label>
              <Input
                id="userName"
                type="text"
                required
                placeholder="Ej. Sofía y Carlos"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border-gray-200 focus-visible:ring-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-semibold text-gray-700 block">
                Tu Mensaje de Felicitación
              </label>
              <Textarea
                id="message"
                required
                placeholder="¡Les deseamos lo mejor en este gran día! Que el amor y la felicidad los acompañen siempre..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="border-gray-200 focus-visible:ring-primary font-medium resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="default" className="flex-1 h-12">
                Siguiente: Añadir Foto/Video
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="px-4">
                Volver
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {!mediaUrl ? (
              <MediaCapture
                onCaptureComplete={handleCaptureComplete}
                onCancel={() => setStep(1)}
              />
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border-4 border-white mx-auto max-w-sm">
                  {mediaType === 'image' ? (
                    <img src={mediaUrl} className="w-full h-full object-cover" alt="Captured preview" />
                  ) : (
                    <video src={mediaUrl} controls className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="button" variant="default" onClick={handleSave} className="h-12 w-full text-base font-bold shadow-md bg-gradient-to-r from-primary to-secondary hover:brightness-95 border-0">
                    Enviar Carta de Felicitación ✨
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMediaUrl(null)
                      setMediaType(null)
                    }}
                    className="w-full h-11"
                  >
                    Volver a capturar
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center gap-1.5 text-gray-500 h-10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Editar mensaje escrito</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LetterForm
