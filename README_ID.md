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
- 🔄 **Sync Workers** — Ping semua worker untuk refresh data kuota secara real-time

## 🚀 Setup Cepat (Copy & Paste)

Untuk setup tercepat, download file yang sudah siap pakai dari Google Drive:

**[📁 Download File Setup](https://drive.google.com/drive/u/0/folders/1TyaZTNGFIV0NlMmXzEjRK0pMg2l7HLap)**

### Setup Master

1. Buka link di atas → download **`Cloudly master.txt`**
2. Buka [script.google.com](https://script.google.com) dengan akun Master kamu
3. Buat Proyek Baru → buka `Code.gs`
4. **Select all** (Ctrl+A) → **Hapus** → **Paste** isi `Cloudly master.txt`
5. Edit bagian CONFIG di atas:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'ID_SPREADSHEET_KAMU',
  SECRET_KEY: 'SECRET_KEY_KAMU'
};
```

6. Rename file ke `app.gs`
7. Buat file lainnya (`auth.gs`, `dashboard.gs`, dll) dari folder `master/`
8. Deploy → Deployment baru → Web App

### Setup Worker

1. Buka link di atas → download **`Cloudly worker.txt`**
2. Buka [script.google.com](https://script.google.com) dengan akun Worker kamu
3. Buat Proyek Baru → buka `Code.gs`
4. **Select all** (Ctrl+A) → **Hapus** → **Paste** isi `Cloudly worker.txt`
5. Edit bagian CONFIG di atas:

```javascript
const CONFIG = {
  SECRET_KEY: 'SECRET_KEY_KAMU',        // HARUS SAMA DENGAN MASTER
  TARGET_FOLDER_ID: ''                  // Kosong = Root Drive
};
```

6. Tambah **Drive API**: Services (+) → Drive API → Add
7. Deploy → Deployment baru → Web App → salin URL-nya

### Setup Spreadsheet

1. Buka link di atas → download **`Cloudly Drive Config.xlsx`** (atau pakai file dari `assets/`)
2. Buat salinan ke Google Drive kamu
3. Edit sheet USERS, DRIVES, dan SETTINGS
4. Copy Spreadsheet ID dari URL dan paste ke CONFIG Master

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
│   ├── workers.gs                    # CRUD Worker + sync
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

## 🔑 Cara Kerja

### Alur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER USER                         │
│                 (Cloudly Drive UI)                       │
└──────────────────────┬──────────────────────────────────┘
                       │ google.script.run
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    MASTER APP                           │
│              (Google Apps Script)                        │
│                                                         │
│  1. Login → verifikasi user dari sheet USERS            │
│  2. Dashboard → baca sheet DRIVES, FILES, SETTINGS      │
│  3. Upload → generate signature → kirim ke Worker       │
│  4. Delete → generate signature → kirim ke Worker       │
└──────────────────────┬──────────────────────────────────┘
                       │ UrlFetchApp (HTTP POST + signature)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    WORKER APP                           │
│              (Google Apps Script)                        │
│                                                         │
│  1. Terima request dari Master                          │
│  2. Verifikasi signature (SHA-256 HMAC)                 │
│  3. Upload/Hapus file di Google Drive                   │
│  4. Kembalikan hasil ke Master                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  GOOGLE DRIVE                           │
│              (Storage file aktual)                       │
└─────────────────────────────────────────────────────────┘
```

### Sistem Signature (Keamanan)

Semua request antara Master dan Worker di-sign untuk mencegah akses tidak sah:

```
Signature = SHA256( timestamp + action + SECRET_KEY )
```

| Field | Deskripsi |
|-------|-----------|
| `timestamp` | Unix epoch dalam milidetik (contoh: `1723123456789`) |
| `action` | `upload` atau `delete` |
| `SECRET_KEY` | Secret bersama, harus sama antara Master dan Worker |

**Request expiry:** 30 menit. Setelah itu, Worker menolak request untuk mencegah replay attack.

**Contoh:**
```javascript
// Master generate:
const timestamp = new Date().getTime();           // 1723123456789
const action = 'upload';
const rawString = '1723123456789uploadRahasiaSaya';
const signature = SHA256(rawString);               // contoh: "a1b2c3d4..."

// Worker verifikasi:
const expected = SHA256(timestamp + action + CONFIG.SECRET_KEY);
// Jika expected === received → OK
// Jika mismatch atau expired → "Unauthorized: Invalid Signature or Request Expired"
```

### Struktur Spreadsheet

| Sheet | Fungsi | Kolom Utama |
|-------|--------|-------------|
| **USERS** | Akun login | `Username`, `Password`, `Nama`, `Email`, `Role` |
| **DRIVES** | Registry Worker | `Worker ID`, `Nama`, `Email`, `Web App URL`, `Status`, `Quota`, `Used`, `Free` |
| **FILES** | Metadata file | `File ID`, `File Name`, `Worker ID`, `Google File ID`, `Size`, `Mime Type`, `Uploaded Via`, `Date`, `Status`, `Category` |
| **SETTINGS** | Konfigurasi app | `Key`, `Value` (contoh: `MAX_FILE_SIZE_MB`, `CATEGORIES`) |
| **UPLOADS** | Riwayat upload | `ID`, `File Name`, `Size`, `Mode`, `Worker ID`, `Status`, `Date`, `Error` |
| **ACTIVITY_LOG** | Audit trail | `Date`, `User`, `Action`, `Target`, `Worker ID`, `Status`, `Details` |

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
5. Edit bagian CONFIG di `worker-code.gs`:

```javascript
const CONFIG = {
  SECRET_KEY: 'SECRET_KEY_KAMU',        // contoh: 'RahasiaSaya123!'
  TARGET_FOLDER_ID: ''                  // Kosong = Root Drive, atau tempel Folder ID
};
```

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
4. Copy **Spreadsheet ID** dari URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

### Langkah 3: Setup Master

1. Buka [script.google.com](https://script.google.com) dengan akun **Master** kamu
2. Buat **Proyek Baru** dengan nama "Cloudly Drive"
3. Buka `app.gs` dan edit bagian CONFIG:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'ID_SPREADSHEET_KAMU',  // Dari Langkah 2
  SECRET_KEY: 'SECRET_KEY_KAMU'            // HARUS SAMA DENGAN WORKER
};
```

4. Buat semua file dari folder `master/` (dengan nama yang sama)
5. Deploy → **Deployment baru** → **Web App**
6. Buka Web App URL dan login!

## ⚙️ Konfigurasi

### Master CONFIG (`app.gs`)

| Key | Deskripsi | Contoh |
|-----|-----------|--------|
| `SPREADSHEET_ID` | ID Google Spreadsheet | `'1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX'` |
| `SECRET_KEY` | Secret bersama dengan Worker | `'RahasiaSaya123!'` |

### Worker CONFIG (`worker-code.gs`)

| Key | Deskripsi | Contoh |
|-----|-----------|--------|
| `SECRET_KEY` | Secret bersama dengan Master | `'RahasiaSaya123!'` |
| `TARGET_FOLDER_ID` | ID folder Google Drive (kosong = root) | `'1XyZ2AbC3DeF4GhI5JkL6MnO'` |

### SETTINGS di Spreadsheet

| Key | Deskripsi | Default |
|-----|-----------|---------|
| `MAX_FILES_PER_UPLOAD` | Maks file per batch upload | `10` |
| `MAX_FILE_SIZE_MB` | Maks ukuran file dalam MB | `50` |
| `CATEGORIES` | Daftar kategori (koma) | `Documents,Videos,Images,Backup` |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram (opsional) | — |
| `TELEGRAM_ADMIN_ID` | Chat ID admin Telegram (opsional) | — |

## 🔧 Troubleshooting

### "Unauthorized: Invalid Signature or Request Expired"

**Penyebab:** SECRET_KEY tidak cocok antara Master dan Worker.

**Solusi:**
1. Buka `worker-code.gs` → salin nilai `SECRET_KEY`
2. Buka `app.gs` → tempel nilai yang sama ke `SECRET_KEY`
3. Deploy ulang kedua app

### Daftar file kosong setelah upload

**Penyebab:** Sheet FILES mungkin belum ada atau strukturnya salah.

**Solusi:** App otomatis membuat sheet FILES saat pertama load. Jika masih tidak bisa:
1. Buka Spreadsheet kamu
2. Cek apakah sheet "FILES" ada
3. Jika tidak, buat manual dengan header: `FILE_ID`, `FILE_NAME`, `WORKER_ID`, `GOOGLE_FILE_ID`, `SIZE_BYTES`, `MIME_TYPE`, `UPLOADED_VIA`, `UPLOADED_AT`, `STATUS`, `CATEGORY`

### Kuota worker tidak update

**Penyebab:** Drive API Worker belum diaktifkan atau Worker offline.

**Solusi:**
1. Buka project Worker di Apps Script
2. Klik **Services (+)** → **Drive API** → **Add**
3. Klik tombol **Sync Workers** di dashboard Master

### Dashboard menampilkan "Error loading data"

**Penyebab:** SPREADSHEET_ID salah atau spreadsheet belum punya sheet yang diperlukan.

**Solusi:**
1. Pastikan SPREADSHEET_ID di `app.gs` sesuai dengan URL spreadsheet
2. Pastikan spreadsheet punya sheet: `USERS`, `DRIVES`, `FILES`, `SETTINGS`, `UPLOADS`, `ACTIVITY_LOG`

### Upload gagal "Tidak ada Worker yang tersedia"

**Penyebab:** Tidak ada worker dengan status "ONLINE" di sheet DRIVES.

**Solusi:**
1. Buka Spreadsheet → sheet DRIVES
2. Pastikan baris Worker punya `Status` = `ONLINE`
3. Pastikan `Web App URL` Worker benar

## 🛠️ Tech Stack

- **Backend:** Google Apps Script (V8 Runtime)
- **Frontend:** Tailwind CSS, Vanilla JS, JSZip
- **Storage:** Google Drive API + Google Spreadsheet
- **Deployment:** Google Apps Script Web Apps
- **Keamanan:** SHA-256 HMAC request signing

## 📖 Panduan Setup

Untuk panduan langkah demi langkah yang lebih detail, buka **`panduan.html`** di browser kamu.

## 📝 License

MIT License — Gratis untuk digunakan dan dimodifikasi.

---

<div align="center">

**Dibuat dengan ☁️ oleh [Alvin Jauhari](https://github.com/malvinjauhari)**

</div>
