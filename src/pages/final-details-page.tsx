import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { sileo } from 'sileo'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PageShell from '@/components/page-shell'
import { api } from '@/lib/api'
import useGuestSubmissionStore from '@/stores/use-guest-submission-store'

const FinalDetailsPage = () => {
  const { accessCode = '' } = useParams(); const navigate = useNavigate(); const state = useGuestSubmissionStore(); const [sending, setSending] = React.useState(false)
  const send = async () => { setSending(true); try { const form = new FormData(); if (state.messageText) form.set('messageText', state.messageText); if (state.guestName.trim()) form.set('guestName', state.guestName.trim()); form.set('consentedToPublicDisplay', String(state.consented)); if (state.media) form.set('media', state.media); await api(`/api/public/events/${accessCode}/submissions`, { method: 'POST', body: form }); navigate(`/invite/${accessCode}/confirmation`) } catch (err) { sileo.error({ title: 'No pudimos enviar tu mensaje', description: err instanceof Error ? err.message : undefined }) } finally { setSending(false) } }
  return <PageShell compact><AnimatePresence><motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section initial={{ y: 24, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: .97 }} transition={{ type: 'spring', stiffness: 310, damping: 26 }} className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl"><div className="flex justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--event-primary)]">Casi listo</p><h1 className="mt-1 text-2xl font-extrabold text-slate-900">¿Cómo quieres aparecer?</h1></div><button onClick={() => navigate(`/invite/${accessCode}/record`)} className="h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100"><X className="m-auto h-5 w-5" /></button></div><p className="mt-3 text-sm leading-6 text-slate-500">Es opcional; puedes enviar tu mensaje anónimamente.</p><Input autoFocus value={state.guestName} onChange={(event) => state.setGuestName(event.target.value)} className="mt-6" placeholder="Tu nombre" /><Button className="mt-5 w-full" isLoading={sending} onClick={send}>{state.guestName.trim() ? 'Enviar' : 'Enviar sin nombre'}</Button></motion.section></motion.div></AnimatePresence></PageShell>
}
export default FinalDetailsPage
