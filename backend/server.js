const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "taskyboi_secret_change_in_prod";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
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

  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user',
    totp_secret VARCHAR(64) NULL,
    totp_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contacts TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    position INT DEFAULT 0,
    description LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS settings (
    \`key\` VARCHAR(100) PRIMARY KEY,
    \`value\` TEXT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS project_followers (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  const [rows] = await db.execute("SELECT COUNT(*) as c FROM users");
  if (rows[0].c === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    await db.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')", ["TaskyBoi", hash]);
    console.log("Default admin → username: TaskyBoi / password: admin123");
  }
}

// ── MAILER ───────────────────────────────────────────────────────────────────
async function getSetting(key) {
  const [r] = await db.execute("SELECT `value` FROM settings WHERE `key`=?", [key]);
  return r[0]?.value || null;
}

async function getTransporter() {
  const host = await getSetting("smtp_host");
  const port = await getSetting("smtp_port");
  const user = await getSetting("smtp_user");
  const pass = await getSetting("smtp_pass");
  const from = await getSetting("smtp_from");
  if (!host || !user || !pass) return null;
  return { transporter: nodemailer.createTransport({ host, port: Number(port) || 587, secure: Number(port) === 465, auth: { user, pass } }), from: from || user };
}

async function sendNotification({ projectId, subject, html }) {
  const smtp = await getTransporter();
  if (!smtp) return;
  const [followers] = await db.execute(
    `SELECT u.email FROM project_followers pf
     JOIN users u ON u.id = pf.user_id
     WHERE pf.project_id = ? AND u.email IS NOT NULL AND u.email != ''`,
    [projectId]
  );
  for (const f of followers) {
    await smtp.transporter.sendMail({ from: smtp.from, to: f.email, subject, html }).catch(console.error);
  }
}

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
}
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
  const { username, password, totp } = req.body;
  const [rows] = await db.execute("SELECT * FROM users WHERE username=?", [username]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });

  if (user.totp_enabled) {
    if (!totp) return res.status(200).json({ require2fa: true });
    const ok = speakeasy.totp.verify({ secret: user.totp_secret, encoding: "base32", token: totp, window: 1 });
    if (!ok) return res.status(401).json({ error: "Geçersiz 2FA kodu" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, totp_enabled: user.totp_enabled } });
});

// ── PROFILE ───────────────────────────────────────────────────────────────────
app.patch("/profile/password", auth, async (req, res) => {
  const { current, next } = req.body;
  const [rows] = await db.execute("SELECT password_hash FROM users WHERE id=?", [req.user.id]);
  if (!(await bcrypt.compare(current, rows[0].password_hash)))
    return res.status(400).json({ error: "Mevcut şifre hatalı" });
  const hash = await bcrypt.hash(next, 10);
  await db.execute("UPDATE users SET password_hash=? WHERE id=?", [hash, req.user.id]);
  res.json({ ok: true });
});

app.patch("/profile/email", auth, async (req, res) => {
  await db.execute("UPDATE users SET email=? WHERE id=?", [req.body.email, req.user.id]);
  res.json({ ok: true });
});

// ── 2FA ───────────────────────────────────────────────────────────────────────
app.post("/profile/2fa/setup", auth, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `TaskyBoi (${req.user.username})` });
  await db.execute("UPDATE users SET totp_secret=? WHERE id=?", [secret.base32, req.user.id]);
  const qr = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ qr, secret: secret.base32 });
});

app.post("/profile/2fa/verify", auth, async (req, res) => {
  const [rows] = await db.execute("SELECT totp_secret FROM users WHERE id=?", [req.user.id]);
  const ok = speakeasy.totp.verify({ secret: rows[0].totp_secret, encoding: "base32", token: req.body.token, window: 1 });
  if (!ok) return res.status(400).json({ error: "Geçersiz kod" });
  await db.execute("UPDATE users SET totp_enabled=TRUE WHERE id=?", [req.user.id]);
  res.json({ ok: true });
});

app.post("/profile/2fa/disable", auth, async (req, res) => {
  await db.execute("UPDATE users SET totp_enabled=FALSE, totp_secret=NULL WHERE id=?", [req.user.id]);
  res.json({ ok: true });
});

// ── ADMIN: USERS ──────────────────────────────────────────────────────────────
app.get("/admin/users", auth, adminOnly, async (_, res) => {
  const [rows] = await db.execute("SELECT id, username, email, role, totp_enabled, created_at FROM users ORDER BY created_at");
  res.json(rows);
});

app.post("/admin/users", auth, adminOnly, async (req, res) => {
  const { username, password, role, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Eksik alan" });
  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await db.execute("INSERT INTO users (username, password_hash, role, email) VALUES (?,?,?,?)", [username, hash, role || "user", email || null]);
    res.json({ id: r.insertId, username, role: role || "user", email });
  } catch { res.status(409).json({ error: "Bu kullanıcı adı zaten var" }); }
});

app.patch("/admin/users/:id/password", auth, adminOnly, async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  await db.execute("UPDATE users SET password_hash=? WHERE id=?", [hash, req.params.id]);
  res.json({ ok: true });
});

app.delete("/admin/users/:id", auth, adminOnly, async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: "Kendinizi silemezsiniz" });
  await db.execute("DELETE FROM users WHERE id=?", [req.params.id]);
  res.json({ ok: true });
});

// ── ADMIN: SETTINGS ───────────────────────────────────────────────────────────
app.get("/admin/settings", auth, adminOnly, async (_, res) => {
  const [rows] = await db.execute("SELECT `key`, `value` FROM settings");
  const obj = {};
  rows.forEach((r) => (obj[r.key] = r.value));
  res.json(obj);
});

app.post("/admin/settings", auth, adminOnly, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await db.execute("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?", [key, value, value]);
  }
  res.json({ ok: true });
});

app.post("/admin/settings/test-smtp", auth, adminOnly, async (req, res) => {
  const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, test_to } = req.body;
  try {
    const t = nodemailer.createTransport({ host: smtp_host, port: Number(smtp_port) || 587, secure: Number(smtp_port) === 465, auth: { user: smtp_user, pass: smtp_pass } });
    await t.sendMail({ from: smtp_from || smtp_user, to: test_to, subject: "TaskyBoi SMTP Test", html: "<p>SMTP bağlantısı başarılı! ✅</p>" });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── PROJECT FOLLOW ────────────────────────────────────────────────────────────
app.get("/projects/:id/follow", auth, async (req, res) => {
  const [r] = await db.execute("SELECT 1 FROM project_followers WHERE user_id=? AND project_id=?", [req.user.id, req.params.id]);
  res.json({ following: r.length > 0 });
});

app.post("/projects/:id/follow", auth, async (req, res) => {
  await db.execute("INSERT IGNORE INTO project_followers (user_id, project_id) VALUES (?,?)", [req.user.id, req.params.id]);
  res.json({ ok: true });
});

app.delete("/projects/:id/follow", auth, async (req, res) => {
  await db.execute("DELETE FROM project_followers WHERE user_id=? AND project_id=?", [req.user.id, req.params.id]);
  res.json({ ok: true });
});

// ── PROJECTS ──────────────────────────────────────────────────────────────────
app.get("/projects", auth, async (_, res) => {
  const [rows] = await db.execute("SELECT * FROM projects ORDER BY created_at");
  res.json(rows);
});

app.post("/projects", auth, async (req, res) => {
  const { name, contacts, notes } = req.body;
  const [r] = await db.execute("INSERT INTO projects (name, contacts, notes) VALUES (?,?,?)", [name, contacts || null, notes || null]);
  const project = { id: r.insertId, name, contacts, notes };
  io.emit("project:add", project);
  res.json(project);
});

app.patch("/projects/:id", auth, async (req, res) => {
  const { name, contacts, notes } = req.body;
  await db.execute("UPDATE projects SET name=?, contacts=?, notes=? WHERE id=?", [name, contacts || null, notes || null, req.params.id]);
  const [rows] = await db.execute("SELECT * FROM projects WHERE id=?", [req.params.id]);
  io.emit("project:update", rows[0]);
  res.json(rows[0]);
});

app.delete("/projects/:id", auth, async (req, res) => {
  await db.execute("DELETE FROM projects WHERE id=?", [req.params.id]);
  io.emit("project:delete", Number(req.params.id));
  res.json({ ok: true });
});

// ── TASKS ─────────────────────────────────────────────────────────────────────
app.get("/projects/:id/tasks", auth, async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM tasks WHERE project_id=? ORDER BY position, created_at", [req.params.id]);
  res.json(rows);
});

app.post("/projects/:id/tasks", auth, async (req, res) => {
  const { text } = req.body;
  const projectId = Number(req.params.id);
  const [r] = await db.execute("INSERT INTO tasks (project_id, text) VALUES (?, ?)", [projectId, text]);
  const task = { id: r.insertId, project_id: projectId, text, done: false };
  io.emit("task:add", task);

  const [proj] = await db.execute("SELECT name FROM projects WHERE id=?", [projectId]);
  sendNotification({
    projectId,
    subject: `📋 Yeni görev: ${text}`,
    html: `<p><b>${proj[0]?.name}</b> projesine yeni görev eklendi:</p><p><b>${text}</b></p>`,
  });

  res.json(task);
});

app.patch("/tasks/:id", auth, async (req, res) => {
  const { done, text, description } = req.body;
  if (done !== undefined) await db.execute("UPDATE tasks SET done=? WHERE id=?", [done, req.params.id]);
  if (text !== undefined) await db.execute("UPDATE tasks SET text=? WHERE id=?", [text, req.params.id]);
  if (description !== undefined) await db.execute("UPDATE tasks SET description=? WHERE id=?", [description, req.params.id]);
  const [rows] = await db.execute("SELECT * FROM tasks WHERE id=?", [req.params.id]);
  const task = rows[0];
  io.emit("task:update", task);

  if (done === true) {
    const [proj] = await db.execute("SELECT name FROM projects WHERE id=?", [task.project_id]);
    sendNotification({
      projectId: task.project_id,
      subject: `✅ Görev tamamlandı: ${task.text}`,
      html: `<p><b>${proj[0]?.name}</b> projesinde bir görev tamamlandı:</p><p><b>${task.text}</b></p>`,
    });
  }

  res.json(task);
});

app.delete("/tasks/:id", auth, async (req, res) => {
  await db.execute("DELETE FROM tasks WHERE id=?", [req.params.id]);
  io.emit("task:delete", Number(req.params.id));
  res.json({ ok: true });
});

io.on("connection", (socket) => console.log("connected:", socket.id));

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));

initDB().then(() => server.listen(4000, () => console.log("Backend :4000")));
