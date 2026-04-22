# 📋 TaskyBoi

**EN** · [TR aşağıda](#-taskyboi-türkçe)

---

## 📋 TaskyBoi (English)

A lightweight, real-time collaborative task tracker. No login required — anyone with the link can create projects, manage tasks, and leave rich notes instantly visible to the whole team.

### ✨ Features

- **Projects** — Create projects with a title, contact persons, and notes
- **Tasks** — Add, complete, and delete tasks under each project
- **Rich text descriptions** — Each task has a full editor: bold, italic, headings, lists, code blocks, links, and images (paste from clipboard, drag & drop, or URL)
- **Real-time sync** — Changes appear instantly for everyone via WebSockets (Socket.io)
- **No login** — Share the URL, anyone can edit
- **Dark mode** — Toggle and preference is saved in the browser
- **Progress bar** — Each project card shows completion percentage
- **Docker ready** — One command to run everything

### 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Rich Text Editor | TipTap |
| Real-time | Socket.io |
| Backend | Node.js, Express |
| Database | MySQL 8 |
| Infrastructure | Docker, Docker Compose |

### 🚀 Getting Started

**Prerequisites:** Docker & Docker Compose installed.

```bash
# 1. Clone the repo
git clone https://github.com/sonerce/taskyboi.git
cd taskyboi

# 2. (Optional) Set a custom DB password
cp .env.example .env
nano .env

# 3. Start everything
docker compose up -d

# 4. Open in browser
http://localhost:4000
```

### 🌍 Sharing with your team

**Same network (office/home WiFi)**
```
http://YOUR_LOCAL_IP:4000
```

**Over the internet (ngrok)**
```bash
ngrok http 4000
# Share the generated https://xxx.ngrok-free.app URL
```

**Production server (VPS)**
Upload the project to any Linux server with Docker, run `docker compose up -d`, and point your domain to port 4000.

### 📁 Project Structure

```
taskyboi/
├── backend/
│   ├── server.js        # Express + Socket.io API
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── App.jsx          # Main app + routing logic
│   ├── TaskModal.jsx    # Rich text task detail modal
│   ├── ProjectModal.jsx # Project create/edit modal
│   └── index.css        # Global styles + dark mode variables
├── dump.sql             # Initial DB schema + seed data
├── docker-compose.yml
└── .env.example
```

---

## 📋 TaskyBoi (Türkçe)

Giriş gerektirmeyen, gerçek zamanlı bir ekip görev takip uygulaması. Linki olan herkes proje oluşturabilir, görev ekleyebilir ve notlar bırakabilir — her şey anında tüm ekipte görünür.

### ✨ Özellikler

- **Projeler** — Başlık, irtibat kişileri ve notlarla proje oluştur
- **Görevler** — Her projeye task ekle, tamamla, sil
- **Zengin metin açıklamaları** — Her task'a tam editörle açıklama: kalın, italik, başlıklar, listeler, kod blokları, linkler ve görseller (panodan yapıştır, sürükle bırak veya URL)
- **Gerçek zamanlı senkronizasyon** — Yapılan değişiklikler WebSocket (Socket.io) ile anında herkese yansır
- **Giriş yok** — URL'yi paylaş, herkes düzenleyebilir
- **Karanlık mod** — Tek tıkla geçiş, tercih tarayıcıda saklanır
- **İlerleme çubuğu** — Her proje kartında tamamlanma yüzdesi görünür
- **Docker hazır** — Tek komutla her şey ayağa kalkar

### 🛠 Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend | React 18, Vite |
| Zengin Metin Editörü | TipTap |
| Gerçek Zamanlı | Socket.io |
| Backend | Node.js, Express |
| Veritabanı | MySQL 8 |
| Altyapı | Docker, Docker Compose |

### 🚀 Kurulum

**Gereksinim:** Docker ve Docker Compose kurulu olmalı.

```bash
# 1. Repoyu klonla
git clone https://github.com/sonerce/taskyboi.git
cd taskyboi

# 2. (İsteğe bağlı) Özel DB şifresi belirle
cp .env.example .env
nano .env

# 3. Her şeyi başlat
docker compose up -d

# 4. Tarayıcıda aç
http://localhost:4000
```

### 🌍 Ekiple Paylaşım

**Aynı ağda (ofis/ev WiFi)**
```
http://LOKAL_IP_ADRESINIZ:4000
```

**İnternetten (ngrok)**
```bash
ngrok http 4000
# Oluşan https://xxx.ngrok-free.app linkini paylaş
```

**Sunucu (VPS)**
Projeyi Docker kurulu herhangi bir Linux sunucusuna yükle, `docker compose up -d` çalıştır, domain'ini 4000 portuna yönlendir.

---

## License

MIT
