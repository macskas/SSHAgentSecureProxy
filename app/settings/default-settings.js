const path = require('path');
const fs = require('fs');
const isAccelerator = require('electron-is-accelerator');

let default_settings = {
    "agent.listen_path": { default: "/tmp/sock", description: "My SSH agent socket", type: "string" },
    "agent.remote_path": { default: (process.env.SSH_AUTH_SOCK || ""), description: "Remote SSH agent socket", type: "string" },
    "agent.override": { default: 1, description: "Override original agent socket", type: "boolean" },
    "agent.mask_key_comment": { default: 1, description: "Mask key names", type: "boolean" },
    "lock.idle_seconds": { default: 600, description: "Idle seconds", type: "number", "min": 0, "max": 86400 },
    "dashboard.accept_seconds": { default: "600 1800", description: "Buttons in dashboard/tray", type: "string" },
    "notification.popup": { default: 1, description: "Notification popups", type: "boolean" },
    "notification.popup_sound": { default: 1, description: "Popup sounds", type: "boolean" },
    "notification.popup_limit_count": { default: 1, description: "limit count", type: "number", min: 0, max: 3600  },
    "notification.popup_limit_interval": { default: 10, description: "limit check interval", type: "number", min: 0, max: 1000 },
    "controls.approve_last": { default: "F3", description: "Approve last sign request", type: "key" },
    "controls.approve_all": { default: "Control+Shift+F3", description: "Approve all pending sign request", type: "key" },
    "controls.autoapprove_seconds": { default: 15, description: "Autoapprove seconds after a single approve", type: "number", min: 0, max: 3600 },
    "log.memory_buffer_size": { default: 500, description: "Maximum in-memory log entry", type: "number", min: 0, max: 10000 },

    "window.width": { default: 800, description: "mainWindow.width", type: "number", min: 0, max: 3000, internal: true },
    "window.height": { default: 600, description: "mainWindow.height", type: "number", min: 0, max: 3000, internal: true },

    "app.first_run": { default: 1, description: "app.first_run", type: "boolean", internal: true },
    "app.version": { default: "1.0.2", description: "app.version", type: "string", internal: true }
};

const numberValidator = function (lVal) {
    let ret = [ 1, "OK" ];
    const tlval = typeof lVal;

    switch (tlval) {
        case 'string':
            if (lVal.match(/^-?[0-9]+$/)) {
                lVal = parseInt(lVal);
            } else {
                return [ 0, "Invalid string input. Not a number" ];
            }
            break;
        case 'number':
            // OK
            break;
        default:
            return [ 0, `Invalid input datatype: ${tlval}` ];
    }
    if (this.hasOwnProperty("min") && this.hasOwnProperty("max")) {
        if (lVal < this.min || lVal > this.max) {
            ret[0] = 0;
            ret[1] = `Invalid value. should be between ${this.min} and ${this.max}`;
        }
    } else if (this.hasOwnProperty("min")) {
        if (lVal < this.min) {
            ret[0] = 0;
            ret[1] = `Invalid value. should be higher or equal than ${this.min} `;
        }
    } else if (this.hasOwnProperty("max")) {
        if (lVal > this.max) {
            ret[0] = 0;
            ret[1] = `Invalid value. should be lower or equal than ${this.max} `;
        }
    }
    return ret;
}

default_settings["agent.listen_path"].validator = function (lVal) {
    let ret = [ 1, "OK" ];
    if (!lVal) {
        ret = [ 0, "value is empty" ];
        return ret;
    }
    const dName = path.dirname(lVal);
    if (!fs.existsSync(dName)) {
        ret[0] = 2;
        ret[1] = "Dir does not exist";
    }
    return ret;
}

default_settings["agent.remote_path"].validator = function (lVal) {
    let ret = [ 1, "OK" ];
    if (!lVal) {
        ret = [ 0, "value is empty" ];
        return ret;
    }
    const dName = path.dirname(lVal);
    if (!fs.existsSync(dName)) {
        ret[0] = 2;
        ret[1] = "Dir does not exist";
    } else {
        const file_stat = fs.statSync(lVal);
        if (file_stat) {
            if (!file_stat.isSocket()) {
                ret[0] = 2;
                ret[1] = "path is not a socket";
            }
        } else {
            ret[0] = 2;
            ret[1] = "remote socket does not exist yet";
        }
    }
    return ret;
}


default_settings["dashboard.accept_seconds"].validator = function (lVal) {
    let ret = [ 1, "OK" ];
    if (!lVal.match(/^[0-9 ]+$/)) {
        ret[0] = 0;
        ret[1] = "Invalid value. Should be number separated by space";
        return ret;
    }
    const lVals = lVal.split(/\s+/);
    if (lVals.length === 0) {
        ret[0] = 0;
        ret[1] = "Invalid value. Should be number separated by space (empty list)";
        return ret;
    }

    for (let i=0; i<lVals.length; i++) {
        if (!lVals[i].match(/^[0-9]+$/)) {
            ret[0] = 0;
            ret[1] = "Invalid value. Should be number separated by space (empty list)";
            return ret;
        }
    }
    return ret;
}

default_settings["controls.approve_last"].validator = default_settings["controls.approve_all"].validator = function (lVal) {
    let ret = [ 1, "OK" ];
    if (!isAccelerator(lVal)) {
        ret[0] = 0;
        ret[1] = "Invalid shortcut";
    }
    return ret;
}

default_settings["controls.autoapprove_seconds"].validator = numberValidator;
default_settings["lock.idle_seconds"].validator = numberValidator;
default_settings["log.memory_buffer_size"].validator = numberValidator;
default_settings["notification.popup_limit_interval"].validator = numberValidator;
default_settings["notification.popup_limit_count"].validator = numberValidator;

module.exports = default_settings;
