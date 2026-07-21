import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Gallery3D from '@/components/gallery-3d'
import { api, getAdminToken } from '@/lib/api'
import type { Letter } from '@/stores/use-letter-store'
import type { EventTheme } from '@/lib/event-theme'

type Submission = { id: string; guest_name: string | null; message_text: string | null; media_type: 'text' | 'image' | 'video' | 'audio'; mediaUrl: string | null; created_at: string }

const AdminGalleryPage = () => {
  const { eventId = '' } = useParams(); const navigate = useNavigate(); const [letters, setLetters] = React.useState<Letter[] | null>(null); const [theme, setTheme] = React.useState<EventTheme>()
  React.useEffect(() => { const token = getAdminToken(); if (!token) { navigate('/admin/login'); return } Promise.all([api<{ submissions: Submission[] }>(`/api/events/${eventId}/submissions`, { token }), api<{ event: { theme: EventTheme } }>(`/api/events/${eventId}`, { token })]).then(([{ submissions }, { event }]) => { setTheme(event.theme); setLetters(submissions.map((item) => ({ id: item.id, eventId, userName: item.guest_name || 'Anónimo', message: item.message_text || '', mediaType: item.media_type, mediaUrl: item.mediaUrl || '', createdAt: new Date(item.created_at).getTime() }))) }) }, [eventId, navigate])
  if (!letters) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Cargando mural…</div>
  return <Gallery3D eventId={eventId} lettersOverride={letters} theme={theme} onBack={() => navigate(`/admin/events/${eventId}`)} />
}
export default AdminGalleryPage
