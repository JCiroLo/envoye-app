import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/button'
import PageShell from '@/components/page-shell'
import useGuestSubmissionStore from '@/stores/use-guest-submission-store'

const ReviewPage = () => {
  const { accessCode = '' } = useParams(); const navigate = useNavigate(); const state = useGuestSubmissionStore()
  if (!state.messageText && !state.media) { navigate(`/invite/${accessCode}/record`); return null }
  return <PageShell><section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-7 shadow-xl"><h1 className="text-4xl text-slate-800">Revisa tu mensaje</h1><p className="mt-2 text-slate-500">Todo se ve bien? Aún puedes volver a grabar.</p>
    {state.mediaPreviewUrl && <div className="mt-6 overflow-hidden rounded-2xl bg-slate-950">{state.mediaType === 'image' ? <img src={state.mediaPreviewUrl} className="max-h-[26rem] w-full object-contain" /> : state.mediaType === 'video' ? <video src={state.mediaPreviewUrl} controls className="w-full" /> : <audio src={state.mediaPreviewUrl} controls className="w-full p-5" />}</div>}
    {state.messageText && <p className="mt-5 rounded-2xl bg-violet-50 p-5 text-slate-700">{state.messageText}</p>}
    <div className="mt-7 flex justify-between"><Link to={`/invite/${accessCode}/record`}><Button variant="outline">Grabar de nuevo</Button></Link><Button onClick={() => navigate(`/invite/${accessCode}/details`)}>Enviar</Button></div>
  </section></PageShell>
}
export default ReviewPage
