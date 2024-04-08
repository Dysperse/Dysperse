// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, Tray, Menu } = require("electron");
const path = require("path");

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
      // devTools: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // // prevent users from doing CTRL+R. refactor this in the future
  // mainWindow.on("ready-to-show", () => {
  //   mainWindow.show();
  //   mainWindow.removeMenu();
  // });

  // prevent window from closing on close button click
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Create a tray icon
  const tray = new Tray(path.join(__dirname, "favicon.ico"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Dysperse",
      click: () => mainWindow.show(),
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
        app.exit();
      },
    },
  ]);

  tray.setToolTip("Dysperse");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // and load the index.html of the app.
  mainWindow.loadURL("https://app.dysperse.com");

  const setColor = () => {
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
}
app.whenReady().then(() => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
