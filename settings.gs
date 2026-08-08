function getSettings() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("SETTINGS");
  const data = sheet.getDataRange().getValues();
  
  let maxFiles = 10, maxSizeMB = 50;
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0].toString().trim();
    const val = data[i][1];
    if (key === "MAX_FILES_PER_UPLOAD") maxFiles = parseInt(val) || 10;
    if (key === "MAX_FILE_SIZE_MB") maxSizeMB = parseInt(val) || 50;
  }
  
  return { maxFiles, maxSizeMB };
}

function saveSettings(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("SETTINGS");
  const existing = sheet.getDataRange().getValues();
  
  const settingsMap = {
    "MAX_FILES_PER_UPLOAD": data.maxFiles || 10,
    "MAX_FILE_SIZE_MB": data.maxSizeMB || 50
  };
  
  for (const key in settingsMap) {
    let found = false;
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0].toString().trim() === key) {
        sheet.getRange(i + 1, 2).setValue(settingsMap[key]);
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([key, settingsMap[key]]);
  }
  
  logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Save Settings", "", "", "SUCCESS", "Pengaturan diperbarui"]);
  return { status: "success", message: "Pengaturan berhasil disimpan" };
}

function addCategory(newCategory) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName("SETTINGS");
  const data = sheet.getDataRange().getValues();
  let found = false;
  const safeCategory = newCategory.trim();
  if(!safeCategory) throw new Error("Nama kategori kosong");
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "CATEGORIES") {
      let cats = data[i][1] ? data[i][1].toString().split(',').map(c => c.trim()) : [];
      if (!cats.includes(safeCategory)) { cats.push(safeCategory); sheet.getRange(i + 1, 2).setValue(cats.join(',')); }
      found = true; break;
    }
  }
  if (!found) sheet.appendRow(["CATEGORIES", safeCategory]);
  return { status: "success", message: "Kategori ditambahkan" };
}

function deleteCategory(cat) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("SETTINGS");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "CATEGORIES") {
      const cats = data[i][1].split(',').map(c => c.trim()).filter(c => c !== cat);
      sheet.getRange(i + 1, 2).setValue(cats.join(','));
      return { status: "success", message: `Kategori "${cat}" berhasil dihapus` };
    }
  }
  return { status: "error", message: "Kategori tidak ditemukan" };
}
