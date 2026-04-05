import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerIpc } from "./ipc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

async function createWindow() {
  const window = new BrowserWindow({
    width: 1540,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#f8efe6",
    title: "Mikasa",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    await window.loadURL("http://127.0.0.1:5173");
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    await window.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  registerIpc();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
