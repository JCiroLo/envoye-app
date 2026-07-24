const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type RequestOptions = RequestInit & { token?: string };

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const api = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);

  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && options.token) {
      setAdminToken(null);
      window.dispatchEvent(new Event("envoye:admin-session-expired"));
    }
    throw new ApiError(body.error ?? "No fue posible completar la solicitud.", response.status);
  }

  return body as T;
};

export const getAdminToken = () => sessionStorage.getItem("envoye_admin_token");

export const setAdminToken = (token: string | null) => {
  if (token) sessionStorage.setItem("envoye_admin_token", token);
  else sessionStorage.removeItem("envoye_admin_token");
};

export const getAdminTokenExpiry = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};
