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
│   ├── workers.gs                    # Worker CRUD
│   ├── activity.gs                   # Activity logs
│   ├── utils.gs                      # Helpers
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
5. Edit CONFIG section in `worker-code.gs` with your SECRET_KEY and optional TARGET_FOLDER_ID
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

### Step 3: Set Up Master

1. Open [script.google.com](https://script.google.com) with your **Master** account
2. Create a **New Project** named "Cloudly Drive"
3. Open `app.gs` and edit the CONFIG section:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
  SECRET_KEY: 'YOUR_SECRET_KEY'  // MUST match Worker
};
```

4. Create all files from the `master/` folder (same filenames)
5. Deploy → **New Deployment** → **Web App**
6. Open the Web App URL and login!

## 🔑 How It Works

| Component | Role |
|-----------|------|
| **Master** | Dashboard UI + API orchestrator. Manages users, files metadata, and routes upload/delete requests to Workers |
| **Worker** | Lightweight file handler. Receives signed requests from Master, uploads/deletes files on Google Drive, returns quota info |
| **Spreadsheet** | Single source of truth for users, drives, settings, and file metadata |

### Security

- All requests between Master and Worker are signed with **SHA-256 HMAC**
- Signatures include timestamp to prevent replay attacks (5-minute expiry)
- `SECRET_KEY` is stored in `PropertiesService` (never hardcoded)

## 🛠️ Tech Stack

- **Backend:** Google Apps Script (V8 Runtime)
- **Frontend:** Tailwind CSS, Vanilla JS, JSZip
- **Storage:** Google Drive API + Google Spreadsheet
- **Deployment:** Google Apps Script Web Apps

## 📖 Setup Guide

For a detailed step-by-step guide with screenshots, open **`panduan.html`** in your browser.

## 📝 License

MIT License — Free to use and modify.

---

<div align="center">

**Made with ☁️ by [Alvin Jauhari](https://github.com/malvinjauhari)**

</div>