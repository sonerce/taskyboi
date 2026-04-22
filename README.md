# 📋 TaskyBoi

**EN** · [TR aşağıda](#-taskyboi-türkçe)

---

## 📋 TaskyBoi (English)

A lightweight, real-time collaborative task tracker with authentication, 2FA, email notifications, and project following. No fuss — share the URL and your team is in.

### ✨ Features

- **Authentication** — Login system with JWT tokens (7-day sessions)
- **Admin panel** — Admin creates/deletes users, assigns roles
- **Two-Factor Authentication (2FA)** — TOTP via Google Authenticator / Authy; QR code + manual secret key for devices that can't scan
- **Profile settings** — Change password, update e-mail, enable/disable 2FA
- **Projects** — Create projects with title, contact persons, and notes
- **Tasks** — Add, complete, and delete tasks; completed tasks grouped separately at the bottom
- **Rich text descriptions** — Full TipTap editor per task: bold, italic, headings, lists, code blocks, links, images (paste from clipboard, drag & drop, or URL)
- **Real-time sync** — Changes appear instantly for everyone via WebSockets (Socket.io)
- **Project following** — Follow/unfollow a project to receive e-mail notifications
- **E-mail notifications** — Get notified when a new task is added or a task is completed in a followed project
- **System settings** — Admin configures SMTP from the UI; includes a test-send button
- **Dark mode** — Toggle and preference saved in the browser
- **Progress bar** — Each project card shows completion percentage
- **Docker ready** — Single command to run everything

### 🔐 Default Admin Credentials

```
Username : TaskyBoi
Password : admin123
```

> ⚠️ Change the password immediately after first login via **👤 Profile → 🔑 Password**.

### 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Rich Text Editor | TipTap |
| Real-time | Socket.io |
| Backend | Node.js, Express |
| Authentication | JWT, bcryptjs |
| Two-Factor Auth | speakeasy (TOTP), qrcode |
| E-mail | Nodemailer |
| Database | MySQL 8 |
| Infrastructure | Docker, Docker Compose |

### 🚀 Getting Started

**Prerequisites:** Docker & Docker Compose installed.

```bash
# 1. Clone the repo
git clone https://github.com/sonerce/taskyboi.git
cd taskyboi

# 2. (Optional) Set a custom DB password and JWT secret
cp .env.example .env
nano .env

# 3. Start everything
docker compose up -d

# 4. Open in browser
http://localhost:4000

# Login with: TaskyBoi / admin123
```

### 🌍 Sharing with Your Team

**Same network (office/home Wi-Fi)**
```
http://YOUR_LOCAL_IP:4000
```

**Over the internet (ngrok)**
```bash
ngrok http 4000
# Share the generated https://xxx.ngrok-free.app URL
```

**Production server (VPS)**
Upload the project to any Linux server with Docker, run `docker compose up -d`, point your domain to port 4000.

### 📧 Setting Up E-mail Notifications

1. Log in as admin → **⚙️ Ayarlar**
2. Fill in SMTP details (host, port, user, password, sender)
3. Use **Test Et** to verify the connection
4. Each user goes to **👤 Profile → 📧 E-posta** and saves their e-mail
5. On a project detail page, click **🔔 Takip et** to subscribe to notifications

> For Gmail, use an **App Password** (Google Account → Security → 2-Step Verification → App Passwords), not your regular password.

### 📁 Project Structure

```
taskyboi/
├── backend/
│   ├── server.js        # Express + Socket.io API, auth, 2FA, mailer
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── App.jsx          # Main app + routing logic
│   ├── Login.jsx        # Login page with 2FA step
│   ├── ProfileModal.jsx # Password, e-mail, 2FA settings
│   ├── AdminPanel.jsx   # User management (admin only)
│   ├── SettingsPanel.jsx# SMTP system settings (admin only)
│   ├── TaskModal.jsx    # Rich text task detail modal
│   ├── ProjectModal.jsx # Project create/edit modal
│   ├── api.js           # Fetch wrapper with JWT
│   └── index.css        # Global styles + CSS variables for dark mode
├── dump.sql             # DB schema + seed data
├── docker-compose.yml
└── .env.example
```

---

## 📋 TaskyBoi (Türkçe)

Kimlik doğrulama, 2FA, e-posta bildirimleri ve proje takibi olan hafif, gerçek zamanlı ekip görev takip uygulaması.

### ✨ Özellikler

- **Kimlik doğrulama** — JWT tabanlı giriş sistemi (7 günlük oturum)
- **Admin paneli** — Admin kullanıcı ekler/siler, rol atar
- **İki Faktörlü Doğrulama (2FA)** — Google Authenticator / Authy ile TOTP; QR kod + tarayamayanlar için manuel gizli anahtar
- **Profil ayarları** — Şifre değiştir, e-posta güncelle, 2FA aç/kapat
- **Projeler** — Başlık, irtibat kişileri ve notlarla proje oluştur
- **Görevler** — Task ekle, tamamla, sil; tamamlananlar altta ayrı grupta
- **Zengin metin açıklamaları** — Her task için tam TipTap editörü: kalın, italik, başlıklar, listeler, kod blokları, linkler, görseller (panodan yapıştır, sürükle bırak, URL)
- **Gerçek zamanlı senkronizasyon** — Socket.io ile değişiklikler anında herkese yansır
- **Proje takibi** — Projeyi takip et/bırak, bildirim al
- **E-posta bildirimleri** — Takip edilen projede yeni task eklenince veya task tamamlanınca mail gelir
- **Sistem ayarları** — Admin SMTP bilgilerini UI'dan girer; test gönderme butonu var
- **Karanlık mod** — Tek tıkla geçiş, tercih tarayıcıda saklanır
- **İlerleme çubuğu** — Her proje kartında tamamlanma yüzdesi
- **Docker hazır** — Tek komutla her şey ayağa kalkar

### 🔐 Varsayılan Admin Bilgileri

```
Kullanıcı Adı : TaskyBoi
Şifre         : admin123
```

> ⚠️ İlk girişten sonra hemen şifreyi değiştirin: **👤 Profil → 🔑 Şifre**.

### 🛠 Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend | React 18, Vite |
| Zengin Metin Editörü | TipTap |
| Gerçek Zamanlı | Socket.io |
| Backend | Node.js, Express |
| Kimlik Doğrulama | JWT, bcryptjs |
| İki Faktörlü Doğrulama | speakeasy (TOTP), qrcode |
| E-posta | Nodemailer |
| Veritabanı | MySQL 8 |
| Altyapı | Docker, Docker Compose |

### 🚀 Kurulum

```bash
# 1. Repoyu klonla
git clone https://github.com/sonerce/taskyboi.git
cd taskyboi

# 2. (İsteğe bağlı) DB şifresi ve JWT secret belirle
cp .env.example .env
nano .env

# 3. Başlat
docker compose up -d

# 4. Tarayıcıda aç
http://localhost:4000

# Giriş: TaskyBoi / admin123
```

### 🌍 Ekiple Paylaşım

**Aynı ağda** → `http://LOKAL_IP:4000`

**İnternetten (ngrok)** → `ngrok http 4000`

**VPS** → Docker kurulu sunucuya kopyala, `docker compose up -d`

### 📧 E-posta Bildirimi Kurulumu

1. Admin olarak giriş → **⚙️ Ayarlar** → SMTP bilgilerini doldur → **Test Et**
2. Her kullanıcı → **👤 Profil → 📧 E-posta** → adresini kaydet
3. Proje detayında **🔔 Takip et** butonuna bas

> Gmail için normal şifre yerine **App Password** kullanın.

---

## License

MIT
