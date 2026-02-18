# Google Analytics (GA4)

Dokumen ini menjelaskan cara mengaktifkan Google Analytics (GA4) dan event apa saja yang dikirim dari aplikasi.

## 1) Buat Properti GA4

Di Google Analytics:

- Admin → Create Property (GA4)
- Data Streams → Web
- Ambil **Measurement ID** (format: `G-XXXXXXXXXX`)

## 2) Set Measurement ID saat Build

Aplikasi membaca Measurement ID dari env var Vite:

- `VITE_GA_MEASUREMENT_ID`

Contoh (jalankan saat build di mesin kamu / VPS):

```bash
export VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
npm ci
npm run build
```

Jika deployment kamu memakai CI/CD, set env var tersebut di environment CI.

Catatan:
- Bila `VITE_GA_MEASUREMENT_ID` tidak di-set, analytics otomatis non-aktif.

## 3) Event yang Ditracking

Event dikirim via `gtag('event', ...)`.

### Traffic

- `page_view`
  - otomatis terkirim saat route berubah (SPA).

### Upload CSV

- `csv_upload_click` — user klik area upload untuk membuka file picker
- `csv_upload_drop` — user drag & drop file
- `csv_file_selected`
  - params:
    - `method`: `click` | `drop`
    - `file_size`: number

### Generate

- `generate_click` — tombol generate diklik
- `generate_error`
  - params:
    - `reason`: `no_csv` | `empty_template` | `missing_columns`
    - `missing_count`: number (hanya untuk `missing_columns`)
- `generate_result`
  - params:
    - `row_count`: number (jumlah row yang berhasil di-generate)

### Aksi Per Row

- `send_message_click`
  - params:
    - `already_clicked`: boolean
- `copy_message`
  - params:
    - `text_len`: number
- `copy_link`

### Template

- `save_template`
  - params:
    - `outcome`: `empty` | `duplicate` | `saved`
    - `text_len`: number
- `delete_template_prompt` — user klik tombol × (muncul modal konfirmasi)
- `delete_template` — user konfirmasi hapus template

## 4) Catatan Privasi (Penting)

- Aplikasi **tidak** mengirim nomor HP, isi pesan mentah, atau PII lain sebagai parameter event.
- Untuk kebutuhan analitik, parameter hanya berupa metrik (mis. panjang teks, jumlah row).

## 5) “Berapa kali web diakses dari IP yang sama?”

GA4 tidak menyediakan laporan berbasis IP mentah (dan mengirim/menyimpan IP secara eksplisit sebagai event juga tidak direkomendasikan karena privasi).

Alternatif yang lebih tepat:

- Gunakan **Nginx access log** untuk hitung request per IP.
- Atau pasang layer proxy/CDN (mis. Cloudflare) lalu pakai analytics-nya.

Jika kamu butuh metrik “pengunjung berulang”, GA4 sudah menyediakan metrik seperti returning users berbasis `user_pseudo_id`/cookie (bukan IP).

