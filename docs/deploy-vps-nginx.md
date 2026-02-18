# Deployment (VPS + Nginx) — Static

Dokumen ini menjelaskan cara deploy aplikasi ini ke VPS dengan Nginx sebagai static web server.
Nama domain, IP, dan path dibuat generik (silakan sesuaikan).

## Ringkasan

- Aplikasi ini adalah React + Vite, hasil build berupa file statis di folder `dist/`.
- Deployment paling sederhana: Nginx langsung serve `dist/`.
- Karena menggunakan client-side routing (React Router), Nginx perlu fallback ke `index.html`.

## Prasyarat

- VPS sudah terpasang Nginx.
- Node.js + npm tersedia di VPS (untuk build).
- Domain sudah mengarah ke VPS (opsional kalau akses via IP).

## Struktur Direktori yang Direkomendasikan

Contoh direktori aplikasi:

- `/var/www/whatsapp-blast/` — root project
- `/var/www/whatsapp-blast/dist/` — output build yang diserve Nginx

## 1) Ambil Source Code

```bash
sudo mkdir -p /var/www/whatsapp-blast
sudo chown -R $USER:$USER /var/www/whatsapp-blast

cd /var/www/whatsapp-blast
git clone <REPO_URL> .
```

Jika repo sudah ada:

```bash
cd /var/www/whatsapp-blast
git pull
```

## 2) Install Dependency & Build

```bash
cd /var/www/whatsapp-blast
npm ci
npm run build
```

Pastikan folder `dist/` terbuat:

```bash
ls -la /var/www/whatsapp-blast/dist
```

## 3) Konfigurasi Nginx

Buat file site baru:

```bash
sudo nano /etc/nginx/sites-available/whatsapp-blast
```

Isi contoh konfigurasi (ganti `example.com` sesuai kebutuhan):

```nginx
server {
  listen 80;
  server_name example.com www.example.com;

  root /var/www/whatsapp-blast/dist;
  index index.html;

  # SPA fallback untuk React Router
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache asset statis
  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    try_files $uri =404;
  }
}
```

Aktifkan site:

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-blast /etc/nginx/sites-enabled/whatsapp-blast
```

Validasi & reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 4) HTTPS (Opsional)

Jika kamu memakai Let’s Encrypt:

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

## 5) Prosedur Update / Redeploy

Setiap ada perubahan kode:

```bash
cd /var/www/whatsapp-blast
git pull
npm ci
npm run build
sudo systemctl reload nginx
```

## Troubleshooting

### Refresh halaman route jadi 404

Pastikan konfigurasi Nginx memakai:

```nginx
try_files $uri $uri/ /index.html;
```

### Asset tidak ter-load / 404

- Pastikan `root` menunjuk ke `/var/www/whatsapp-blast/dist`.
- Pastikan build terbaru sudah dijalankan (`npm run build`).

### Perubahan tidak terlihat

- Hard refresh browser (cache).
- Pastikan Nginx sudah reload.
- Pastikan folder `dist/` berisi build terbaru.
