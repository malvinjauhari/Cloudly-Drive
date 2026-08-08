  function getActivityLogs() {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName("ACTIVITY_LOG");
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    const logs = [];
    for (let i = data.length - 1; i >= 1 && logs.length < 50; i--) {
      logs.push({
        timestamp: data[i][0] ? Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss") : "-",
        user: data[i][1] || "-",
        action: data[i][2] || "-",
        target: data[i][3] || "-",
        status: data[i][4] || "-",
        detail: data[i][5] || "-"
      });
    }
    return logs;
  }
