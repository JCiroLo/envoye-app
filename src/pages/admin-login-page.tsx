import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PageShell from '@/components/page-shell'
import PageTransition from '@/components/page-transition'
import { api, setAdminToken } from '@/lib/api'

const AdminLoginPage = () => { const navigate = useNavigate(); const [email, setEmail] = React.useState(''); const [password, setPassword] = React.useState(''); const [loading, setLoading] = React.useState(false); const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); try { const result = await api<{ session: { accessToken: string } }>('/api/auth/sign-in', { method: 'POST', body: JSON.stringify({ email, password }) }); setAdminToken(result.session.accessToken); sileo.success({ title: 'Bienvenido de nuevo' }); navigate('/admin') } catch (err) { sileo.error({ title: 'No fue posible iniciar sesión', description: err instanceof Error ? err.message : undefined }) } finally { setLoading(false) } }
  return <PageShell compact><PageTransition><form onSubmit={submit} className="surface-card w-full max-w-md rounded-[2rem] p-8"><div className="brand-mark text-4xl text-primary">Envoye</div><h1 className="mt-6 text-3xl font-extrabold text-foreground">Administrar eventos</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Ingresa con tu cuenta para crear y presentar tus experiencias.</p><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo" className="mt-7" required /><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" className="mt-3" required /><Button className="mt-6 w-full" isLoading={loading}>Ingresar</Button></form></PageTransition></PageShell> }
export default AdminLoginPage
