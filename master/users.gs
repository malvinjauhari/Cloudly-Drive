function getUsers() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const data = ss.getSheetByName("USERS").getDataRange().getValues();
  let users = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== "") {
      users.push({
        username: data[i][0].toString().trim(),
        name: data[i][2].toString(),
        email: data[i][3].toString(),
        role: data[i][4].toString()
      });
    }
  }
  return users;
}

function saveUser(originalUsername, data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("USERS");
  const existing = sheet.getDataRange().getValues();
  
  if (originalUsername) {
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0].toString().trim() === originalUsername) {
        sheet.getRange(i + 1, 1).setValue(data.username);
        if (data.password) sheet.getRange(i + 1, 2).setValue(data.password);
        sheet.getRange(i + 1, 3).setValue(data.name);
        sheet.getRange(i + 1, 4).setValue(data.email);
        sheet.getRange(i + 1, 5).setValue(data.role);
        logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Update User", data.username, "", "SUCCESS", "User diperbarui"]);
        return { status: "success", message: "User berhasil diperbarui" };
      }
    }
    return { status: "error", message: "User tidak ditemukan" };
  } else {
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0].toString().trim() === data.username) {
        return { status: "error", message: "Username sudah digunakan" };
      }
    }
    sheet.appendRow([data.username, data.password, data.name, data.email, data.role]);
    logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Add User", data.username, "", "SUCCESS", "User baru ditambahkan"]);
    return { status: "success", message: "User berhasil ditambahkan" };
  }
}

function deleteUser(username) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("USERS");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim() === username) {
      sheet.deleteRow(i + 1);
      logToDatabase("ACTIVITY_LOG", [new Date(), "Admin", "Delete User", username, "", "SUCCESS", "User dihapus"]);
      return { status: "success", message: "User berhasil dihapus" };
    }
  }
  return { status: "error", message: "User tidak ditemukan" };
}
