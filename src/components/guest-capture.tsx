import * as React from 'react'
import { Camera, Mic, Upload, Video } from 'lucide-react'
import Button from '@/components/ui/button'
import type { GuestMediaType } from '@/stores/use-guest-submission-store'
import { sileo } from 'sileo'

type Props = { onCapture: (file: File, type: GuestMediaType) => void }
const maxVideoSeconds = Number(import.meta.env.VITE_MAX_VIDEO_DURATION_SECONDS ?? 30)

const getType = (mime: string): GuestMediaType | null => mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : null

const GuestCapture = ({ onCapture }: Props) => {
  const [mode, setMode] = React.useState<GuestMediaType | null>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [countdown, setCountdown] = React.useState<number | null>(null)
  const [recording, setRecording] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const chunks = React.useRef<Blob[]>([])
  const timer = React.useRef<number | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const stop = React.useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    stream?.getTracks().forEach((track) => track.stop())
    setStream(null); setRecording(false); setCountdown(null); setMode(null)
  }, [stream])

  React.useEffect(() => () => stop(), [stop])
  React.useEffect(() => { if (stream && videoRef.current) videoRef.current.srcObject = stream }, [stream])

  const start = async (nextMode: GuestMediaType) => {
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: nextMode !== 'audio', audio: nextMode !== 'image' })
      setMode(nextMode); setStream(nextStream)
    } catch { setMode(null); sileo.error({ title: 'No pudimos acceder a tu cámara o micrófono', description: 'Revisa los permisos del navegador o usa tu galería.' }) }
  }

  const click = () => {
    const context = new AudioContext(); const osc = context.createOscillator(); const gain = context.createGain()
    gain.gain.setValueAtTime(0.15, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + .12)
    osc.connect(gain).connect(context.destination); osc.start(); osc.stop(context.currentTime + .12)
  }

  const begin = () => {
    let number = 3; setCountdown(number)
    const tick = () => {
      number -= 1
      if (number > 0) { setCountdown(number); timer.current = window.setTimeout(tick, 700); return }
      setCountdown(0); click()
      if (mode === 'image') {
        const canvas = document.createElement('canvas'); const video = videoRef.current!
        canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d')?.drawImage(video, 0, 0)
        canvas.toBlob((blob) => { if (blob) onCapture(new File([blob], 'envoye-photo.jpg', { type: 'image/jpeg' }), 'image'); stop() }, 'image/jpeg', .9)
        return
      }
      const recorder = new MediaRecorder(stream!, { mimeType: MediaRecorder.isTypeSupported('video/webm') && mode === 'video' ? 'video/webm' : undefined })
      chunks.current = []; recorderRef.current = recorder
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data) }
      recorder.onstop = () => {
        const mime = mode === 'video' ? 'video/webm' : 'audio/webm'
        onCapture(new File(chunks.current, `envoye-${mode}.webm`, { type: mime }), mode!); stop()
      }
      recorder.start(); setRecording(true)
      if (mode === 'video') timer.current = window.setTimeout(() => recorder.stop(), maxVideoSeconds * 1000)
    }
    timer.current = window.setTimeout(tick, 700)
  }

  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; const type = file && getType(file.type)
    if (file && type) onCapture(file, type)
    else if (file) sileo.error({ title: 'Ese formato no es compatible' })
  }

  if (!mode) return <>
    <input ref={inputRef} onChange={upload} type="file" accept="image/*,video/*,audio/*" className="hidden" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Button type="button" onClick={() => start('image')} className="h-28 flex-col gap-2"><Camera />Foto</Button>
      <Button type="button" variant="secondary" onClick={() => start('video')} className="h-28 flex-col gap-2"><Video />Video</Button>
      <Button type="button" variant="pastel" onClick={() => start('audio')} className="h-28 flex-col gap-2"><Mic />Audio</Button>
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="h-28 flex-col gap-2"><Upload />Galería</Button>
    </div>
  </>

  return <div className="mx-auto max-w-xl space-y-4">
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">
      {mode !== 'audio' && <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />}
      {mode === 'audio' && <div className="flex h-full items-center justify-center text-white"><Mic className="h-20 w-20" /></div>}
      {countdown !== null && <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-8xl font-bold text-white">{countdown === 0 ? '¡Click!' : countdown}</div>}
      {recording && <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">● Grabando</div>}
    </div>
    <div className="flex gap-3">
      {recording ? <Button type="button" variant="destructive" onClick={() => recorderRef.current?.stop()} className="flex-1">Detener</Button> : <Button type="button" onClick={begin} className="flex-1">{mode === 'image' ? 'Tomar foto' : 'Comenzar'}</Button>}
      <Button type="button" variant="outline" disabled={recording || countdown !== null} onClick={stop}>Cancelar</Button>
    </div>
  </div>
}

export default GuestCapture
