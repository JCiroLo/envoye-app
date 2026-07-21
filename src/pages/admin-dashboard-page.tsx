import * as React from 'react'
import { CalendarPlus, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import Button from '@/components/ui/button'
import PageShell from '@/components/page-shell'
import PageTransition from '@/components/page-transition'
import { api, getAdminToken, setAdminToken } from '@/lib/api'

type EventSummary = { id: string; name: string; event_date: string | null; status: string; access_code: string; theme?: { preset: string } }
const AdminDashboardPage = () => { const navigate = useNavigate(); const [events, setEvents] = React.useState<EventSummary[]>([]); const [loading, setLoading] = React.useState(true); const token = getAdminToken()
  React.useEffect(() => { if (!token) { navigate('/admin/login'); return } api<{ events: EventSummary[] }>('/api/events', { token: token ?? undefined }).then(({ events }) => setEvents(events)).catch((err: Error) => sileo.error({ title: 'No pudimos cargar tus eventos', description: err.message })).finally(() => setLoading(false)) }, [navigate, token])
  return <PageShell><PageTransition><section className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--event-primary)]">Panel de administración</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Tus eventos</h1></div><div className="flex gap-2"><Button variant="ghost" onClick={() => { setAdminToken(null); navigate('/admin/login') }}><LogOut className="mr-2 h-4 w-4" />Salir</Button><Link to="/admin/events/new"><Button><CalendarPlus className="mr-2 h-4 w-4" />Nuevo evento</Button></Link></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{loading && <p className="text-slate-500">Cargando eventos…</p>}{events.map((event) => <Link key={event.id} to={`/admin/events/${event.id}`} className="group rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--event-primary)]">{event.status === 'active' ? 'Activo' : event.status === 'closed' ? 'Cerrado' : 'Borrador'}</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">{event.name}</h2><p className="mt-4 text-sm text-slate-500">Código · {event.access_code}</p></Link>)}{!loading && !events.length && <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-8 text-slate-500">Aún no has creado eventos.</div>}</div></section></PageTransition></PageShell> }
export default AdminDashboardPage
