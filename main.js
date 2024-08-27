const { app, BrowserWindow, ipcMain, ipcRenderer, Tray, Menu, protocol } = require('electron');
const path = require('path');
const url = require('url');
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");

setupTitlebar();

let mainWindow;
let focusModeWindow;
let tray;
const customScheme = 'crmaster';
app.setAsDefaultProtocolClient(customScheme);

const isDev = true;

const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;


function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1450,
        height: 850,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadURL(startURL);

}

ipcMain.on('open-focus-mode', (event) => {
    if (focusModeWindow) {
        focusModeWindow.close();
        focusModeWindow = null;
    }
    createFocusModeWindow();

});

ipcMain.on('close-focus-mode', (event) => {
    if (focusModeWindow) {
        focusModeWindow.close();
        focusModeWindow = null;
    }
});

function createTray() {
    tray = new Tray(path.join(__dirname, '../src/modules/common/assets/img/icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open CRMaster', click: () => mainWindow.show() },
        { label: 'Exit Program', click: () => app.quit() }
    ]);

    tray.setToolTip('Chimera');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => mainWindow.show());
}

function createFocusModeWindow() {

    const focusWindowWidth = 400;
    const focusWindowHeight = 200;

    focusModeWindow = new BrowserWindow({
        width: focusWindowWidth,
        height: focusWindowHeight,
        frame: true,
        alwaysOnTop: true,
        resizable: false,
        movable: true,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        transparent: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            enableRemoteModule: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
        },
        skipTaskbar: true
    });

    focusModeWindow.loadURL('http://localhost:3000/focus-mode-popup');

    const { screen } = require('electron');
    const mainScreen = screen.getPrimaryDisplay();
    const { width, height } = mainScreen.workAreaSize;
    focusModeWindow.setPosition(width - focusWindowWidth - 20, 50);
}


app.on('ready', () => {

    // protocol.registerStringProtocol('crmaster', (request, callback) => {
    //     const url = request.url.substr(10); // Strip the 'crmaster://' part
    //     const page = url; // Extract the page part from the custom protocol URL

    //     if (mainWindow) {
    //         mainWindow.focus();
    //         mainWindow.webContents.send('navigate-to', page);
    //     } else {
    //         createWindow();
    //         mainWindow.webContents.once('did-finish-load', () => {
    //             mainWindow.webContents.send('navigate-to', page);
    //         });
    //     }

    //     callback({ data: '', mimeType: 'text/html' });
    // });

    createTray();
    createWindow();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

});

ipcMain.on('close-main-window', (event) => {
    if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});


ipcMain.on('navigate-to', (event, page) => {
    window.location.hash = `#/${page}`;
});