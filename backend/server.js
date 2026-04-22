const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let db;

async function initDB() {
  db = await mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "taskyboi",
    database: process.env.DB_NAME || "taskyboi",
    waitForConnections: true,
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      text TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      position INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);
}

// --- REST ---
app.get("/projects", async (_, res) => {
  const [rows] = await db.execute("SELECT * FROM projects ORDER BY created_at");
  res.json(rows);
});

app.post("/projects", async (req, res) => {
  const { name, contacts, notes } = req.body;
  const [r] = await db.execute("INSERT INTO projects (name, contacts, notes) VALUES (?,?,?)", [name, contacts||null, notes||null]);
  const project = { id: r.insertId, name, contacts, notes };
  io.emit("project:add", project);
  res.json(project);
});

app.patch("/projects/:id", async (req, res) => {
  const { name, contacts, notes } = req.body;
  await db.execute("UPDATE projects SET name=?, contacts=?, notes=? WHERE id=?", [name, contacts||null, notes||null, req.params.id]);
  const [rows] = await db.execute("SELECT * FROM projects WHERE id=?", [req.params.id]);
  io.emit("project:update", rows[0]);
  res.json(rows[0]);
});

app.delete("/projects/:id", async (req, res) => {
  await db.execute("DELETE FROM projects WHERE id=?", [req.params.id]);
  io.emit("project:delete", Number(req.params.id));
  res.json({ ok: true });
});

app.get("/projects/:id/tasks", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM tasks WHERE project_id=? ORDER BY position, created_at",
    [req.params.id]
  );
  res.json(rows);
});

app.post("/projects/:id/tasks", async (req, res) => {
  const { text } = req.body;
  const projectId = Number(req.params.id);
  const [r] = await db.execute(
    "INSERT INTO tasks (project_id, text) VALUES (?, ?)",
    [projectId, text]
  );
  const task = { id: r.insertId, project_id: projectId, text, done: false };
  io.emit("task:add", task);
  res.json(task);
});

app.patch("/tasks/:id", async (req, res) => {
  const { done, text, description } = req.body;
  if (done !== undefined) {
    await db.execute("UPDATE tasks SET done=? WHERE id=?", [done, req.params.id]);
  }
  if (text !== undefined) {
    await db.execute("UPDATE tasks SET text=? WHERE id=?", [text, req.params.id]);
  }
  if (description !== undefined) {
    await db.execute("UPDATE tasks SET description=? WHERE id=?", [description, req.params.id]);
  }
  const [rows] = await db.execute("SELECT * FROM tasks WHERE id=?", [req.params.id]);
  io.emit("task:update", rows[0]);
  res.json(rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  await db.execute("DELETE FROM tasks WHERE id=?", [req.params.id]);
  io.emit("task:delete", Number(req.params.id));
  res.json({ ok: true });
});

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);
});

// Serve frontend build
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));

initDB().then(() => {
  server.listen(4000, () => console.log("Backend running on :4000"));
});
