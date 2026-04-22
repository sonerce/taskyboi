import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import TaskModal from "./TaskModal";
import ProjectModal from "./ProjectModal";

const API = window.location.port === "5173" ? "http://localhost:4000" : window.location.origin;
const socket = io(API);

export default function App() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [activeProject, setActiveProject] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [projectModal, setProjectModal] = useState(null); // null | "new" | project obj
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetch(`${API}/projects`).then((r) => r.json()).then((data) => {
      setProjects(data);
      data.forEach((p) => loadTasks(p.id));
    });

    socket.on("project:add", (p) => { setProjects((prev) => [...prev, p]); loadTasks(p.id); });
    socket.on("project:update", (p) => setProjects((prev) => prev.map((x) => x.id === p.id ? p : x)));
    socket.on("project:delete", (id) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setActiveProject((prev) => (prev?.id === id ? null : prev));
    });
    socket.on("task:add", (t) =>
      setTasks((prev) => ({ ...prev, [t.project_id]: [...(prev[t.project_id] || []), t] }))
    );
    socket.on("task:update", (t) =>
      setTasks((prev) => ({
        ...prev,
        [t.project_id]: (prev[t.project_id] || []).map((x) => (x.id === t.id ? t : x)),
      }))
    );
    socket.on("task:delete", (id) =>
      setTasks((prev) => {
        const next = {};
        for (const [pid, list] of Object.entries(prev)) next[pid] = list.filter((t) => t.id !== id);
        return next;
      })
    );
    return () => socket.removeAllListeners();
  }, []);

  function loadTasks(projectId) {
    fetch(`${API}/projects/${projectId}/tasks`)
      .then((r) => r.json())
      .then((data) => setTasks((prev) => ({ ...prev, [projectId]: data })));
  }

  async function handleProjectSave(form) {
    if (projectModal === "new") {
      await fetch(`${API}/projects`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      const updated = await fetch(`${API}/projects/${projectModal.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());
      setActiveProject(updated);
    }
    setProjectModal(null);
  }

  async function deleteProject(id) {
    await fetch(`${API}/projects/${id}`, { method: "DELETE" });
    setActiveProject(null);
  }

  async function addTask() {
    if (!newTask.trim() || !activeProject) return;
    await fetch(`${API}/projects/${activeProject.id}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTask.trim() }),
    });
    setNewTask("");
  }

  async function toggleTask(task) {
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  }

  const projectTasks = (id) => tasks[id] || [];
  const doneCount = (id) => projectTasks(id).filter((t) => t.done).length;

  const ThemeBtn = () => (
    <button className="btn-theme" onClick={() => setDark((d) => !d)}>
      {dark ? "☀️" : "🌙"}
    </button>
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

  // --- DETAIL VIEW ---
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
          <button className="btn-back" onClick={() => setProjectModal(activeProject)}>✏️ Düzenle</button>
          <ThemeBtn />
          <button className="btn-danger" onClick={() => deleteProject(activeProject.id)}>🗑</button>
        </div>

        {activeProject.notes && (
          <div className="project-notes">📋 {activeProject.notes}</div>
        )}

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
          <input
            placeholder="Yeni task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            autoFocus
          />
          <button className="btn-primary" onClick={addTask}>+ Task</button>
        </div>

        {activeTask && (
          <TaskModal
            task={activeTask}
            onClose={() => setActiveTask(null)}
            onUpdate={(updated) => {
              setTasks((prev) => ({
                ...prev,
                [updated.project_id]: (prev[updated.project_id] || []).map((t) => t.id === updated.id ? updated : t),
              }));
              setActiveTask(updated);
            }}
          />
        )}

        {projectModal && (
          <ProjectModal initial={projectModal === "new" ? null : projectModal} onSave={handleProjectSave} onClose={() => setProjectModal(null)} />
        )}
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div className="app">
      <div className="topbar">
        <h1>📋 TaskyBoi</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={() => setProjectModal("new")}>+ Yeni Proje</button>
          <ThemeBtn />
        </div>
      </div>

      <div className="project-grid">
        {projects.map((p) => {
          const total = projectTasks(p.id).length;
          const done = doneCount(p.id);
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <div key={p.id} className="project-card" onClick={() => setActiveProject(p)}>
              <div className="card-top">
                <h2>{p.name}</h2>
                <button className="btn-danger" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}>🗑</button>
              </div>
              {p.contacts && <div className="card-meta">👥 {p.contacts}</div>}
              <div className="card-stats">{done}/{total} tamamlandı</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      {projectModal && (
        <ProjectModal initial={null} onSave={handleProjectSave} onClose={() => setProjectModal(null)} />
      )}
    </div>
  );
}
