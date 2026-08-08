/**
 * =========================================================
 * SETUP - Jalankan fungsi ini SEKALI untuk mengatur credentials
 * =========================================================
 * 
 * CARA PENGGUNAAN:
 * 1. Buka Google Apps Script Editor
 * 2. Jalankan fungsi setupMasterCredentials() untuk Master App
 * 3. Jalankan fungsi setupWorkerCredentials() untuk Worker App
 * 4. Hapus fungsi setup ini setelah selesai (opsional)
 */

function setupMasterCredentials() {
  PropertiesService.getScriptProperties().setProperties({
    'SPREADSHEET_ID': 'ISI_SPREADSHEET_ID_ANDA_DISINI',
    'SECRET_KEY': 'ISI_SECRET_KEY_ANDA_DISINI'
  });
  Logger.log('Master credentials berhasil disimpan!');
  Logger.log('SPREADSHEET_ID: ' + PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
  Logger.log('SECRET_KEY: ' + PropertiesService.getScriptProperties().getProperty('SECRET_KEY'));
}

function setupWorkerCredentials() {
  PropertiesService.getScriptProperties().setProperties({
    'SECRET_KEY': 'HARUS_SAMA_DENGAN_MASTER',
    'TARGET_FOLDER_ID': '' // Kosongkan untuk Root Drive, atau isi Folder ID
  });
  Logger.log('Worker credentials berhasil disimpan!');
  Logger.log('SECRET_KEY: ' + PropertiesService.getScriptProperties().getProperty('SECRET_KEY'));
  Logger.log('TARGET_FOLDER_ID: ' + PropertiesService.getScriptProperties().getProperty('TARGET_FOLDER_ID'));
}

function checkCredentials() {
  const props = PropertiesService.getScriptProperties().getProperties();
  Logger.log('=== Current Credentials ===');
  for (const key in props) {
    if (key === 'SECRET_KEY') {
      Logger.log(key + ': ' + props[key].substring(0, 4) + '****');
    } else {
      Logger.log(key + ': ' + props[key]);
    }
  }
}
