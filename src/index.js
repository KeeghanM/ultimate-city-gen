const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
let win

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit()
}

createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    center: true,
    // frame: false,
    movable: true,
    resizable: true,
    minimizable: true,
    useContentSize: false,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, "index.html"))

  win.maximize()
  win.setMenu(null)
  win.show()

  // win.webContents.openDevTools()
}
app.on("ready", createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
