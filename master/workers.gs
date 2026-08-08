function getWorkers() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const data = ss.getSheetByName("DRIVES").getDataRange().getValues();
  let workers = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== "") {
      workers.push({
        id: data[i][0].toString(),
        name: data[i][1].toString(),
        email: data[i][2].toString(),
        url: data[i][3].toString(),
        status: data[i][4].toString()
      });
    }
  }
  return workers;
}

function saveWorker(originalId, data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("DRIVES");
  const existing = sheet.getDataRange().getValues();
  
  if (originalId) {
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0].toString().trim() === originalId) {
        sheet.getRange(i + 1, 1).setValue(data.id);
        sheet.getRange(i + 1, 2).setValue(data.name);
        sheet.getRange(i + 1, 3).setValue(data.email);
        sheet.getRange(i + 1, 4).setValue(data.url);
        sheet.getRange(i + 1, 5).setValue(data.status);
        logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Update Worker", data.id, "", "SUCCESS", "Worker diperbarui"]);
        return { status: "success", message: "Worker berhasil diperbarui" };
      }
    }
    return { status: "error", message: "Worker tidak ditemukan" };
  } else {
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0].toString().trim() === data.id) {
        return { status: "error", message: "Worker ID sudah digunakan" };
      }
    }

    let quotaBytes = 0, usedBytes = 0, freeBytes = 0, workerEmail = data.email;
    let syncStatus = data.status;
    let syncError = "";

    try {
      const syncUrl = data.url + "?action=info";
      const response = UrlFetchApp.fetch(syncUrl, { method: 'get', muteHttpExceptions: true, followRedirects: true });
      const info = JSON.parse(response.getContentText());
      if (info.status === "success") {
        quotaBytes = parseInt(info.quota_bytes) || 0;
        usedBytes = parseInt(info.used_bytes) || 0;
        freeBytes = parseInt(info.free_bytes) || 0;
        workerEmail = info.email || data.email;
        syncStatus = "ONLINE";
      } else {
        syncStatus = "ERROR";
        syncError = info.error || "Gagal ambil info dari worker";
      }
    } catch (e) {
      syncStatus = "ERROR";
      syncError = e.message || "Worker tidak dapat diakses";
    }

    sheet.appendRow([data.id, data.name, workerEmail, data.url, syncStatus, quotaBytes, usedBytes, freeBytes]);
    logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Add Worker", data.id, "", syncStatus, syncError || "Worker baru ditambahkan"]);

    if (syncStatus === "ERROR") {
      return { status: "warning", message: "Worker tersimpan tapi gagal sync: " + syncError };
    }
    return { status: "success", message: "Worker berhasil ditambahkan & tersync" };
  }
}

function deleteWorker(id) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("DRIVES");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim() === id) {
      sheet.deleteRow(i + 1);
      logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Delete Worker", id, "", "SUCCESS", "Worker dihapus"]);
      return { status: "success", message: "Worker berhasil dihapus" };
    }
  }
  return { status: "error", message: "Worker tidak ditemukan" };
}

function syncAllWorkers() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("DRIVES");
  const data = sheet.getDataRange().getValues();
  let results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === "" || !row[3]) continue;

    const workerId = row[0].toString();
    const workerUrl = row[3].toString();
    let syncStatus = row[4] ? row[4].toString() : "UNKNOWN";
    let syncError = "";
    let quotaBytes = Number(row[5] || 0);
    let usedBytes = Number(row[6] || 0);
    let freeBytes = Number(row[7] || 0);
    let workerEmail = row[2] ? row[2].toString() : "";

    try {
      const response = UrlFetchApp.fetch(workerUrl + "?action=info", {
        method: 'get',
        muteHttpExceptions: true,
        followRedirects: true
      });
      const info = JSON.parse(response.getContentText());
      if (info.status === "success") {
        quotaBytes = parseInt(info.quota_bytes) || 0;
        usedBytes = parseInt(info.used_bytes) || 0;
        freeBytes = parseInt(info.free_bytes) || 0;
        workerEmail = info.email || workerEmail;
        syncStatus = "ONLINE";
      } else {
        syncStatus = "ERROR";
        syncError = info.error || "Gagal ambil info";
      }
    } catch (e) {
      syncStatus = "ERROR";
      syncError = e.message || "Worker tidak dapat diakses";
    }

    sheet.getRange(i + 1, 5).setValue(syncStatus);
    sheet.getRange(i + 1, 6).setValue(quotaBytes);
    sheet.getRange(i + 1, 7).setValue(usedBytes);
    sheet.getRange(i + 1, 8).setValue(freeBytes);
    if (workerEmail) sheet.getRange(i + 1, 3).setValue(workerEmail);

    results.push({
      id: workerId,
      name: row[1] ? row[1].toString() : workerId,
      status: syncStatus,
      error: syncError,
      quota_bytes: quotaBytes,
      used_bytes: usedBytes,
      free_bytes: freeBytes
    });
  }

  logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Sync All Workers", results.length + " workers", "", "SUCCESS", "Quota updated"]);
  return results;
}
