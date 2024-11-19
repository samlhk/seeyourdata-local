const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    readDB: () => ipcRenderer.invoke('read-db'),
    writeDB: (json) => ipcRenderer.invoke('write-db', json),
    getDBPath: () => ipcRenderer.invoke('get-db-path')
})