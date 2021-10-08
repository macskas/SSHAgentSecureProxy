const { autoUpdater } = require('electron-updater');
const globalEvents = require('../globalEvents');

autoUpdater.autoDownload = false;

const myUpdater = new (function () {
    const self = this;

    this.downloadUpdate = function (token) {
        autoUpdater.downloadUpdate(token).catch((err) => {

        });
    }

    this.checkForUpdates = function () {
        autoUpdater.checkForUpdates().catch((err) => {

        });
    }

    this.upgrade = function () {
        setImmediate(() => autoUpdater.quitAndInstall());
    }

    const _init = function () {
        autoUpdater.on('error', (error) => {
            globalEvents.emit("autoupdater.error", error == null ? "unknown" : error.message);
        });

        autoUpdater.on('checking-for-update', () => {
            globalEvents.emit("autoupdater.checking-for-update");
        });

        // updateInfo
        autoUpdater.on('update-available', (availableVersion) => {
            globalEvents.emit("autoupdater.update-available", availableVersion);
        });

        autoUpdater.on('update-cancelled', () => {
            globalEvents.emit("autoupdater.update-cancelled");
        });

        // updateInfo

        autoUpdater.on('update-not-available', (availableVersion) => {
            globalEvents.emit("autoupdater.update-not-available", availableVersion);
        });

        // updateInfo
        autoUpdater.on('update-downloaded', (availableVersion) => {
            globalEvents.emit("autoupdater.update-downloaded", availableVersion);
        });

        autoUpdater.on('download-progress', (info) => {
            globalEvents.emit('autoupdater.download-progress', info);
        });
    }

    _init();
});

module.exports = myUpdater;