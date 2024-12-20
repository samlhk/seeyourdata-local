const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    readDB: () => ipcRenderer.invoke('read-db'),
    writeDB: (json) => ipcRenderer.invoke('write-db', json),
    getDBPath: () => ipcRenderer.invoke('get-db-path'),
    ipsToLatlong: (ips) => ipcRenderer.invoke('ips-to-latlong', ips),
    ask: (query) => ipcRenderer.invoke('ask', query)
})