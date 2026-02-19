# Firebase Analytics (Web)

Dokumen ini menjelaskan cara mengaktifkan Firebase Analytics untuk aplikasi ini.

## 1) Buat / Pilih Firebase Project

Di Firebase Console:

- Buat project (atau pilih existing)
- Aktifkan Google Analytics untuk project tersebut (jika diminta)

## 2) Tambahkan Web App

- Project Settings → Your apps → Add app → Web
- Salin konfigurasi Firebase (apiKey, authDomain, projectId, appId, measurementId)

## 3) Set Environment Variables

Karena ini aplikasi statis Vite, env dibaca saat build dan di-embed ke `dist/`.

Buat file `.env.production` di mesin build (atau `.env.local` untuk lokal) berisi:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

VITE_FIREBASE_STORAGE_BUCKET=...          # opsional
VITE_FIREBASE_MESSAGING_SENDER_ID=...     # opsional
```

Lalu build:

```bash
npm ci
npm run build
```

## 4) Event yang Dikirim

Event dikirim via Firebase Analytics (`logEvent`).

### Traffic

- `page_view` — otomatis terkirim saat route berubah (SPA).

### Error (Front-End)

- `js_error` — error JavaScript yang tidak tertangani
  - params (ringkas, dipotong): `message`, `file`, `line`, `col`, `stack`
- `unhandled_rejection` — promise rejection yang tidak tertangani
  - params (ringkas, dipotong): `message`, `stack`

### Upload CSV

- `csv_upload_click` — user klik area upload untuk membuka file picker
- `csv_upload_drop` — user drag & drop file
- `csv_file_selected` — file berhasil dipilih
  - params: `method` (`click` | `drop`), `file_size`

### Generate

- `generate_click` — tombol generate diklik
- `generate_error` — gagal generate
  - params: `reason` (`no_csv` | `empty_template` | `missing_columns`), `missing_count` (opsional)
- `generate_result` — hasil generate
  - params: `row_count`

### Aksi Per Row

- `send_message_click` — klik “Kirim Pesan”
  - params: `already_clicked`
- `copy_message` — copy pesan
  - params: `text_len`
- `copy_link` — copy link

### Template

- `save_template`
  - params: `outcome` (`empty` | `duplicate` | `saved`), `text_len`
- `delete_template_prompt` — klik tombol × (muncul modal konfirmasi)
- `delete_template` — konfirmasi hapus template

## 5) Catatan

- Analytics di project ini hanya via Firebase. Jika variabel Firebase belum lengkap, tracking akan non-aktif.
- Metrik “berapa kali akses dari IP yang sama” tetap lebih tepat dihitung dari Nginx access log (bukan Firebase).
