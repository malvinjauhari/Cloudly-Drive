<div align="center">

# ☁️ Cloudly Drive

**Virtual Multi-Drive Storage Manager — Google Apps Script Powered**

A self-hosted cloud storage manager that aggregates multiple Google Drive accounts into a single dashboard. Upload, manage, preview, and download files across multiple drives with ease.

[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa%20Indonesia-Read%20Me-blue?style=for-the-badge)](README_ID.md)
![English](https://img.shields.io/badge/English-README-green?style=for-the-badge)

---

</div>

## ✨ Features

- 🔐 **Multi-User Auth** — Login system with role-based access (Admin / User)
- 📂 **Multi-Drive Support** — Manage multiple Google Drive / Shared Drives from one dashboard
- 🚀 **Bulk Upload** — Upload up to 10 files simultaneously with progress tracking
- 📦 **Bulk Download (ZIP)** — Select multiple files and download as a single ZIP
- 🗑️ **Bulk Delete** — Delete multiple files at once with confirmation snackbar
- 🖼️ **File Preview** — Preview files directly in the browser (images, videos, PDFs)
- 📊 **Quota Tracker** — Monitor storage usage across all connected drives
- 🏷️ **Categories** — Organize files into custom categories/folders
- 📱 **Mobile Responsive** — Full mobile support with sidebar navigation
- 🎯 **Drag & Drop** — Drop files anywhere to upload
- ⚙️ **Settings Panel** — Manage users, workers, upload limits, and categories
- 📋 **Activity Logs** — Track all user actions and system events
- 🔄 **Sync Workers** — Ping all workers to refresh quota data in real-time

## 🏗️ Architecture

```
Cloudly Drive/
├── assets/
│   └── Cloudly Drive Config.xlsx    # Spreadsheet template
├── master/                           # Master App (Dashboard)
│   ├── app.gs                        # Router + CONFIG
│   ├── auth.gs                       # Login verification
│   ├── dashboard.gs                  # App data aggregation
│   ├── files.gs                      # Upload, delete, bulk ops
│   ├── settings.gs                   # Settings & categories
│   ├── users.gs                      # User CRUD
│   ├── workers.gs                    # Worker CRUD + sync
│   ├── activity.gs                   # Activity logs
│   ├── utils.gs                      # Helpers (logToDatabase, byteToHex, telegram)
│   ├── index.html                    # Main HTML template
│   ├── css.html                      # Styles
│   ├── js-api.html                   # State & API calls
│   ├── js-app.html                   # Auth & navigation
│   ├── js-ui.html                    # Render functions
│   ├── js-upload.html                # Upload logic
│   ├── js-bulk.html                  # Bulk operations
│   ├── js-modals.html                # Modals & CRUD UI
│   └── js-utils.html                 # Utility functions
├── worker/
│   └── worker-code.gs               # Worker App (File Handler)
├── panduan.html                      # Setup Guide (Indonesian)
└── README.md                         # This file
```

## 🔑 How It Works

### System Flow

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                  (Cloudly Drive UI)                      │
└──────────────────────┬──────────────────────────────────┘
                       │ google.script.run
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    MASTER APP                           │
│              (Google Apps Script)                        │
│                                                         │
│  1. Login → verify user from USERS sheet                │
│  2. Dashboard → read DRIVES, FILES, SETTINGS sheets     │
│  3. Upload → generate signature → send to Worker        │
│  4. Delete → generate signature → send to Worker        │
└──────────────────────┬──────────────────────────────────┘
                       │ UrlFetchApp (HTTP POST with signature)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    WORKER APP                           │
│              (Google Apps Script)                        │
│                                                         │
│  1. Receive request from Master                         │
│  2. Verify signature (SHA-256 HMAC)                     │
│  3. Upload/Delete file on Google Drive                  │
│  4. Return result to Master                             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  GOOGLE DRIVE                           │
│              (Actual file storage)                       │
└─────────────────────────────────────────────────────────┘
```

### Signature System (Security)

All requests between Master and Worker are signed to prevent unauthorized access:

```
Signature = SHA256( timestamp + action + SECRET_KEY )
```

| Field | Description |
|-------|-------------|
| `timestamp` | Unix epoch in milliseconds (e.g. `1723123456789`) |
| `action` | Either `upload` or `delete` |
| `SECRET_KEY` | Shared secret, must match between Master and Worker |

**Request expiry:** 30 minutes. After that, the Worker rejects the request to prevent replay attacks.

**Example:**
```javascript
// Master generates:
const timestamp = new Date().getTime();           // 1723123456789
const action = 'upload';
const rawString = '1723123456789uploadMySecretKey';
const signature = SHA256(rawString);               // e.g. "a1b2c3d4..."

// Worker verifies:
const expected = SHA256(timestamp + action + CONFIG.SECRET_KEY);
// If expected === received → OK
// If mismatch or expired → "Unauthorized: Invalid Signature or Request Expired"
```

### Spreadsheet Structure

| Sheet | Purpose | Key Columns |
|-------|---------|-------------|
| **USERS** | Login accounts | `Username`, `Password`, `Name`, `Email`, `Role` |
| **DRIVES** | Worker registry | `Worker ID`, `Name`, `Email`, `Web App URL`, `Status`, `Quota`, `Used`, `Free` |
| **FILES** | File metadata | `File ID`, `File Name`, `Worker ID`, `Google File ID`, `Size`, `Mime Type`, `Uploaded Via`, `Date`, `Status`, `Category` |
| **SETTINGS** | App config | `Key`, `Value` (e.g. `MAX_FILE_SIZE_MB`, `CATEGORIES`) |
| **UPLOADS** | Upload history | `ID`, `File Name`, `Size`, `Mode`, `Worker ID`, `Status`, `Date`, `Error` |
| **ACTIVITY_LOG** | Audit trail | `Date`, `User`, `Action`, `Target`, `Worker ID`, `Status`, `Details` |

## 🚀 Quick Start

### Prerequisites

- 1 Google Account for **Master** (dashboard manager)
- 1+ Google Accounts for **Workers** (file storage)
- Access to [Google Apps Script](https://script.google.com)

### Step 1: Set Up Worker (Do This First!)

1. Open [script.google.com](https://script.google.com) with your **Worker** account
2. Create a **New Project**
3. Replace the default code with the contents of `worker/worker-code.gs`
4. Add **Drive API** service: Click **Services (+)** → **Drive API** → **Add**
5. Edit CONFIG section in `worker-code.gs`:

```javascript
const CONFIG = {
  SECRET_KEY: 'YOUR_SECRET_KEY',        // e.g. 'MySecret123!'
  TARGET_FOLDER_ID: ''                  // Empty = Root Drive, or paste Folder ID
};
```

6. Deploy → **New Deployment** → **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the **Web App URL**

### Step 2: Create Spreadsheet

1. Open `assets/Cloudly Drive Config.xlsx`
2. Make a copy to your Google Drive
3. Edit these sheets:
   - **USERS** — Add your admin/user accounts
   - **DRIVES** — Add Worker info (paste Web App URL from Step 1)
   - **SETTINGS** — Configure upload limits and categories
4. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

### Step 3: Set Up Master

1. Open [script.google.com](https://script.google.com) with your **Master** account
2. Create a **New Project** named "Cloudly Drive"
3. Open `app.gs` and edit the CONFIG section:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',  // From Step 2
  SECRET_KEY: 'YOUR_SECRET_KEY'            // MUST match Worker
};
```

4. Create all files from the `master/` folder (same filenames)
5. Deploy → **New Deployment** → **Web App**
6. Open the Web App URL and login!

## ⚙️ Configuration

### Master CONFIG (`app.gs`)

| Key | Description | Example |
|-----|-------------|---------|
| `SPREADSHEET_ID` | Google Spreadsheet ID | `'1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX'` |
| `SECRET_KEY` | Shared secret with Worker | `'MySecret123!'` |

### Worker CONFIG (`worker-code.gs`)

| Key | Description | Example |
|-----|-------------|---------|
| `SECRET_KEY` | Shared secret with Master | `'MySecret123!'` |
| `TARGET_FOLDER_ID` | Google Drive folder ID (empty = root) | `'1XyZ2AbC3DeF4GhI5JkL6MnO'` |

### Spreadsheet SETTINGS

| Key | Description | Default |
|-----|-------------|---------|
| `MAX_FILES_PER_UPLOAD` | Max files per upload batch | `10` |
| `MAX_FILE_SIZE_MB` | Max file size in MB | `50` |
| `CATEGORIES` | Comma-separated category list | `Documents,Videos,Images,Backup` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (optional) | — |
| `TELEGRAM_ADMIN_ID` | Telegram admin chat ID (optional) | — |

## 🔧 Troubleshooting

### "Unauthorized: Invalid Signature or Request Expired"

**Cause:** SECRET_KEY mismatch between Master and Worker.

**Fix:**
1. Open Worker `worker-code.gs` → copy the `SECRET_KEY` value
2. Open Master `app.gs` → paste the same value into `SECRET_KEY`
3. Redeploy both apps

### File list is empty after upload

**Cause:** FILES sheet might not exist or have wrong structure.

**Fix:** The app auto-creates the FILES sheet on first load. If it still doesn't work:
1. Open your Spreadsheet
2. Check if sheet "FILES" exists
3. If not, create it manually with headers: `FILE_ID`, `FILE_NAME`, `WORKER_ID`, `GOOGLE_FILE_ID`, `SIZE_BYTES`, `MIME_TYPE`, `UPLOADED_VIA`, `UPLOADED_AT`, `STATUS`, `CATEGORY`

### Worker quota not updating

**Cause:** Worker Drive API not enabled or Worker is offline.

**Fix:**
1. Open Worker project in Apps Script
2. Click **Services (+)** → **Drive API** → **Add**
3. Click **Sync Workers** button in Master dashboard

### Dashboard shows "Error loading data"

**Cause:** SPREADSHEET_ID is wrong or spreadsheet doesn't have required sheets.

**Fix:**
1. Verify SPREADSHEET_ID in `app.gs` matches your spreadsheet URL
2. Ensure spreadsheet has sheets: `USERS`, `DRIVES`, `FILES`, `SETTINGS`, `UPLOADS`, `ACTIVITY_LOG`

### Upload fails with "Tidak ada Worker yang tersedia"

**Cause:** No workers with status "ONLINE" in DRIVES sheet.

**Fix:**
1. Open Spreadsheet → DRIVES sheet
2. Ensure Worker row has `Status` = `ONLINE`
3. Ensure Worker `Web App URL` is correct

## 🛠️ Tech Stack

- **Backend:** Google Apps Script (V8 Runtime)
- **Frontend:** Tailwind CSS, Vanilla JS, JSZip
- **Storage:** Google Drive API + Google Spreadsheet
- **Deployment:** Google Apps Script Web Apps
- **Security:** SHA-256 HMAC request signing

## 📖 Setup Guide

For a detailed step-by-step guide with screenshots, open **`panduan.html`** in your browser.

## 📝 License

MIT License — Free to use and modify.

---

<div align="center">

**Made with ☁️ by [Alvin Jauhari](https://github.com/malvinjauhari)**

</div>
