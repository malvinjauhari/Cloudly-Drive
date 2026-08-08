<div align="center">

# ☁️ Cloudly Drive

**Virtual Multi-Drive Storage Manager — Berbasis Google Apps Script**

Cloud storage manager self-hosted yang mengagregasi beberapa akun Google Drive menjadi satu dashboard. Upload, kelola, preview, dan download file dari berbagai drive dengan mudah.

[![English](https://img.shields.io/badge/English-Read%20Me-blue?style=for-the-badge)](README.md)
![Bahasa Indonesia](https://img.shields.io/badge/Bahasa%20Indonesia-README-green?style=for-the-badge)

---

</div>

## ✨ Fitur

- 🔐 **Multi-User Auth** — Sistem login dengan akses berbasis role (Admin / User)
- 📂 **Multi-Drive** — Kelola beberapa akun Google Drive / Shared Drive dari satu dashboard
- 🚀 **Bulk Upload** — Upload hingga 10 file sekaligus dengan progress tracking
- 📦 **Bulk Download (ZIP)** — Pilih beberapa file dan download sebagai satu file ZIP
- 🗑️ **Bulk Delete** — Hapus beberapa file sekaligus dengan konfirmasi snackbar
- 🖼️ **File Preview** — Preview file langsung di browser (gambar, video, PDF)
- 📊 **Quota Tracker** — Pantau penggunaan storage di semua drive yang terhubung
- 🏷️ **Kategori** — Organisir file ke dalam kategori/folder custom
- 📱 **Mobile Responsive** — Dukungan penuh mobile dengan sidebar navigation
- 🎯 **Drag & Drop** — Drop file di mana saja untuk upload
- ⚙️ **Panel Settings** — Kelola user, worker, batas upload, dan kategori
- 📋 **Activity Log** — Lacak semua aktivitas user dan event sistem

## 🏗️ Arsitektur

```
Cloudly Drive/
├── assets/
│   └── Cloudly Drive Config.xlsx    # Template spreadsheet
├── master/                           # Master App (Dashboard)
│   ├── app.gs                        # Router + CONFIG
│   ├── auth.gs                       # Verifikasi login
│   ├── dashboard.gs                  # Agregasi data aplikasi
│   ├── files.gs                      # Upload, delete, bulk ops
│   ├── settings.gs                   # Settings & kategori
│   ├── users.gs                      # CRUD User
│   ├── workers.gs                    # CRUD Worker
│   ├── activity.gs                   # Activity logs
│   ├── utils.gs                      # Helper functions
│   ├── index.html                    # Template HTML utama
│   ├── css.html                      # Styles
│   ├── js-api.html                   # State & API calls
│   ├── js-app.html                   # Auth & navigasi
│   ├── js-ui.html                    # Fungsi render
│   ├── js-upload.html                # Logika upload
│   ├── js-bulk.html                  # Operasi bulk
│   ├── js-modals.html                # Modal & CRUD UI
│   └── js-utils.html                 # Fungsi utilitas
├── worker/
│   └── worker-code.gs               # Worker App (File Handler)
├── panduan.html                      # Panduan Setup (Bahasa Indonesia)
└── README_ID.md                      # File ini
```

## 🚀 Mulai

### Yang Diperlukan

- 1 Akun Google untuk **Master** (pengelola dashboard)
- 1+ Akun Google untuk **Worker** (penyimpanan file)
- Akses ke [Google Apps Script](https://script.google.com)

### Langkah 1: Setup Worker (Lakukan Ini Dulu!)

1. Buka [script.google.com](https://script.google.com) dengan akun **Worker** kamu
2. Buat **Proyek Baru**
3. Ganti kode default dengan isi file `worker/worker-code.gs`
4. Tambahkan layanan **Drive API**: Klik **Services (+)** → **Drive API** → **Add**
5. Edit bagian CONFIG di `worker-code.gs` dengan SECRET_KEY dan TARGET_FOLDER_ID (opsional)
6. Deploy → **Deployment baru** → **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Salin **Web App URL**

### Langkah 2: Buat Spreadsheet

1. Buka `assets/Cloudly Drive Config.xlsx`
2. Buat salinan ke Google Drive kamu
3. Edit sheet berikut:
   - **USERS** — Tambah akun admin/user kamu
   - **DRIVES** — Tambah info Worker (paste Web App URL dari Langkah 1)
   - **SETTINGS** — Konfigurasi batas upload dan kategori

### Langkah 3: Setup Master

1. Buka [script.google.com](https://script.google.com) dengan akun **Master** kamu
2. Buat **Proyek Baru** dengan nama "Cloudly Drive"
3. Buka `app.gs` dan edit bagian CONFIG:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'ID_SPREADSHEET_KAMU',
  SECRET_KEY: 'SECRET_KEY_KAMU'  // HARUS SAMA DENGAN WORKER
};
```

4. Buat semua file dari folder `master/` (dengan nama yang sama)
5. Deploy → **Deployment baru** → **Web App**
6. Buka Web App URL dan login!

## 🔑 Cara Kerja

| Komponen | Peran |
|----------|-------|
| **Master** | UI Dashboard + orkestrator API. Mengelola user, metadata file, dan merutekan request upload/delete ke Worker |
| **Worker** | File handler ringan. Menerima request ter-sign dari Master, upload/hapus file di Google Drive, mengembalikan info kuota |
| **Spreadsheet** | Single source of truth untuk user, drive, settings, dan metadata file |

### Keamanan

- Semua request antara Master dan Worker di-sign dengan **SHA-256 HMAC**
- Signature menyertakan timestamp untuk mencegah replay attack (expiry 5 menit)
- `SECRET_KEY` disimpan di `PropertiesService` (tidak pernah hardcoded)

## 🛠️ Tech Stack

- **Backend:** Google Apps Script (V8 Runtime)
- **Frontend:** Tailwind CSS, Vanilla JS, JSZip
- **Storage:** Google Drive API + Google Spreadsheet
- **Deployment:** Google Apps Script Web Apps

## 📖 Panduan Setup

Untuk panduan langkah demi langkah yang lebih detail, buka **`panduan.html`** di browser kamu.

## 📝 License

MIT License — Gratis untuk digunakan dan dimodifikasi.

---

<div align="center">

**Dibuat dengan ☁️ oleh [Alvin Jauhari](https://github.com/malvinjauhari)**

</div>