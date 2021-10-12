const { Tray, nativeImage, app, Menu} = require('electron');
const path = require('path');
const UserSettings = require("../settings/usersettings");
const globalEvents = require('../globalEvents');


const myTray = new (function () {
    const self = this;
    let tray = null;
    let tray_mode = false;
    let mainWindow = null;
    let sshlock_mode = "default";

    const tray_size = process.platform === 'darwin' ? [ 24, 24 ] : [ 128, 128 ];

    const image = nativeImage.createFromPath(path.join(__dirname, "../resources/agent-icon-default.png")).resize({ width: tray_size[0], height: tray_size[1] });
    const image_new = nativeImage.createFromPath(path.join(__dirname, "../resources/agent-icon-redmarker.png")).resize({ width: tray_size[0], height: tray_size[1] });
    const image_textgreen = nativeImage.createFromPath(path.join(__dirname, "../resources/agent-icon-textgreen.png")).resize({ width: tray_size[0], height: tray_size[1] });
    const image_textred = nativeImage.createFromPath(path.join(__dirname, "../resources/agent-icon-textred.png")).resize({ width: tray_size[0], height: tray_size[1] });

    this.setTrayDefault = function () {
        if (tray_mode === "default") {
            return false;
        }
        tray.setImage(image);
        tray_mode = "default";
    }
    this.setTrayNew = function () {
        if (tray_mode === "new") {
            return false;
        }
        tray.setImage(image_new);
        tray_mode = "new";
    }
    this.setTrayBypass = function () {
        if (tray_mode === "bypass") {
            return false;
        }
        tray.setImage(image_textgreen);
        tray_mode = "bypass";
    }
    this.setTrayBlocked = function () {
        if (tray_mode === "blocked") {
            return false;
        }
        tray.setImage(image_textred);
        tray_mode = "blocked";
    }

    globalEvents.on("usersettings.modified.dashboard.accept_seconds", function () {
        self.updateTrayMenu();
    });

    this.updateTrayMenu = function () {
        const accept_seconds = UserSettings.get("dashboard.accept_seconds", "");
        let accept_seconds_list = [];
        if (accept_seconds && accept_seconds.length > 1 && typeof accept_seconds === "string") {
            const acsplit = accept_seconds.split(/\s+/);
            for (let i=0; i<acsplit.length; i++) {
                const tmpInt = parseInt(acsplit[i]);
                accept_seconds_list.push(tmpInt);
            }
            accept_seconds_list.sort(function (a, b) { return a-b });
        }

        let menuItems = [];
        menuItems.push({
            label: 'show',
            click: () => {
                mainWindow.restore()
            }
        });
        menuItems.push({
            type: "separator"
        });
        menuItems.push({
            label: 'mode: default',
            click: () => {
                globalEvents.emit("tray.SSHModes", "setManualMode", false);
                //SSHModes.setManualMode(false);
            }
        });
        menuItems.push({
            label: 'mode: block',
            click: () => {
                globalEvents.emit("tray.SSHModes", "setManualMode", "blocked");
            }
        });
        menuItems.push({
            label: 'mode: bypass',
            click: () => {
                globalEvents.emit("tray.SSHModes", "setManualMode", "bypass");
            }
        });
        menuItems.push({
            type: "separator"
        });

        if (accept_seconds_list.length) {
            if (accept_seconds_list.length) {
                for (let i = 0; i < accept_seconds_list.length; i++) {
                    menuItems.push({
                        label: `tmp: bypass (${accept_seconds_list[i]}s)`,
                        click: () => {
                            globalEvents.emit("tray.SSHModes", "bypass-temp", accept_seconds_list[i]);
                        }
                    });
                }
            }
            menuItems.push({
                type: "separator"
            });
        }

        menuItems.push({
            label: 'quit',
            click: () => {
                app.quit();
            }
        });

        menuItems.push({
            enabled: false,
            label: 'version: '+UserSettings.get("app.version")
        });

        const trayMenu = Menu.buildFromTemplate(menuItems);
        tray.setContextMenu(trayMenu);
    }

    const _init = function () {
        tray = new Tray(image);
        self.setTrayDefault();
        self.updateTrayMenu();

        globalEvents.on("sshlock.mode.update", function (mode, extra) {
            sshlock_mode = mode;
            switch (mode) {
                case 'blocked':
                    self.setTrayBlocked();
                    break;
                case 'bypass':
                    self.setTrayBypass();
                    break;
                case 'default':
                    self.setTrayDefault();
                    break;
            }
        });

        globalEvents.on("pendingRequests.autoapprove.enabled", function () {
            self.setTrayBypass();
        });

        globalEvents.on("pendingRequests.autoapprove.disabled", function () {
            switch (sshlock_mode) {
                case 'blocked':
                    self.setTrayBlocked();
                    break;
                case 'bypass':
                    self.setTrayBypass();
                    break;
                case 'default':
                    self.setTrayDefault();
                    break;
            }
        });
    }


    this.setMainWindow = function (mw) {
        mainWindow = mw;
        return this;
    }

    this.newMessage = function () {
        if (tray_mode === "default") {
            this.setTrayNew();
        }
    }

    this.noNewMessage = function () {
        if (tray_mode === "new") {
            this.setTrayDefault();
        }
    }

    app.whenReady().then(() => {
        _init();
    });
})();

module.exports = myTray;
