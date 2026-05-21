const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sharkPet', {
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  setWindowPosition: (x, y) => ipcRenderer.invoke('set-window-position', x, y),
  toggleWindow: () => ipcRenderer.invoke('toggle-window')
});