import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sileo'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminDashboardPage from '@/pages/admin-dashboard-page'
import AdminEventPage from '@/pages/admin-event-page'
import AdminGalleryPage from '@/pages/admin-gallery-page'
import AdminLoginPage from '@/pages/admin-login-page'
import ConfirmationPage from '@/pages/confirmation-page'
import FinalDetailsPage from '@/pages/final-details-page'
import InvitePage from '@/pages/invite-page'
import PrivacyPage from '@/pages/privacy-page'
import RecordingPage from '@/pages/recording-page'
import ReviewPage from '@/pages/review-page'
import WelcomePage from '@/pages/welcome-page'

const RoutedApp = () => { const location = useLocation(); return <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/invite/:accessCode" element={<InvitePage />} />
      <Route path="/invite/:accessCode/record" element={<RecordingPage />} />
      <Route path="/invite/:accessCode/privacy" element={<PrivacyPage />} />
      <Route path="/invite/:accessCode/review" element={<ReviewPage />} />
      <Route path="/invite/:accessCode/details" element={<FinalDetailsPage />} />
      <Route path="/invite/:accessCode/confirmation" element={<ConfirmationPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/events/new" element={<AdminEventPage />} />
      <Route path="/admin/events/:eventId" element={<AdminEventPage />} />
      <Route path="/admin/events/:eventId/gallery" element={<AdminGalleryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></AnimatePresence> }
const App = () => <BrowserRouter><Toaster position="top-right" /><RoutedApp /></BrowserRouter>

export default App
