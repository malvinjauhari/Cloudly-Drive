/**
 * =========================================================
 * VIRTUAL MULTI-DRIVE STORAGE MANAGER - MASTER APP (PROD V6)
 * NAMA APLIKASI: Cloudly Drive
 * FITUR: Dynamic Login, Multi-File Upload, Settings Panel, Users/Workers CRUD
 * =========================================================
 */

const CONFIG = {
  get SPREADSHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  },
  get SECRET_KEY() {
    return PropertiesService.getScriptProperties().getProperty('SECRET_KEY');
  }
};

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet(e) {
  const html = HtmlService.createTemplateFromFile('index');
  return html.evaluate()
      .setTitle('Cloudly Drive - Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) return ContentService.createTextOutput("OK");
    const update = JSON.parse(e.postData.contents);
    if (update && update.update_id) {
      const updateIdStr = update.update_id.toString();
      const cache = CacheService.getScriptCache();
      if (cache.get(updateIdStr)) return ContentService.createTextOutput("OK");
      cache.put(updateIdStr, "processed", 600);
    }
    handleTelegramWebhook(update);
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  }
}
