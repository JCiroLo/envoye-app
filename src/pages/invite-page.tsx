import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Button from '@/components/ui/button'
import PageShell from '@/components/page-shell'
import PageTransition from '@/components/page-transition'
import { FramedSurface } from '@/components/event-frame'
import { api } from '@/lib/api'
import { applyThemeToDocument, themeStyle, type EventTheme } from '@/lib/event-theme'

type PublicEvent = { name: string; event_date: string | null; welcome_message_text: string | null; invitation_frame: string; theme: EventTheme }
const InvitePage = () => {
  const { accessCode = '' } = useParams(); const [event, setEvent] = React.useState<PublicEvent | null>(null); const [error, setError] = React.useState('')
  React.useEffect(() => { api<{ event: PublicEvent }>(`/api/public/events/${accessCode}`).then(({ event }) => { setEvent(event); applyThemeToDocument(event.theme) }).catch((err: Error) => setError(err.message)) }, [accessCode])
  return <PageShell compact><PageTransition><div style={themeStyle(event?.theme)} className="w-full max-w-2xl"><FramedSurface frame={event?.invitation_frame} className="p-8 text-center sm:p-12">{error ? <><h1 className="text-3xl font-extrabold text-slate-900">Invitación no disponible</h1><p className="mt-4 text-slate-500">{error}</p><Link to="/"><Button className="mt-7">Volver</Button></Link></> : !event ? <p className="py-10 text-slate-500">Abriendo invitación…</p> : <><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[var(--event-primary)]">Estás invitado</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--event-ink)] sm:text-5xl">{event.name}</h1>{event.event_date && <p className="mt-3 text-sm text-slate-500">{new Date(event.event_date).toLocaleDateString('es-CO', { dateStyle: 'full' })}</p>}{event.welcome_message_text && <p className="mx-auto mt-8 max-w-lg rounded-2xl bg-[var(--event-secondary)] p-5 text-base leading-7 text-[var(--event-ink)]">{event.welcome_message_text}</p>}<Link to={`/invite/${accessCode}/record`}><Button size="lg" className="mt-9 gap-2">Dejar mi mensaje <ArrowRight className="h-4 w-4" /></Button></Link></>}</FramedSurface></div></PageTransition></PageShell>
}
export default InvitePage
