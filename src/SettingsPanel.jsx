import { useEffect, useState } from "react";
import { api } from "./api";

const DEFAULTS = { smtp_host: "", smtp_port: "587", smtp_user: "", smtp_pass: "", smtp_from: "" };

export default function SettingsPanel({ onClose }) {
  const [form, setForm] = useState(DEFAULTS);
  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/admin/settings").then((data) => setForm((f) => ({ ...f, ...data })));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    await api("/admin/settings", { method: "POST", body: JSON.stringify(form) });
    setMsg("Ayarlar kaydedildi ✓"); setErr("");
  }

  async function testSMTP() {
    if (!testTo) return setErr("Test e-posta adresi girin");
    setLoading(true); setMsg(""); setErr("");
    const res = await api("/admin/settings/test-smtp", { method: "POST", body: JSON.stringify({ ...form, test_to: testTo }) });
    setLoading(false);
    res.ok ? setMsg("Test maili gönderildi ✓") : setErr(res.error);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Sistem Ayarları</h2>
          <button className="btn-danger" onClick={onClose}>✕</button>
        </div>

        <div className="pm-body">
          <label>SMTP Ayarları</label>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: -8 }}>
            Proje takipçilerine bildirim maili göndermek için doldurun.
          </p>

          {msg && <div className="flash-ok">{msg}</div>}
          {err && <div className="login-error">{err}</div>}

          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8 }}>
              <input placeholder="SMTP Sunucu (smtp.gmail.com)" value={form.smtp_host} onChange={set("smtp_host")} />
              <input placeholder="Port (587)" value={form.smtp_port} onChange={set("smtp_port")} />
            </div>
            <input placeholder="Kullanıcı Adı / E-posta" value={form.smtp_user} onChange={set("smtp_user")} />
            <input type="password" placeholder="Şifre / App Password" value={form.smtp_pass} onChange={set("smtp_pass")} />
            <input placeholder="Gönderen adı (TaskyBoi <no-reply@...>)" value={form.smtp_from} onChange={set("smtp_from")} />
            <button className="btn-primary" type="submit">Kaydet</button>
          </form>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
          <label>SMTP Test</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Test e-posta adresi" value={testTo} onChange={(e) => setTestTo(e.target.value)} style={{ flex: 1 }} />
            <button className="btn-primary" onClick={testSMTP} disabled={loading}>{loading ? "Gönderiliyor..." : "Test Et"}</button>
          </div>
        </div>
        <div className="pm-footer" />
      </div>
    </div>
  );
}
