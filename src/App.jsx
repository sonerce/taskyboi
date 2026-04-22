import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BASE, api, getUser, clearSession } from "./api";
import TaskModal from "./TaskModal";
import ProjectModal from "./ProjectModal";
import AdminPanel from "./AdminPanel";
import SettingsPanel from "./SettingsPanel";
import ProfileModal from "./ProfileModal";
import Login from "./Login";

const socket = io(BASE);

export default function App() {
  const [user, setUser] = useState(getUser());
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [activeProject, setActiveProject] = useState(null);
  const [following, setFollowing] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [projectModal, setProjectModal] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (!user) return;
    api("/projects").then((data) => {
      setProjects(data);
      data.forEach((p) => loadTasks(p.id));
    });
    socket.on("project:add", (p) => { setProjects((prev) => [...prev, p]); loadTasks(p.id); });
    socket.on("project:update", (p) => { setProjects((prev) => prev.map((x) => x.id === p.id ? p : x)); setActiveProject((a) => a?.id === p.id ? p : a); });
    socket.on("project:delete", (id) => { setProjects((prev) => prev.filter((p) => p.id !== id)); setActiveProject((a) => a?.id === id ? null : a); });
    socket.on("task:add", (t) => setTasks((prev) => ({ ...prev, [t.project_id]: [...(prev[t.project_id] || []), t] })));
    socket.on("task:update", (t) => setTasks((prev) => ({ ...prev, [t.project_id]: (prev[t.project_id] || []).map((x) => x.id === t.id ? t : x) })));
    socket.on("task:delete", (id) => setTasks((prev) => { const n = {}; for (const [pid, list] of Object.entries(prev)) n[pid] = list.filter((t) => t.id !== id); return n; }));
    return () => socket.removeAllListeners();
  }, [user]);

  useEffect(() => {
    if (!activeProject) return;
    api(`/projects/${activeProject.id}/follow`).then((r) => setFollowing(r.following));
  }, [activeProject]);

  function loadTasks(projectId) {
    api(`/projects/${projectId}/tasks`).then((data) => setTasks((prev) => ({ ...prev, [projectId]: data })));
  }

  async function toggleFollow() {
    if (following) {
      await api(`/projects/${activeProject.id}/follow`, { method: "DELETE" });
      setFollowing(false);
    } else {
      await api(`/projects/${activeProject.id}/follow`, { method: "POST" });
      setFollowing(true);
    }
  }

  async function handleProjectSave(form) {
    if (projectModal === "new") {
      await api("/projects", { method: "POST", body: JSON.stringify(form) });
    } else {
      const updated = await api(`/projects/${projectModal.id}`, { method: "PATCH", body: JSON.stringify(form) });
      setActiveProject(updated);
    }
    setProjectModal(null);
  }

  async function deleteProject(id) {
    await api(`/projects/${id}`, { method: "DELETE" });
    setActiveProject(null);
  }

  async function addTask() {
    if (!newTask.trim() || !activeProject) return;
    await api(`/projects/${activeProject.id}/tasks`, { method: "POST", body: JSON.stringify({ text: newTask.trim() }) });
    setNewTask("");
  }

  async function toggleTask(task) {
    await api(`/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ done: !task.done }) });
  }

  async function deleteTask(id) {
    await api(`/tasks/${id}`, { method: "DELETE" });
  }

  function logout() { clearSession(); setUser(null); setProjects([]); setTasks({}); }

  const updateUser = (u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); };

  const projectTasks = (id) => tasks[id] || [];
  const doneCount = (id) => projectTasks(id).filter((t) => t.done).length;

  const ThemeBtn = () => (
    <button className="btn-theme" onClick={() => setDark((d) => !d)}>{dark ? "☀️" : "🌙"}</button>
  );

  const TaskItem = ({ t }) => (
    <li className="task-item">
      <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t)} />
      <span className={`task-text ${t.done ? "done" : ""}`} onClick={() => setActiveTask(t)} style={{ cursor: "pointer" }}>
        {t.text}{t.description && t.description !== "<p></p>" ? " 📝" : ""}
      </span>
      <button className="btn-danger" onClick={() => deleteTask(t.id)}>×</button>
    </li>
  );

  if (!user) return <Login onLogin={setUser} />;

  // ── DETAIL ──────────────────────────────────────────────────────────────────
  if (activeProject) {
    const all = projectTasks(activeProject.id);
    const pending = all.filter((t) => !t.done);
    const done = all.filter((t) => t.done);
    return (
      <div className="app">
        <div className="detail-header">
          <button className="btn-back" onClick={() => setActiveProject(null)}>← Projeler</button>
          <div className="detail-title">
            <h1>{activeProject.name}</h1>
            {activeProject.contacts && <span className="meta">👥 {activeProject.contacts}</span>}
          </div>
          <button className={`btn-follow ${following ? "following" : ""}`} onClick={toggleFollow}>
            {following ? "🔔 Takip ediliyor" : "🔕 Takip et"}
          </button>
          <button className="btn-back" onClick={() => setProjectModal(activeProject)}>✏️</button>
          <ThemeBtn />
          <button className="btn-danger" onClick={() => deleteProject(activeProject.id)}>🗑</button>
        </div>

        {activeProject.notes && <div className="project-notes">📋 {activeProject.notes}</div>}

        <ul className="task-list">
          {pending.map((t) => <TaskItem key={t.id} t={t} />)}
        </ul>

        {done.length > 0 && (
          <>
            <div className="done-divider">✅ Tamamlananlar ({done.length})</div>
            <ul className="task-list done-group">
              {done.map((t) => <TaskItem key={t.id} t={t} />)}
            </ul>
          </>
        )}

        <div className="task-add-row">
          <input placeholder="Yeni task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} autoFocus />
          <button className="btn-primary" onClick={addTask}>+ Task</button>
        </div>

        {activeTask && <TaskModal task={activeTask} onClose={() => setActiveTask(null)} onUpdate={(u) => { setTasks((prev) => ({ ...prev, [u.project_id]: (prev[u.project_id] || []).map((t) => t.id === u.id ? u : t) })); setActiveTask(u); }} />}
        {projectModal && <ProjectModal initial={projectModal === "new" ? null : projectModal} onSave={handleProjectSave} onClose={() => setProjectModal(null)} />}
      </div>
    );
  }

  // ── GRID ────────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="topbar">
        <h1>📋 TaskyBoi</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user.role === "admin" && <>
            <button className="btn-back" onClick={() => setShowAdmin(true)}>👥 Kullanıcılar</button>
            <button className="btn-back" onClick={() => setShowSettings(true)}>⚙️ Ayarlar</button>
          </>}
          <button className="btn-primary" onClick={() => setProjectModal("new")}>+ Yeni Proje</button>
          <button className="btn-back" onClick={() => setShowProfile(true)}>👤 {user.username}</button>
          <ThemeBtn />
          <button className="btn-back" onClick={logout}>Çıkış</button>
        </div>
      </div>

      <div className="project-grid">
        {projects.map((p) => {
          const total = projectTasks(p.id).length;
          const done = doneCount(p.id);
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <div key={p.id} className="project-card" onClick={() => setActiveProject(p)}>
              <div className="card-top"><h2>{p.name}</h2>
                <button className="btn-danger" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}>🗑</button>
              </div>
              {p.contacts && <div className="card-meta">👥 {p.contacts}</div>}
              <div className="card-stats">{done}/{total} tamamlandı</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      {projectModal && <ProjectModal initial={null} onSave={handleProjectSave} onClose={() => setProjectModal(null)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={updateUser} />}
    </div>
  );
}
