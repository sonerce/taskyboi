import { useState } from "react";
import { BASE, setSession } from "./api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [totp, setTotp] = useState("");
  const [step, setStep] = useState("login"); // "login" | "2fa"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const body = step === "2fa" ? { ...form, totp } : form;
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (data.require2fa) return setStep("2fa");
    if (!res.ok) return setError(data.error);
    setSession(data.token, data.user);
    onLogin(data.user);
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <h1>📋 TaskyBoi</h1>
        {step === "login" ? (
          <>
            <input placeholder="Kullanıcı adı" value={form.username} onChange={set("username")} autoFocus />
            <input type="password" placeholder="Şifre" value={form.password} onChange={set("password")} />
          </>
        ) : (
          <>
            <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              🔐 Authenticator uygulamanızdaki 6 haneli kodu girin
            </p>
            <input placeholder="000000" value={totp} onChange={(e) => setTotp(e.target.value)} maxLength={6} autoFocus style={{ textAlign: "center", letterSpacing: 8, fontSize: "1.3rem" }} />
          </>
        )}
        {error && <div className="login-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "..." : step === "2fa" ? "Doğrula" : "Giriş Yap"}</button>
        {step === "2fa" && <button type="button" style={{ background: "none", color: "var(--text-muted)", fontSize: "0.85rem" }} onClick={() => setStep("login")}>← Geri</button>}
      </form>
    </div>
  );
}
