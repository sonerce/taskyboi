import { useEffect, useState } from "react";
import { api } from "./api";

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await api("/admin/users");
    setUsers(data);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function addUser(e) {
    e.preventDefault(); setError("");
    const res = await api("/admin/users", { method: "POST", body: JSON.stringify(form) });
    if (res.error) return setError(res.error);
    setUsers((prev) => [...prev, res]);
    setForm({ username: "", password: "", role: "user" });
  }

  async function deleteUser(id) {
    const res = await api(`/admin/users/${id}`, { method: "DELETE" });
    if (res.error) return alert(res.error);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Kullanıcı Yönetimi</h2>
          <button className="btn-danger" onClick={onClose}>✕</button>
        </div>

        <div className="pm-body">
          <form onSubmit={addUser} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label>Yeni Kullanıcı</label>
            <input placeholder="Kullanıcı adı" value={form.username} onChange={set("username")} required />
            <input type="password" placeholder="Şifre" value={form.password} onChange={set("password")} required />
            <select value={form.role} onChange={set("role")} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text)" }}>
              <option value="user">Kullanıcı</option>
              <option value="admin">Admin</option>
            </select>
            {error && <div className="login-error">{error}</div>}
            <button className="btn-primary" type="submit">+ Ekle</button>
          </form>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

          <label>Mevcut Kullanıcılar</label>
          <ul className="task-list">
            {users.map((u) => (
              <li key={u.id} className="task-item">
                <span className="task-text">
                  <b>{u.username}</b>
                  <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {u.role === "admin" ? "🔑 Admin" : "👤 Kullanıcı"}
                  </span>
                </span>
                <button className="btn-danger" onClick={() => deleteUser(u.id)}>×</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pm-footer" />
      </div>
    </div>
  );
}
