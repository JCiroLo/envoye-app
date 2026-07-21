import * as React from 'react'
import { QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PageShell from '@/components/page-shell'
import QrScanner from '@/components/qr-scanner'
import PageTransition from '@/components/page-transition'

const WelcomePage = () => {
  const [code, setCode] = React.useState(''); const [scanning, setScanning] = React.useState(false); const navigate = useNavigate()
  const enter = (value: string) => {
    const normalized = value.trim().replace(/\/$/, '').split('/').pop()?.toUpperCase()
    if (normalized) navigate(`/invite/${normalized}`)
  }
  return <PageShell compact><PageTransition>
    <section className="w-full max-w-xl rounded-[2rem] bg-white p-7 text-center shadow-[0_20px_60px_-35px_rgba(35,25,70,.35)] sm:p-10">
      {scanning ? <QrScanner onScanComplete={enter} onCancel={() => setScanning(false)} /> : <>
        <div className="brand-mark mb-8 text-5xl text-[var(--event-primary)]">Envoye</div><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700"><QrCode /></div>
        <h1 className="text-3xl font-extrabold text-slate-900">Tienes una invitación</h1>
        <p className="mt-3 text-slate-500">Escanea el código QR o escribe el código que recibiste.</p>
        <form className="mt-8 flex gap-2" onSubmit={(event) => { event.preventDefault(); enter(code) }}><Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="CÓDIGO" className="text-center uppercase" /><Button>Continuar</Button></form>
        <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => setScanning(true)}>Escanear QR</Button>
      </>}
    </section>
  </PageTransition></PageShell>
}
export default WelcomePage
