const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sharkAPI', {
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data')
});
