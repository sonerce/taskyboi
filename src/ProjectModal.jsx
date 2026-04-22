import { useState, useEffect } from "react";

export default function ProjectModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", contacts: "", notes: "", ...initial });

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? "Projeyi Düzenle" : "Yeni Proje"}</h2>
          <button className="btn-danger" onClick={onClose}>✕</button>
        </div>

        <div className="pm-body">
          <label>Proje Adı *</label>
          <input placeholder="İPYD Revizeler" value={form.name} onChange={set("name")} autoFocus />

          <label>İrtibat Kişileri</label>
          <input placeholder="Ahmet, Özkan, Soner..." value={form.contacts} onChange={set("contacts")} />

          <label>Notlar</label>
          <textarea placeholder="Proje hakkında notlar..." value={form.notes} onChange={set("notes")} rows={4} />
        </div>

        <div className="pm-footer">
          <button className="btn-primary" disabled={!form.name.trim()} onClick={() => onSave(form)}>
            {initial ? "Kaydet" : "Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
