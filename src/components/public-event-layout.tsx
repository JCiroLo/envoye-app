import * as React from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { LoaderCircle } from "lucide-react";
// import { themeStyle } from "@/lib/event-theme";
import PageShell from "@/components/page-shell";
import PageTransition from "@/components/page-transition";
import useEventStore from "@/stores/use-event-store";
import useGuestSubmissionStore from "@/stores/use-guest-submission-store";
import { preloadPublicCover, publicCoverUrls } from "@/lib/public-cover";

const PublicEventLayout = () => {
  const { accessCode = "" } = useParams();
  const location = useLocation();
  const normalizedCode = accessCode.trim().toUpperCase();
  const { event, eventAccessCode, loading, loadEvent } = useEventStore(
    useShallow((state) => ({
      event: state.event,
      eventAccessCode: state.accessCode,
      loading: state.loading,
      loadEvent: state.loadEvent,
    })),
  );

  React.useEffect(() => {
    if (!normalizedCode) return;
    preloadPublicCover(normalizedCode);
    void loadEvent(normalizedCode);
  }, [normalizedCode, loadEvent]);

  const optimisticCover = publicCoverUrls(normalizedCode);

  if (loading || eventAccessCode !== normalizedCode) {
    return (
      <PageShell
        className="w-full flex items-center justify-center"
        background={optimisticCover.cover}
        backgroundPlaceholder={optimisticCover.placeholder}
      >
        <PageTransition className="flex items-center justify-center z-10">
          <LoaderCircle className="mr-2 h-8 w-8 animate-spin" />
          <p className="text-2xl">Abriendo invitación</p>
        </PageTransition>
      </PageShell>
    );
  }

  const { media, messageText, consented } = useGuestSubmissionStore.getState();
  const basePath = `/invite/${accessCode}`;
  const step = location.pathname.slice(basePath.length).replace(/^\//, "");
  const hasSubmission = Boolean(media || messageText.trim());
  const startedFromInvitation = Boolean((location.state as { startsSubmission?: boolean } | null)?.startsSubmission);
  const submitted = Boolean((location.state as { submitted?: boolean } | null)?.submitted);

  if (event && !hasSubmission && step === "record" && !startedFromInvitation) {
    return <Navigate to={basePath} replace />;
  }
  if (event && !hasSubmission && ["privacy", "review", "details"].includes(step)) {
    return <Navigate to={basePath} replace />;
  }
  if (event && step === "details" && !consented) {
    return <Navigate to={`${basePath}/record`} replace state={{ startsSubmission: true }} />;
  }
  if (event && step === "confirmation" && !submitted) {
    return <Navigate to={basePath} replace />;
  }

  // return <div style={themeStyle(event?.theme_name)}><Outlet /></div>;
  return <Outlet />;
};

export default PublicEventLayout;
