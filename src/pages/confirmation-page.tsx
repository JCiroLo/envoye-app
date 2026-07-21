import { CheckCircle } from 'lucide-react'
import PageShell from '@/components/page-shell'
import useGuestSubmissionStore from '@/stores/use-guest-submission-store'
import PageTransition from '@/components/page-transition'

const ConfirmationPage = () => { const reset = useGuestSubmissionStore((state) => state.reset); return <PageShell compact><PageTransition><section className="max-w-lg rounded-[2rem] bg-white p-10 text-center shadow-[0_20px_60px_-35px_rgba(35,25,70,.35)]"><CheckCircle className="mx-auto h-16 w-16 text-emerald-500" /><h1 className="mt-5 text-4xl font-extrabold text-slate-900">¡Todo listo!</h1><p className="mt-3 text-slate-500">Tu recuerdo ya fue enviado al evento. Puedes cerrar esta pestaña cuando quieras.</p><button onClick={reset} className="mt-7 text-sm font-bold text-[var(--event-primary)]">Enviar otro mensaje</button></section></PageTransition></PageShell> }
export default ConfirmationPage
