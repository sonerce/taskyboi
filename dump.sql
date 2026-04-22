CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contacts TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  description LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

INSERT INTO projects (name, contacts, notes) VALUES
  ('Website Yenileme', 'Ahmet, Ayşe', 'Q3 hedefi, tasarım onayı bekleniyor'),
  ('Mobil Uygulama', 'Mehmet', 'iOS öncelikli, Android ikinci fazda'),
  ('Pazarlama Kampanyası', 'Fatma, Ali', 'Bütçe onayı alındı');

INSERT INTO tasks (project_id, text, done) VALUES
  (1, 'Ana sayfa tasarımı güncelle', FALSE),
  (1, 'Mobil uyumluluk testleri', FALSE),
  (1, 'SEO optimizasyonu', TRUE),
  (2, 'Kullanıcı girişi ekranı', FALSE),
  (2, 'API entegrasyonu', FALSE),
  (2, 'Push bildirim altyapısı', TRUE),
  (3, 'Sosyal medya görselleri hazırla', FALSE),
  (3, 'E-posta şablonu oluştur', FALSE),
  (3, 'Hedef kitle analizi', TRUE);
