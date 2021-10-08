'use strict'

const { app, BrowserWindow, ipcMain, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const UserSettings = require('./settings/usersettings');
const url = require('url');
const pendingRequests = require('./ssh-agent/pendingRequests');
const myNotification = require('./ui/Notification');
const myTray = require('./ui/Tray');
const SSHLocks = require('./ui/SSHModesLockAndBypass');
const myLogger = require('./logger');
const SSHAgentServer = require('./ssh-agent/SSHAgentServer');
const SSHStats = require('./ssh-agent/SSHStats');
const globalEvents = require('./globalEvents');
const SSHKeylisterCient = require('./ssh-agent/SSHKeylisterClient');
const AutoUpdater = require('./ui/AutoUpdater');

const appTitle = "SSHAuthorizationAgent";
if (!app) {
    console.log("Electron is not available. You have to start your script with electron if you want to use it.");
    return false;
}
app.commandLine.appendSwitch("disable-http-cache", '-autoplay-policy', 'no-user-gesture-required');

let mainWindow = null;

const remote_send = function (...args) {
    if (!mainWindow || !mainWindow.webContents)
        return false;
    mainWindow.webContents.send(...args);
}

ipcMain.on("settings.save.request", function (event, save_list) {
    let response = [];
    for (let i=0; i<save_list.length; i++) {
        if (save_list[i].restore_default) {
            response.push( {
                key: save_list[i].key,
                ret: UserSettings.restore_default(save_list[i].key),
            } );
        } else {
            response.push( {
                key: save_list[i].key,
                ret: UserSettings.set(save_list[i].key, save_list[i].new)
            } );
        }
    }
    event.reply("settings.save.response", response);
    event.reply("settings.update", UserSettings.getAll());
});

ipcMain.on("settings.request", function (event, arg) {
    event.reply("settings.response", UserSettings.getAll());
});

ipcMain.on("stats.request", function (event, arg) {
    event.reply("stats.update", SSHStats.getAll());
});

ipcMain.on("logs.request", function (event, arg) {
    event.reply("logs.response", myLogger.getAll());
});

ipcMain.on("pendingRequests.request", function (event, arg) {
    event.reply("pendingRequests.response", pendingRequests.getPendingRequests());
});

ipcMain.on("pendingRequests.accept", function (event, client_id) {
    pendingRequests.acceptManual(client_id);
    event.reply("pendingRequests.response", pendingRequests.getPendingRequests());
});

ipcMain.on("pendingRequests.deny", function (event, client_id) {
    pendingRequests.denyManual(client_id);
    event.reply("pendingRequests.response", pendingRequests.getPendingRequests());
});

ipcMain.on("pendingRequests.accept.all", function (event) {
    pendingRequests.acceptAllManual();
    event.reply("pendingRequests.response", pendingRequests.getPendingRequests());
});

ipcMain.on("pendingRequests.deny.all", function (event) {
    pendingRequests.denyAllManual();
    event.reply("pendingRequests.response", pendingRequests.getPendingRequests());
});

ipcMain.on("stats.keys.request", function (event, arg) {
    event.reply("stats.keys.response", SSHStats.getKeys());
});

ipcMain.on("ssh-agent.stop", function () {
    SSHAgentServer.stop();
});

ipcMain.on("ssh-agent.start", function () {
    SSHAgentServer.start();
});

ipcMain.on("dashboard.controls.request", function () {
    const accept_seconds_settings = UserSettings.get("dashboard.accept_seconds");

    remote_send("dashboard.controls.response", SSHLocks.getLockMode(), accept_seconds_settings);
});

ipcMain.on("remote-agent.test", function (event, remote_path) {
    let tmp_remote_socket_path = SSHAgentServer.getRemoteSocketPath();
    if (remote_path && remote_path.length) {
        tmp_remote_socket_path = remote_path;
    }
    if (!tmp_remote_socket_path.match(/^\//)) {
        remote_send("remote-agent.test.response", tmp_remote_socket_path, false, "Invalid path");
        return false;
    }

    const rClient = new SSHKeylisterCient(tmp_remote_socket_path, 3);
    rClient.on("success", function (extra_info) {
        remote_send("remote-agent.test.response", tmp_remote_socket_path, true, extra_info);
    }).on("error", function (err) {
        remote_send("remote-agent.test.response", tmp_remote_socket_path, false, err);
    });

    rClient.test();
});

ipcMain.on("dashboard.controls.mode.change", function (event, arg1, arg2) {
    if (arg1 === "bypass-temp") {
        SSHLocks.setTempBypass(arg2);
    } else if (arg1 === "default") {
        SSHLocks.setManualMode(false);
    } else {
        SSHLocks.setManualMode(arg1);
    }
});

ipcMain.on("about.check-for-updates", function (event) {
    AutoUpdater.checkForUpdates();
});

ipcMain.on("about.download-update", function (event) {
    AutoUpdater.downloadUpdate();
});

ipcMain.on("about.upgrade", function (event) {
    AutoUpdater.upgrade();
});

app.setName(appTitle)
app.disableHardwareAcceleration()
app.whenReady().then(() => {
    let shortcut_registered = false;
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
        app.quit()
        return false;
    }
    let isAppQuitting = false;
    let resizeTimer = false;

    UserSettings.setUserDataPath("default", app.getPath("userData"));
    const image = nativeImage.createFromPath(path.join(__dirname, "resources/agent-icon-default.png"));

    let first_run = UserSettings.get("app.first_run", 0);

    mainWindow = new BrowserWindow({
        width: UserSettings.get("window.width"),
        height: UserSettings.get("window.height"),
        backgroundColor: 'lightgray',
        title: appTitle,
        show: false,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            defaultEncoding: 'UTF-8',
            worldSafeExecuteJavaScript: true,
            enableRemoteModule: true,
            nativeWindowOpen: true
        }
    });
    myTray.setMainWindow(mainWindow);

    mainWindow.setIcon(image.resize({ width: 64, height: 64 }));
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'resources/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    if (process.env.APP_ENV === "dev") {
        mainWindow.webContents.openDevTools()
    } else {
        if (!first_run) {
            mainWindow.hide();
        } else {
            UserSettings.set("app.first_run", 0);
        }
    }

    mainWindow.onbeforeunload = (e) => {
        // Prevent Command-R from unloading the window contents.
        e.returnValue = false
    }

    mainWindow.on("restore", function () {

    });

    mainWindow.on('resize', () => {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = false;
        }
        resizeTimer = setTimeout(function () {
            let { width, height } = mainWindow.getBounds();
            UserSettings.set("window.width", width);
            UserSettings.set("window.height", height);
            resizeTimer = false;
        }, 500);
        // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
        // the height, width, and x and y coordinates.
        // Now that we have them, save them using the `set` method.

        //usersettings.set('windowBounds', { width, height });
        //UserSettings.save_lazy();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null)
        mainWindow.show()
        remote_send("ssh-agent.state.response", SSHAgentServer.isRunning());
        remote_send("about.version", UserSettings.get("app.version"));

        if (process.env.APP_MENU) {
            remote_send("renderMenu", process.env.APP_MENU);
        }

        new SSHKeylisterCient(UserSettings.get("agent.remote_path"), 1).test()
    })

    mainWindow.on('close', function (evt) {
        if (!isAppQuitting) {
            evt.preventDefault();
            mainWindow.hide();
        }
    });
    mainWindow.on('closed', function () {
        mainWindow = null
        //mainWindow.hide();
    })

    globalEvents.on("usersettings.saved", function() {
        remote_send("settings.saved");
    });

    globalEvents.on("sshagentserver.state-change", function (state) {
        remote_send("ssh-agent.state.response", SSHAgentServer.isRunning());
    });

    app.on("register-shortcuts", function() {
        if (!shortcut_registered) {
            const key_ApproveLast = UserSettings.get("controls.approve_last", false);
            const key_ApproveAll = UserSettings.get("controls.approve_all", false);
            if (key_ApproveLast) {
                globalShortcut.register(key_ApproveLast, () => {
                    pendingRequests.acceptLastManual();
                });
                shortcut_registered = true;
            }
            if (key_ApproveAll) {
                globalShortcut.register(key_ApproveAll, () => {
                    pendingRequests.acceptAllManual();
                });
                shortcut_registered = true;
            }
        }
    });

    app.on("unregister-shortcuts", function() {
        globalShortcut.unregisterAll();
        shortcut_registered = false;
    });

    app.on("before-quit", function () {
        isAppQuitting = true;
    });
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow.isMinimized())
            mainWindow.restore()
        mainWindow.focus();
    });

    globalEvents.on("pendingRequests.new", function (connection_id, info) {
        app.emit("register-shortcuts");
        let NOTIFICATION_TITLE;
        let NOTIFICATION_MESSAGE;
        let keyName = SSHStats.getKeyCommentByFingerprint(info.fingerprint);
        if (keyName === false) {
            keyName = info.fingerprint;
        } else {
            keyName = path.basename(keyName);
        }
        if (info.username) {
            NOTIFICATION_TITLE = "SSHAgent sign-request (ssh-connection)";
            NOTIFICATION_MESSAGE = `user: ${info.username}, alg: ${info.pkalg}, key: ${keyName}`;
        } else {
            NOTIFICATION_TITLE = "SSHAgent sign-request (non-ssh)";
            NOTIFICATION_MESSAGE = `key: ${keyName}`;
        }
        myNotification.show(NOTIFICATION_TITLE, NOTIFICATION_MESSAGE, image);
        myTray.newMessage();
        remote_send("pendingRequests.response", pendingRequests.getPendingRequests());
    });

    globalEvents.on("pendingRequests.empty", function () {
        app.emit("unregister-shortcuts");
        myTray.noNewMessage();
        remote_send("pendingRequests.response", []);
    });

    globalEvents.on("stats.keys.updated", function () {
        remote_send("stats.keys.response", SSHStats.getKeys());
    });

    globalEvents.on("sshlock.mode.update", function () {
        const accept_seconds_settings = UserSettings.get("dashboard.accept_seconds");
        remote_send("dashboard.controls.response", SSHLocks.getLockMode(), accept_seconds_settings);

        if (SSHLocks.isBlocked()) {
            pendingRequests.denyAllManual();
        } else if (SSHLocks.isBypass()) {
            pendingRequests.acceptAllManual();
        }

    });

    globalEvents.on("stats.events.updated", function () {
        remote_send("stats.update", SSHStats.getAll());
    });

    globalEvents.on("notification.click", function () {
        if (mainWindow) {
            mainWindow.show();
        }
    });

    globalEvents.on("notification.play.newMessage", function () {
        remote_send("play.newMessage");
    });


    globalEvents.on("autoupdater.update-available", function (availableVersion) {
        remote_send("about.update", "update-available", availableVersion);
    });

    globalEvents.on("autoupdater.checking-for-update", function () {
        remote_send("about.update", "checking-for-update");
    });

    globalEvents.on("autoupdater.download-progress", function (info) {
        remote_send("about.update", "download-progress", info);
    });

    globalEvents.on("autoupdater.update-not-available", function (availableVersion) {
        remote_send("about.update", "update-not-available", availableVersion);
    });

    globalEvents.on("autoupdater.update-downloaded", function (availableVersion) {
        remote_send("about.update", "update-downloaded", availableVersion);
    });

    globalEvents.on("autoupdater.error", function (errorString) {
        remote_send("about.update", "error",errorString);
    });

    //AutoUpdater.checkForUpdates();
})

app.on('window-all-closed', () => {
    console.log("all.closed();");
})

app.on('will-quit', () => {
    SSHAgentServer.stop();
    globalShortcut.unregisterAll();
});


module.exports = app;