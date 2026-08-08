function processUploadFromWeb(fileName, mimeType, base64Data, targetMode, specificWorkerId, category) {
  try {
    const worker = selectWorker(targetMode, specificWorkerId);
    if (!worker) throw new Error("Tidak ada Worker yang tersedia.");

    const timestamp = new Date().getTime();
    const action = 'upload';
    const rawString = timestamp.toString() + action + CONFIG.SECRET_KEY;
    const signature = byteToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawString));
    const payload = { action, timestamp, signature, fileName, mimeType, base64Data };
    
    const response = UrlFetchApp.fetch(worker.url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());

    if (result.status === "success") {
      const cat = category || "Uncategorized";
      logToDatabase("FILES", [Utilities.getUuid(), fileName, worker.id, result.file_id, result.size_bytes, mimeType, "Web Dashboard", new Date(), "ACTIVE", cat]);
      logToDatabase("UPLOADS", [Utilities.getUuid(), fileName, result.size_bytes, targetMode, worker.id, "SUCCESS", new Date(), ""]);
      return { status: "success", message: "File berhasil diunggah ke " + worker.name };
    } else {
      throw new Error(result.error || "Unknown Error dari Worker");
    }
  } catch (e) {
    logToDatabase("UPLOADS", [Utilities.getUuid(), fileName, 0, targetMode, specificWorkerId || "AUTO", "FAILED", new Date(), e.message]);
    return { status: "error", message: e.message };
  }
}

function processDeleteFile(fileId, googleFileId, workerId) {
  try {
    const worker = selectWorker("SPECIFIC", workerId);
    if (!worker) throw new Error("Akses Worker tidak ditemukan.");

    const timestamp = new Date().getTime();
    const action = 'delete';
    const rawString = timestamp.toString() + action + CONFIG.SECRET_KEY;
    const signature = byteToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawString));
    
    const payload = { action, timestamp, signature, fileId: googleFileId };
    const response = UrlFetchApp.fetch(worker.url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());

    if (result.status === "success") {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName("FILES");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === fileId) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Delete File", fileId, workerId, "SUCCESS", "File dihapus permanen"]);
      return { status: "success", message: "File berhasil dihapus permanen" };
    } else {
      throw new Error(result.error || "Gagal menghapus dari Drive");
    }
  } catch (e) {
    return { status: "error", message: e.message };
  }
}

function selectWorker(mode, specificId) {
  const drivesData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName("DRIVES").getDataRange().getValues();
  let workers = [];
  for (let i = 1; i < drivesData.length; i++) {
    if (drivesData[i][4] === "ONLINE") workers.push({ id: drivesData[i][0], name: drivesData[i][1], url: drivesData[i][3], freeBytes: Number(drivesData[i][7] || 0) });
  }
  if (workers.length === 0) return null;
  if (mode === "SPECIFIC" && specificId) return workers.find(w => w.id === specificId);
  workers.sort((a, b) => b.freeBytes - a.freeBytes);
  return workers[0];
}

function bulkDeleteFiles(fileIds) {
  let success = 0, failed = 0, errors = [];
  for (const fileId of fileIds) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName("FILES");
      const data = sheet.getDataRange().getValues();
      let googleFileId = null, workerId = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === fileId) {
          googleFileId = data[i][3];
          workerId = data[i][2];
          break;
        }
      }
      if (!googleFileId || !workerId) { failed++; errors.push(fileId + ": not found"); continue; }
      const res = processDeleteFile(fileId, googleFileId, workerId);
      if (res.status === 'success') success++; else { failed++; errors.push(res.message); }
    } catch (e) { failed++; errors.push(e.message); }
  }
  logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Bulk Delete", fileIds.length + " files", "", success > 0 ? "SUCCESS" : "FAILED", success + " deleted, " + failed + " failed"]);
  return { success: success, failed: failed, errors: errors };
}

function bulkGetFileBlobs(fileIds) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("FILES");
  const data = sheet.getDataRange().getValues();
  const blobs = [];
  for (const fileId of fileIds) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === fileId) {
        const googleFileId = data[i][3];
        const fileName = data[i][1];
        try {
          const file = DriveApp.getFileById(googleFileId);
          const blob = file.getBlob();
          blobs.push({ name: fileName, data: Utilities.base64Encode(blob.getBytes()) });
        } catch (e) { /* skip inaccessible files */ }
        break;
      }
    }
  }
  return { status: 'success', blobs: blobs };
}
