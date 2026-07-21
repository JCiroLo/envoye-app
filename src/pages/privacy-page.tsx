import { ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/button'
import PageShell from '@/components/page-shell'
import useGuestSubmissionStore from '@/stores/use-guest-submission-store'
import PageTransition from '@/components/page-transition'

const PrivacyPage = () => {
  const { accessCode = '' } = useParams(); const navigate = useNavigate(); const { setConsented } = useGuestSubmissionStore()
  return <PageShell compact><PageTransition><section className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(35,25,70,.35)]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><ShieldCheck /></div><h1 className="mt-5 text-3xl font-extrabold text-slate-900">Antes de enviar</h1><p className="mt-4 leading-relaxed text-slate-600">Tu mensaje será público dentro del mural de este evento. Los anfitriones y asistentes autorizados podrán verlo durante la experiencia.</p><div className="mt-8 flex gap-3"><Link className="flex-1" to={`/invite/${accessCode}/record`}><Button variant="outline" className="w-full">Volver</Button></Link><Button className="flex-1" onClick={() => { setConsented(true); navigate(`/invite/${accessCode}/details`) }}>Acepto</Button></div></section></PageTransition></PageShell>
}
export default PrivacyPage
