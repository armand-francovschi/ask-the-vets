const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const defaultHost =
  typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : "localhost";

const isHttpsPage =
  typeof window !== "undefined" && window.location.protocol === "https:";

const fallbackBaseUrl = isHttpsPage
  ? ""
  : `http://${defaultHost}:5000`;

export const API_BASE_URL = envBaseUrl || fallbackBaseUrl;

export const buildApiUrl = (path: string) =>
  API_BASE_URL
    ? `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
    : `${path.startsWith("/") ? path : `/${path}`}`;

export const SOCKET_BASE_URL = API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
