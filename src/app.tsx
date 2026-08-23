import { AnimatePresence } from "framer-motion";
import { Toaster } from "sileo";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import AdminEventPage from "@/pages/admin/event-page";
import AdminGalleryPage from "@/pages/admin/gallery-page";
import AdminLoginPage from "@/pages/admin/login-page";
import ConfirmationPage from "@/pages/guest/confirmation-page";
import InvitePage from "@/pages/guest/invite-page";
import RecordingPage from "@/pages/guest/recording-page";
import WelcomePage from "@/pages/guest/welcome-page";
import PublicEventLayout from "@/components/public-event-layout";
import AdminSessionGuard from "@/components/admin-session-guard";

const RoutedApp = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/invite/:accessCode" element={<PublicEventLayout />}>
          <Route index element={<InvitePage />} />
          <Route path="record" element={<RecordingPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminSessionGuard />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/events/new" element={<AdminEventPage />} />
          <Route path="/admin/events/:eventId" element={<AdminEventPage />} />
          <Route path="/admin/events/:eventId/gallery" element={<AdminGalleryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
const App = () => (
  <BrowserRouter>
    <Toaster position="top-right" />
    <RoutedApp />
  </BrowserRouter>
);

export default App;
