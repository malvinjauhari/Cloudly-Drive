function logToDatabase(sheetName, rowData) {
  SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName).appendRow(rowData);
}

function byteToHex(bytes) {
  return bytes.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function handleTelegramWebhook(update) {
  if (!update || !update.message || !update.message.chat || !update.message.chat.id) return;
  const chatId = (update.message.chat.id || "").toString(), text = (update.message.text || "").trim();
  if (!text) return;
  const settingsData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName("SETTINGS").getDataRange().getValues();
  let token = "", adminId = "";
  for (let i = 1; i < settingsData.length; i++) {
    if(settingsData[i][0] === "TELEGRAM_BOT_TOKEN") token = settingsData[i][1].toString();
    if(settingsData[i][0] === "TELEGRAM_ADMIN_ID") adminId = settingsData[i][1].toString();
  }
  if (!token || !adminId || chatId !== adminId) return;
  if (text.startsWith("/start")) UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "post", payload: { chat_id: chatId, text: "🤖 *Cloudly Drive Aktif!*\n/status - Cek Kuota\n/upload - Buka Dashboard", parse_mode: "Markdown" }, muteHttpExceptions: true });
}
