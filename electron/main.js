// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, Tray, Menu } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");

const localServerApp = express();
const PORT = 8088;

const startLocalServer = (done) => {
  localServerApp.use(express.json({ limit: "100mb" }));
  localServerApp.use(cors());
  localServerApp.use(express.static("./dist/"));
  localServerApp.listen(PORT, async () => {
    console.log("Server Started on PORT ", PORT);
    done();
  });
};

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.png"),
    center: true,
    titleBarOverlay: {
      color: "rgba(0,0,0,0)",
      symbolColor: "#fff",
    },
    titleBarStyle: "hidden",
    backgroundColor: "#000",
    webPreferences: {
      nodeIntegration: true,
      scrollBounce: true,
      devTools: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // prevent users from doing CTRL+R. refactor this in the future
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.removeMenu();
  });

  // prevent window from closing on close button click
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Create a tray icon
  const tray = new Tray(path.join(__dirname, "dist/favicon.ico"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Dysperse",
      click: () => mainWindow.show(),
    },
    {
      label: "Quit",
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip("Dysperse");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // open url in a browser and prevent default
    shell.openExternal(url);
    return { action: "deny" };
  });

  // and load the index.html of the app.
  //   mainWindow.loadFile('index.html')
  mainWindow.loadURL("http://localhost:" + PORT);

  const setColor = () => {
    // if window is out of focus, don't change the color
    if (!mainWindow.isFocused()) return;

    const metaTags = mainWindow.webContents.executeJavaScript(`
      Array.from(document.querySelectorAll('meta')).map(tag => ({
        name: tag.getAttribute('name'),
        content: tag.getAttribute('content')
      }));
    `);

    metaTags
      .then((tags) => {
        const t = tags.filter((tag) => tag.name === "theme-color")?.[0];
        if (t) {
          // get 98.0% from hsl(240, 20.0%, 98.0%)
          const color = t.content.split(",")[2].split("%")[0];
          mainWindow.setTitleBarOverlay({
            color: `rgba(0,0,0,0)`,
            symbolColor: color > 50 ? "#000" : "#fff",
          });
        }
      })
      .catch((error) => {
        console.error("Error retrieving meta tags:", error);
      });
  };

  mainWindow.webContents.on("dom-ready", () => {
    setColor();
    setInterval(setColor, 1000);
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  startLocalServer(createWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
