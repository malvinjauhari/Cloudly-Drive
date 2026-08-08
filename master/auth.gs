function verifyLogin(username, password) {
  if (!CONFIG.SPREADSHEET_ID || !CONFIG.SECRET_KEY) {
    return { status: "error", message: "Credentials belum di-set. Jalankan setupMasterCredentials() di GAS Editor." };
  }
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const usersData = ss.getSheetByName("USERS").getDataRange().getValues();
  
  for (let i = 1; i < usersData.length; i++) {
    const dbUser = usersData[i][0].toString().trim();
    const dbPass = usersData[i][1].toString().trim();
    
    if (username === dbUser && password === dbPass) {
      const drives = getAvailableDrives(ss);
      return { 
        status: "success", 
        user: { name: usersData[i][2], email: usersData[i][3], role: usersData[i][4] },
        drives: drives
      };
    }
  }
  return { status: "error", message: "Username atau password salah!" };
}

function getAvailableDrives(ss) {
  const drivesData = ss.getSheetByName("DRIVES").getDataRange().getValues();
  let workers = [];
  for (let i = 1; i < drivesData.length; i++) {
    if (drivesData[i][0] !== "" && drivesData[i][4] === "ONLINE") {
      workers.push({
        id: drivesData[i][0], name: drivesData[i][1], email: drivesData[i][2], free_bytes: Number(drivesData[i][7] || 0)
      });
    }
  }
  return workers;
}
