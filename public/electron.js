const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'dev';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/../build/index.html`);
}

app.on("ready", async () => {
  ipcMain.handle('read-db', async (event, arg) => {
    try {
      const data = fs.readFileSync(path.join(app.getPath('userData'), 'db.json'), 'utf8');
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('write-db', async (event, json) => {
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'db.json'), JSON.stringify(json));
      return true;
    } catch (err) {
      console.error(err);
    }
  })

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
