import { CheckCircle } from 'lucide-react'
import PageShell from '@/components/page-shell'
import useGuestSubmissionStore from '@/stores/use-guest-submission-store'
import PageTransition from '@/components/page-transition'

const ConfirmationPage = () => { const reset = useGuestSubmissionStore((state) => state.reset); return <PageShell compact><PageTransition><section className="surface-card max-w-lg rounded-[2rem] p-10 text-center"><CheckCircle className="mx-auto h-16 w-16 text-accent-foreground" /><h1 className="mt-5 text-4xl font-extrabold text-foreground">¡Todo listo!</h1><p className="mt-3 text-muted-foreground">Tu recuerdo ya fue enviado al evento. Puedes cerrar esta pestaña cuando quieras.</p><button onClick={reset} className="mt-7 text-sm font-bold text-primary">Enviar otro mensaje</button></section></PageTransition></PageShell> }
export default ConfirmationPage
