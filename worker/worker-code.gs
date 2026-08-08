/**
 * =========================================================
 * VIRTUAL MULTI-DRIVE STORAGE MANAGER - WORKER APP
 * =========================================================
 * File ini bertugas sebagai Agent yang menerima perintah 
 * dari Master untuk membaca kuota, upload, dan delete file.
 */

const CONFIG = {  
  // SECRET_KEY harus SAMA PERSIS dengan yang akan dipasang di Master nanti.
  // Jangan berikan key ini kepada siapapun.
  SECRET_KEY: "R4hasiaWorkerSatu2026!", 
  
  // Kosongkan jika ingin file masuk ke Root Drive akun ini.
  // Jika ingin dirapikan, buat folder di Drive, lalu paste ID-nya di sini.
  TARGET_FOLDER_ID: "14DTteMDZ6v37tegRD5ArtV_yTXAMtrvn" 
};

/**
 * Endpoint GET: Digunakan Master untuk mengecek Status & Kuota Worker
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'info') {
      return jsonResponse(getInfo());
    }
    return jsonResponse({ error: "Invalid GET action" }, 400);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Endpoint POST: Digunakan Master untuk Upload & Delete File
 */
function doPost(e) {
  try {
    // 1. Parsing Request Payload
    if (!e.postData || !e.postData.contents) {
      throw new Error("Empty payload");
    }
    const payload = JSON.parse(e.postData.contents);

    // 2. Verifikasi Keamanan (Cegah pihak luar upload ke Drive Anda)
    if (!verifySignature(payload)) {
      return jsonResponse({ error: "Unauthorized: Invalid Signature or Request Expired" }, 401);
    }

    // 3. Routing Action
    const action = payload.action;
    if (action === 'upload') {
      return jsonResponse(handleUpload(payload));
    } else if (action === 'delete') {
      return jsonResponse(handleDelete(payload));
    }

    return jsonResponse({ error: "Invalid POST action" }, 400);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Membaca sisa penyimpanan (Quota) menggunakan Drive API
 */
function getInfo() {
  try {
    // Membutuhkan Advanced Service: Drive API (v2 atau v3)
    const about = Drive.About.get({fields: 'storageQuota, user'});
    const quota = about.storageQuota;
    const user = about.user;

    const limitBytes = parseInt(quota.limit || 16106127360); // Default 15GB jika unlimited
    const usedBytes = parseInt(quota.usage || 0);
    const freeBytes = limitBytes - usedBytes;

    return {
      status: "success",
      email: user.emailAddress,
      quota_bytes: limitBytes,
      used_bytes: usedBytes,
      free_bytes: freeBytes
    };
  } catch (e) {
    throw new Error("Gagal membaca kuota. Pastikan layanan Drive API (Advanced Services) sudah diaktifkan di Apps Script. Error: " + e.message);
  }
}

/**
 * Memproses file masuk (Base64 -> Blob -> Drive)
 */
function handleUpload(payload) {
  const fileName = payload.fileName;
  const mimeType = payload.mimeType;
  const base64Data = payload.base64Data;

  if (!fileName || !base64Data) {
    throw new Error("Missing fileName or base64Data");
  }

  // Konversi Base64 kembali menjadi bentuk file biner (Blob)
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType || "application/octet-stream", fileName);

  // Tentukan lokasi penyimpanan
  let folder = DriveApp.getRootFolder();
  if (CONFIG.TARGET_FOLDER_ID !== "") {
    folder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
  }

  // Simpan ke Google Drive
  const file = folder.createFile(blob);

  return {
    status: "success",
    file_id: file.getId(),
    file_name: file.getName(),
    size_bytes: file.getSize(),
    mime_type: file.getMimeType(),
    url: file.getUrl()
  };
}

/**
 * Menghapus file (memindahkan ke Trash)
 */
function handleDelete(payload) {
  const fileId = payload.fileId;
  if (!fileId) throw new Error("Missing fileId");

  const file = DriveApp.getFileById(fileId);
  file.setTrashed(true); // Pindah ke sampah, bukan dihapus permanen agar aman
  
  return {
    status: "success",
    message: "File moved to trash",
    file_id: fileId
  };
}

// ==========================================
// SECURITY & UTILITIES
// ==========================================

/**
 * Verifikasi kecocokan signature untuk memastikan request dari Master
 */
function verifySignature(payload) {
  const receivedSignature = payload.signature;
  const timestamp = payload.timestamp; // Format Epoch MS
  const action = payload.action;

  if (!receivedSignature || !timestamp || !action) return false;

  // Cek masa berlaku request (Cegah serangan Replay)
  // Request ditolak jika usianya lebih dari 5 menit
  const now = new Date().getTime();
  if (now - timestamp > 5 * 60 * 1000) {
    return false; 
  }

  // Generate SHA-256 Hash ulang: timestamp + action + secret
  const rawString = timestamp.toString() + action + CONFIG.SECRET_KEY;
  const expectedSignature = byteToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawString));

  return receivedSignature === expectedSignature;
}

/**
 * Konversi hasil hashing ke format Hexadecimal String
 */
function byteToHex(bytes) {
  return bytes.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Format response JSON untuk dikirim ke Master
 */
function jsonResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
    
  // Catatan: Apps Script tidak bisa ubah HTTP Status Code secara native untuk Web App (selalu 200 OK), 
  // Tapi kita sisipkan custom parameter jika dibutuhkan untuk error tracking
  if (statusCode !== 200) {
    data.statusCode = statusCode; 
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  return response;
}