if (require("electron-squirrel-startup")) return;

// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, Tray, Menu } = require("electron");

// Squirrel event
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require("child_process");
  const path = require("path");

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {
      console.log(error);
    }

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}

const path = require("path");

const gotTheLock = app.requestSingleInstanceLock();

let mainWindow;
let tray;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.ico"),
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  let loadingTimer;

  mainWindow.webContents.on("did-start-loading", () => {
    // Start a timer to check if loading takes more than 500ms
    loadingTimer = setTimeout(() => {
      mainWindow.setProgressBar(2, { mode: "indeterminate" });
    }, 200);
  });

  mainWindow.webContents.on("did-stop-loading", () => {
    // Clear the timer when loading finishes
    clearTimeout(loadingTimer);
    mainWindow.setProgressBar(-1);
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
          const color = t.content?.split(",")?.[2]?.split("%")?.[0];
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

if (!gotTheLock) {
  app.quit();
} else {
  app.on(
    "second-instance",
    (event, commandLine, workingDirectory, additionalData) => {
      // Print out data received from the second instance.
      console.log(additionalData);

      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    }
  );

  app.whenReady().then(() => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();

    if (!tray) {
      tray = new Tray(path.join(__dirname, "favicon.ico"));
      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Open Dysperse",
          click: () => mainWindow && mainWindow.show(),
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
      tray.on("click", () => mainWindow && mainWindow.show());
    }
  });
}

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
