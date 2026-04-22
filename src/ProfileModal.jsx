import { useState } from "react";
import { api } from "./api";

export default function ProfileModal({ user, onClose, onUpdate }) {
  const [tab, setTab] = useState("password");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [email, setEmail] = useState(user.email || "");
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState(null);
  const [totpToken, setTotpToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function flash(ok, text) { if (ok) { setMsg(text); setErr(""); } else { setErr(text); setMsg(""); } }

  async function changePassword(e) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return flash(false, "Yeni şifreler eşleşmiyor");
    const res = await api("/profile/password", { method: "PATCH", body: JSON.stringify({ current: pw.current, next: pw.next }) });
    res.ok ? flash(true, "Şifre güncellendi ✓") : flash(false, res.error);
    if (res.ok) setPw({ current: "", next: "", confirm: "" });
  }

  async function saveEmail(e) {
    e.preventDefault();
    await api("/profile/email", { method: "PATCH", body: JSON.stringify({ email }) });
    onUpdate({ ...user, email });
    flash(true, "E-posta güncellendi ✓");
  }

  async function setup2fa() {
    const res = await api("/profile/2fa/setup", { method: "POST" });
    setQr(res.qr);
    setSecret(res.secret);
  }

  async function verify2fa(e) {
    e.preventDefault();
    const res = await api("/profile/2fa/verify", { method: "POST", body: JSON.stringify({ token: totpToken }) });
    if (res.ok) { flash(true, "2FA aktif edildi ✓"); onUpdate({ ...user, totp_enabled: true }); setQr(null); }
    else flash(false, res.error);
  }

  async function disable2fa() {
    await api("/profile/2fa/disable", { method: "POST" });
    onUpdate({ ...user, totp_enabled: false });
    flash(true, "2FA devre dışı bırakıldı");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Profil Ayarları</h2>
          <button className="btn-danger" onClick={onClose}>✕</button>
        </div>

        <div className="tab-bar">
          {["password", "email", "2fa"].map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setMsg(""); setErr(""); }}>
              {t === "password" ? "🔑 Şifre" : t === "email" ? "📧 E-posta" : "🔐 2FA"}
            </button>
          ))}
        </div>

        <div className="pm-body">
          {msg && <div className="flash-ok">{msg}</div>}
          {err && <div className="login-error">{err}</div>}

          {tab === "password" && (
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="password" placeholder="Mevcut şifre" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required />
              <input type="password" placeholder="Yeni şifre" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} required />
              <input type="password" placeholder="Yeni şifre (tekrar)" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required />
              <button className="btn-primary">Güncelle</button>
            </form>
          )}

          {tab === "email" && (
            <form onSubmit={saveEmail} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Proje bildirimlerinin gönderileceği e-posta adresi.</p>
              <input type="email" placeholder="ornek@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn-primary">Kaydet</button>
            </form>
          )}

          {tab === "2fa" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {user.totp_enabled ? (
                <>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>✅ İki faktörlü doğrulama aktif.</p>
                  <button className="btn-danger" style={{ alignSelf: "flex-start", padding: "8px 14px", border: "1px solid #ef4444" }} onClick={disable2fa}>Devre Dışı Bırak</button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Google Authenticator veya Authy ile QR kodu taratın.</p>
                  {!qr && <button className="btn-primary" style={{ alignSelf: "flex-start" }} onClick={setup2fa}>QR Kod Oluştur</button>}
                  {qr && (
                    <>
                      <img src={qr} alt="QR" style={{ width: 180, borderRadius: 8 }} />
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        QR okutamıyorsanız bu kodu uygulamaya manuel girin:
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.95rem", background: "var(--progress-bg)", padding: "8px 12px", borderRadius: 6, letterSpacing: 2, wordBreak: "break-all", userSelect: "all" }}>
                        {secret}
                      </div>
                      <form onSubmit={verify2fa} style={{ display: "flex", gap: 8 }}>
                        <input placeholder="6 haneli kod" value={totpToken} onChange={(e) => setTotpToken(e.target.value)} maxLength={6} style={{ width: 140 }} required />
                        <button className="btn-primary">Doğrula & Aktif Et</button>
                      </form>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="pm-footer" />
      </div>
    </div>
  );
}
