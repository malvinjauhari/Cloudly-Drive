function getAppData() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const settingsData = ss.getSheetByName("SETTINGS").getDataRange().getValues();
  let categories = ["Memories", "Work", "Documents", "Videos"];
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === "CATEGORIES" && settingsData[i][1]) {
      categories = settingsData[i][1].toString().split(',').map(c => c.trim()).filter(c => c !== "");
    }
  }

  const drivesData = ss.getSheetByName("DRIVES").getDataRange().getValues();
  let totalQuota = 0, totalUsed = 0, totalFree = 0;
  let workers = [];
  for (let i = 1; i < drivesData.length; i++) {
    const row = drivesData[i];
    if (row[0] !== "") {
      totalQuota += Number(row[5] || 0);
      totalUsed += Number(row[6] || 0);
      totalFree += Number(row[7] || 0);
      workers.push({
        id: row[0], name: row[1], email: row[2], status: row[4], url: row[3],
        quota_bytes: Number(row[5] || 0), used_bytes: Number(row[6] || 0), free_bytes: Number(row[7] || 0)
      });
    }
  }

  let filesSheet = ss.getSheetByName("FILES");
  if (!filesSheet) {
    filesSheet = ss.insertSheet("FILES");
    filesSheet.appendRow(["FILE_ID","FILE_NAME","WORKER_ID","GOOGLE_FILE_ID","SIZE_BYTES","MIME_TYPE","UPLOADED_VIA","UPLOADED_AT","STATUS","CATEGORY"]);
  }
  const filesData = filesSheet.getDataRange().getValues();
  let files = [];
  for (let i = 1; i < filesData.length; i++) {
    const row = filesData[i];
    if (row[0] !== "" && row[8] === "ACTIVE") {
      let safeDate = row[7] ? ((row[7] instanceof Date) ? row[7].toISOString() : String(row[7])) : "";
      files.push({
        file_id: row[0], file_name: row[1], worker_id: row[2], google_file_id: row[3],
        size_bytes: Number(row[4] || 0), mime_type: row[5], uploaded_at: safeDate, category: row[9] || "Uncategorized"
      });
    }
  }

  return { totalQuota, totalUsed, totalFree, workers, categories, files: files.reverse() };
}
