const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    shell: (url) => shell.openExternal(url),
});