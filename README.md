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

Giriş sistemi, iki faktörlü doğrulama, e-posta bildirimleri ve proje takibi içeren hafif, gerçek zamanlı bir ekip görev yönetim uygulaması.

### ✨ Özellikler

- **Kimlik doğrulama** — JWT tabanlı giriş sistemi; oturumlar 7 gün geçerli
- **Yönetici paneli** — Yönetici kullanıcı ekler, siler ve rol atar
- **İki Faktörlü Doğrulama (2FA)** — Google Authenticator veya Authy ile TOTP desteği; QR kod okutamayanlara özel manuel gizli anahtar gösterimi
- **Profil ayarları** — Şifre değiştirme, e-posta güncelleme, 2FA etkinleştirme/devre dışı bırakma
- **Projeler** — Başlık, irtibat kişileri ve notlarla proje oluşturma ve düzenleme
- **Görevler** — Görev ekleme, tamamlama ve silme; tamamlanan görevler sayfanın altında ayrı grupta listelenir
- **Zengin metin açıklamaları** — Her göreve özel tam özellikli metin editörü: kalın, italik, başlıklar, madde listeleri, kod blokları, bağlantı ve görsel ekleme (panodan yapıştırma, sürükle bırak veya URL ile)
- **Gerçek zamanlı eşitleme** — Yapılan değişiklikler WebSocket aracılığıyla anında tüm kullanıcılara yansır
- **Proje takibi** — İstediğiniz projeyi takibe alın ya da takipten çıkın
- **E-posta bildirimleri** — Takip ettiğiniz projede yeni görev eklendiğinde veya bir görev tamamlandığında e-posta bildirimi alın
- **Sistem ayarları** — Yönetici, SMTP bilgilerini arayüzden girer; bağlantıyı test etmek için test gönderme butonu mevcuttur
- **Karanlık mod** — Tek tıkla aydınlık/karanlık geçişi; tercih tarayıcıda saklanır
- **İlerleme çubuğu** — Her proje kartında tamamlanma yüzdesi görsel olarak gösterilir
- **Docker desteği** — Tek komutla tüm uygulama ayağa kalkar

### 🔐 Varsayılan Yönetici Bilgileri

```
Kullanıcı Adı : TaskyBoi
Şifre         : admin123
```

> ⚠️ İlk girişten sonra şifrenizi hemen değiştirin: **👤 Profil → 🔑 Şifre**

### 🛠 Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Arayüz | React 18, Vite |
| Zengin Metin Editörü | TipTap |
| Gerçek Zamanlı İletişim | Socket.io |
| Sunucu | Node.js, Express |
| Kimlik Doğrulama | JWT, bcryptjs |
| İki Faktörlü Doğrulama | speakeasy (TOTP), qrcode |
| E-posta | Nodemailer |
| Veritabanı | MySQL 8 |
| Altyapı | Docker, Docker Compose |

### 🚀 Kurulum

**Gereksinim:** Docker ve Docker Compose kurulu olmalıdır.

```bash
# 1. Repoyu klonla
git clone https://github.com/sonerce/taskyboi.git
cd taskyboi

# 2. İsteğe bağlı: veritabanı şifresi ve JWT anahtarı belirle
cp .env.example .env
nano .env

# 3. Uygulamayı başlat
docker compose up -d

# 4. Tarayıcıda aç
http://localhost:4000

# Giriş bilgileri: TaskyBoi / admin123
```

### 🌍 Ekiple Paylaşım

**Aynı ağdaysanız (ofis veya ev Wi-Fi)**
```
http://YEREL_IP_ADRESINIZ:4000
```

**Farklı konumdaki kişilerle (ngrok)**
```bash
ngrok http 4000
# Oluşan https://xxx.ngrok-free.app adresini paylaşın
```

**Sunucuya kurulum (VPS)**
Projeyi Docker kurulu herhangi bir Linux sunucusuna yükleyin, `docker compose up -d` komutunu çalıştırın ve alan adınızı 4000 portuna yönlendirin.

### 📧 E-posta Bildirimi Kurulumu

1. Yönetici olarak giriş yapın → **⚙️ Ayarlar** → SMTP bilgilerini doldurun → **Test Et** ile doğrulayın
2. Her kullanıcı kendi profilinden **👤 Profil → 📧 E-posta** sekmesine giderek adresini kaydeder
3. Bildirim almak istediği projenin detay sayfasında **🔔 Takip et** butonuna basar

> Gmail kullanıyorsanız normal şifre yerine **Uygulama Şifresi (App Password)** oluşturmanız gerekir.
> Google Hesabı → Güvenlik → 2 Adımlı Doğrulama → Uygulama şifreleri

### 📁 Proje Yapısı

```
taskyboi/
├── backend/
│   ├── server.js          # Express + Socket.io API, kimlik doğrulama, 2FA, e-posta
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── App.jsx            # Ana uygulama ve sayfa yönlendirme
│   ├── Login.jsx          # Giriş ekranı (2FA adımı dahil)
│   ├── ProfileModal.jsx   # Şifre, e-posta ve 2FA ayarları
│   ├── AdminPanel.jsx     # Kullanıcı yönetimi (sadece yönetici)
│   ├── SettingsPanel.jsx  # SMTP sistem ayarları (sadece yönetici)
│   ├── TaskModal.jsx      # Zengin metin görev detay modalı
│   ├── ProjectModal.jsx   # Proje oluşturma/düzenleme modalı
│   ├── api.js             # JWT destekli istek yardımcısı
│   └── index.css          # Genel stiller ve karanlık mod değişkenleri
├── dump.sql               # Veritabanı şeması ve örnek veriler
├── docker-compose.yml
└── .env.example
```

---

## Lisans

MIT
