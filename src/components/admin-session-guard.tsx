import * as React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { sileo } from "sileo";
import { getAdminToken, getAdminTokenExpiry, setAdminToken } from "@/lib/api";

const AdminSessionGuard = () => {
  const navigate = useNavigate();
  const token = getAdminToken();

  React.useEffect(() => {
    if (!token) return;

    const expire = () => {
      setAdminToken(null);
      sileo.error({ title: "Tu sesión ha expirado", description: "Ingresa de nuevo para continuar." });
      navigate("/admin/login", { replace: true });
    };
    const expiresAt = getAdminTokenExpiry(token);
    const timeout = expiresAt ? window.setTimeout(expire, Math.max(0, expiresAt - Date.now())) : null;
    window.addEventListener("envoye:admin-session-expired", expire);

    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
      window.removeEventListener("envoye:admin-session-expired", expire);
    };
  }, [navigate, token]);

  if (!token) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export default AdminSessionGuard;
