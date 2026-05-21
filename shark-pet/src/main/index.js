const { app, BrowserWindow, Tray, Menu, ipcMain, screen, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let tray;

const DATA_DIR = path.join(app.getPath('home'), '.shark-pet');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function saveData(data) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 200,
    height: 280,
    x: width - 220,
    y: height - 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.setIgnoreMenuShortcuts(true);
}

function createTray() {
  const trayIconPath = path.join(__dirname, '../../assets', 'icon.png');
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('肥肥鲨 - 桌面宠物');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  globalShortcut.register('Ctrl+Shift+S', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  try {
    await saveData({
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to save data:', e);
  }
});

ipcMain.handle('save-data', async (event, data) => {
  await saveData(data);
});

ipcMain.handle('load-data', async () => {
  return await loadData();
});

ipcMain.handle('get-screen-size', () => {
  return screen.getPrimaryDisplay().workAreaSize;
});

ipcMain.handle('set-window-position', (event, x, y) => {
  mainWindow.setPosition(x, y);
});

ipcMain.handle('toggle-window', () => {
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
});