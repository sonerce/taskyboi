export const BASE = window.location.port === "5173" ? "http://localhost:4000" : window.location.origin;

export function getToken() { return localStorage.getItem("token"); }
export function getUser() { const u = localStorage.getItem("user"); return u ? JSON.parse(u) : null; }
export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  if (res.status === 401) { clearSession(); window.location.reload(); }
  return res.json();
}
