const { powerMonitor } = require('electron');
const UserSettings = require('../settings/usersettings');
const myLogger = require('../logger');
const globalEvents = require('../globalEvents');

const SSHModesLockAndBypass = new (function () {
    const self = this;
    const powerLockCheckInterval = 1000;

    let locked_by_idle = false;

    let manual_ssh_mode = false;
    let temp_bypass_seconds = 0;

    let rManualByPassTimeout = false;

    const lockStateChange = function () {
        myLogger.add("debug", `lockStateChange() locked_by_idle=${locked_by_idle}, manual_ssh_mode=${manual_ssh_mode}, tmp-bypass-seconds: ${temp_bypass_seconds}`);

        if (locked_by_idle) {
            globalEvents.emit("sshlock.mode.update", "blocked", "idle");
            return false;
        }

        if (manual_ssh_mode === "bypass-temp" || manual_ssh_mode === "bypass") {
            globalEvents.emit("sshlock.mode.update", "bypass", temp_bypass_seconds);
        } else if (manual_ssh_mode === false) {
            globalEvents.emit("sshlock.mode.update", "default", false);
        } else if (manual_ssh_mode === "blocked") {
            globalEvents.emit("sshlock.mode.update", "blocked", false);
        }
    }

    const internal_checkers = function () {
        powerLockCheck();
    }

    const powerLockCheck = function () {
        const idle_seconds_limit = UserSettings.get("lock.idle_seconds", 0);
        let idle_seconds_limit_int = 0;
        if (!idle_seconds_limit)
            return false;
        if (typeof  idle_seconds_limit === "number") {
            idle_seconds_limit_int = idle_seconds_limit;
        } else {
            idle_seconds_limit_int = parseInt(idle_seconds_limit);
        }
        if (idle_seconds_limit_int <= 0) {
            if (locked_by_idle !== false) {
                locked_by_idle = false;
                lockStateChange();
            }
            return false;
        }

        if (powerMonitor && powerMonitor.getSystemIdleTime) {
            const idle_seconds = powerMonitor.getSystemIdleTime();
            if (idle_seconds_limit_int && idle_seconds >= idle_seconds_limit) {
                if (locked_by_idle !== true) {
                    locked_by_idle = true;
                    lockStateChange();
                }
            } else {
                if (locked_by_idle !== false) {
                    locked_by_idle = false;
                    lockStateChange();
                }
            }
        }
    }

    const _init = function () {
        setInterval(internal_checkers, powerLockCheckInterval);
        globalEvents.on("tray.SSHModes", function (arg1, arg2) {
            if (arg1 === "bypass-temp") {
                self.setTempBypass(arg2);
            } else {
                self.setManualMode(arg2);
            }
        });
    }

    const bypassTimer = function () {
        if (rManualByPassTimeout) {
            clearTimeout(rManualByPassTimeout);
            rManualByPassTimeout = true;
        }
        rManualByPassTimeout = setTimeout(function () {
            self.setManualMode(false);
            rManualByPassTimeout = false;
        }, temp_bypass_seconds*1000);
    }

    this.setTempBypass = function (unlockSeconds) {
        if (manual_ssh_mode !== "bypass-temp" || temp_bypass_seconds !== unlockSeconds) {
            manual_ssh_mode = "bypass-temp";
            temp_bypass_seconds = unlockSeconds;
            lockStateChange();
            bypassTimer();
        }
        return this;
    }

    this.setManualMode = function (mode) {
        if (manual_ssh_mode !== mode) {
            manual_ssh_mode = mode;
            temp_bypass_seconds = 0;
            lockStateChange();
        }
        return this;
    }

    this.isBypass = function () {
        if (locked_by_idle)
            return false;

        if (manual_ssh_mode === "bypass" || manual_ssh_mode === "bypass-temp")
            return true;

        return false;
    }

    this.isBlocked = function () {
        if (locked_by_idle)
            return true;
        if (manual_ssh_mode === "blocked")
            return true;
        return false;
    }

    this.getLockMode = function () {
        return {
            manual_ssh_mode: manual_ssh_mode,
            temp_bypass_seconds: temp_bypass_seconds
        };
    }

    _init();
});

module.exports = SSHModesLockAndBypass;