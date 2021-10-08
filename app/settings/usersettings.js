const path = require('path');
const fs = require('fs');
const default_settings = require('./default-settings');
const myLogger = require('../logger');
const globalEvents = require('../globalEvents');

const UserSettings = new (function () {
    let opts = {};
    let filePath = false;
    let userDataPath = false;
    let saveTimer = false;
    let configLoaded = false;

    this.setUserDataPath = function (configName, iUserDataPath) {
        userDataPath = iUserDataPath;
        filePath = path.join(userDataPath, configName + '.json');
        try {
            if (fs.existsSync(filePath)) {
                let file_opts = JSON.parse(fs.readFileSync(filePath));
                for (let key in file_opts) {
                    if (opts.hasOwnProperty(key)) {
                        const old_value = opts[key].value;
                        const new_value = file_opts[key];
                        let doEmit = false;
                        if (opts[key].value !== file_opts[key]) {
                            doEmit = true;
                        }
                        opts[key].value = file_opts[key];
                        if (doEmit) {
                            configModified(key, old_value, new_value);
                        }
                    }
                }
                configLoaded = true;
                globalEvents.emit("usersettings.ready", { 'path': filePath, 'exists': true });
            } else {
                configLoaded = true;
                globalEvents.emit("usersettings.ready", { 'path': filePath, 'exists': false });
            }
        } catch (e) {
            myLogger.add("warn", `UserSettings.setUserDataPath(): Failed to read ${filePath}`)
        }
    }

    this.isConfigLoaded = function () {
        return configLoaded;
    }

    const configModified = function (key, oldValue, newValue) {
        globalEvents.emit("usersettings.modified", key, oldValue, newValue);
        globalEvents.emit(`usersettings.modified.${key}`, key, oldValue, newValue);

        if (key === "log.memory_buffer_size") {
            myLogger.setMaxLength(UserSettings.get("log.memory_buffer_size"));
        }
        if (opts[key].internal) {
            //myLogger.add("debug", `settings.modified: key="${key}", old value="${oldValue}" new value="${newValue}"`);
        } else {
            myLogger.add("info", `settings.modified: key="${key}", old value="${oldValue}" new value="${newValue}"`);
        }
    }

    this.getMeta = function (key) {
        if (opts.hasOwnProperty(key)) {
            return opts[key];
        } else {
            return {};
        }
    }

    this.get = function (key, defaultValue) {
        if (opts.hasOwnProperty(key)) {
            if (opts[key].hasOwnProperty("value")) {
                return opts[key].value;
            } else {
                return opts[key].default;
            }
        } else {
            return defaultValue;
        }
    }

    this.getAll = function () {
        let localopts = {};
        for (let k in opts) {
            localopts[k] = {};
            Object.assign(localopts[k], opts[k]);
            for (let attr in opts[k]) {
                if (typeof(opts[k][attr]) === "function") {
                    localopts[k][attr] = false;
                }
            }
        }
        return localopts;
    }

    this.restore_default = function (key) {
        if (opts[key].hasOwnProperty("value")) {
            const oldValue = opts[key].value;
            delete opts[key]["value"];
            configModified(key, oldValue, undefined);
            this.save_lazy();
            return [1, "OK"];
        }
        this.save_lazy();
        return [1, "OK"];
    }

    this.set = function (key, val) {
        let ret = [ 1, "OK" ];
        if (!opts.hasOwnProperty(key)) {
            return [ 0, "Invalid key" ];
        }

        if (opts[key].hasOwnProperty("validator") && typeof(opts[key].validator) === "function") {
            ret = opts[key].validator(val);
            if (ret[0] === 0) {
                return ret;
            }
        }
        const oldValue = opts[key].value;
        opts[key].value = val;
        configModified(key, oldValue, val)
        this.save_lazy();
        return ret;
    }

    this.save_lazy = function () {
        const self = this;
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = false;
        }
        saveTimer = setTimeout(function () {
            self.save();
        }, 1000);
    }

    this.save = function () {
        if (filePath) {
            try {
                let newopts = {};
                for (let k in opts) {
                    if (opts[k].hasOwnProperty("value")) {
                        newopts[k] = opts[k].value;
                    }
                }
                fs.writeFileSync(filePath, JSON.stringify(newopts));
                globalEvents.emit("usersettings.saved");
            } catch (e) {
                myLogger.add("warn", `UserSettings.save: Failed to write config to file: ${filePath}, error: (${e.message})`);
            }
        }
    }

    this.setConfig = function (k, attrs) {
        const valid_attributes = {
            "default": [ "string", "number", "boolean" ],
            "description": [ "string" ],
            "placeholder": [ "string" ],
            "type": [ "string" ],
            "validator": [ "function" ],
            "internal": [ "boolean" ],
            "min": [ "number" ],
            "max": [ "number" ]
        };
        if (typeof k !== "string")
            throw "key is not a string";

        if (typeof attrs !== "object")
            throw `attrs is not an object for key: ${k}`;

        const kMatch = k.match(/^([^.]+)\./);
        if (!kMatch)
            throw `could not extract category from the given config key: ${k}`;

        let lCategory = kMatch[1];

        let lopt = {
            default: false,
            description: false,
            category: lCategory,
            placeholder: false,
            type: "string",
            validator: false,
            internal: false,
            min: false,
            max: false,
            readonly: false
        };

        if (!opts.hasOwnProperty(k)) {
            opts[k] = lopt;
        }

        for (let lk in attrs) {
            if (!valid_attributes.hasOwnProperty(lk)) {
                throw `Invalid property ${k}.${lk}`;
            }
            const ltype = typeof attrs[lk];
            if (valid_attributes[lk].indexOf(ltype) === -1)
                throw `Invalid attribute type(${ltype}) for ${k}.${lk}`
            opts[k][lk] = attrs[lk];
        }
        return this;
    }

    this.importConfig = function (multiOpts) {
        for (let lk in multiOpts) {
            this.setConfig(lk, multiOpts[lk]);
        }
        myLogger.setMaxLength(UserSettings.get("log.memory_buffer_size", 1000));
    }

})();

UserSettings.importConfig(default_settings);
module.exports = UserSettings;
