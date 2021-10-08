const strftime = require('strftime');

const UserSettings = require('../settings/usersettings');
const SSHModes = require('../ui/SSHModesLockAndBypass');
const globalEvents = require('../globalEvents');
const logger = require("../logger");

const pendingRequests = new (function () {
    const self = this;
    let conns = {};
    let last_request;
    let accepted_hash = {};
    let denied_hash = {};
    let acceptedHashTimeout = 15;
    let deniedHashTimeout = 5;

    let autoapprove_state = false;
    let autoapprove_settimeout = false;

    this.add = function (clientConnection, info) {
        const now = new Date();
        const client_id = clientConnection.getClientId();
        if (conns.hasOwnProperty(client_id)) {
            delete conns[client_id];
        }
        conns[client_id] = { client: clientConnection, info: info, created_at: now };
        last_request = client_id;

        if (SSHModes.isBypass()) {
            this.accept(client_id);
            return true;
        }

        if (autoapprove_state) {
            this.accept(client_id);
            return true;
        }

        if (accepted_hash.hasOwnProperty(info.hash)) {
            this.accept(client_id);
            return true;
        }

        if (denied_hash.hasOwnProperty(info.hash)) {
            this.deny(client_id);
            return false;
        }

        globalEvents.emit("pendingRequests.new", client_id, info);
        return true;
    }

    this.deny = function (client_id) {
        if (conns.hasOwnProperty(client_id)) {
            const deniedHash = conns[client_id].info.hash;
            denied_hash[deniedHash] = new Date();

            setTimeout(function () {
                self.removeDeniedHash(deniedHash);
            }, deniedHashTimeout*1000);

            conns[client_id].client.continueDeny();
            delete conns[client_id];

            if (Object.keys(conns).length === 0) {
                globalEvents.emit("pendingRequests.empty");
            }
        }
        return true;
    }

    this.denyManual = function (client_id) {
        if (conns.hasOwnProperty(client_id)) {
            const conninfo = conns[client_id];
            if (conninfo.info.username) {
                logger.add("warn", `Sign request manually denied. type: ssh (${conninfo.info.pkalg}), username: ${conninfo.info.username}`);
            }  else {
                logger.add("warn", `Sign request manually denied. type: non-ssh`);
            }
        }
        return this.deny(client_id);
    }

    this.accept = function (client_id) {
        const self = this;
        console.log("ACCEPT");
        if (!conns.hasOwnProperty(client_id)) {
            return false;
        }
        const acceptHash = conns[client_id].info.hash;
        accepted_hash[acceptHash] = new Date();
        conns[client_id].client.continue();
        delete conns[client_id];

        setTimeout(function () {
            self.removeHash(acceptHash);
        }, acceptedHashTimeout*1000);

        if (Object.keys(conns).length === 0) {
            globalEvents.emit("pendingRequests.empty");
        }
        return true;
    }

    this.acceptManual = function (client_id) {
        if (conns.hasOwnProperty(client_id)) {
            const conninfo = conns[client_id];
            if (conninfo.info.username) {
                logger.add("info", `Sign request manually approved. type: ssh (${conninfo.info.pkalg}), username: ${conninfo.info.username}`);
            }  else {
                logger.add("info", `Sign request manually approved. type: non-ssh`);
            }
        }
        const AutoApprove_seconds = UserSettings.get("controls.autoapprove_seconds", 0);
        if (AutoApprove_seconds > 0) {
            globalEvents.emit("pendingRequests.autoapprove.enabled");
            autoapprove_state = true;
            if (autoapprove_settimeout) {
                clearTimeout(autoapprove_settimeout);
                autoapprove_settimeout = false;
            }
            autoapprove_settimeout = setTimeout(function () {
                autoapprove_state = false;
                autoapprove_settimeout = false;
                globalEvents.emit("pendingRequests.autoapprove.disabled");
            }, AutoApprove_seconds * 1000);
        }
        return this.accept(client_id);
    }

    this.acceptLastManual = function () {
        if (!last_request) {
            return false;
        }
        if (conns.hasOwnProperty(last_request)) {
            this.acceptManual(last_request);
        }
        last_request = null;
        return true;
    }

    this.acceptLast = function () {
        if (!last_request) {
            return false;
        }
        if (conns.hasOwnProperty(last_request)) {
            this.accept(last_request);
        }
        last_request = null;
        return true;
    }

    this.acceptAll = function () {
        for (let client_id in conns) {
            this.accept(client_id);
        }
        return true;
    }

    this.acceptAllManual = function () {
        for (let client_id in conns) {
            this.acceptManual(client_id);
        }
        return true;
    }

    this.denyAll = function () {
        for (let client_id in conns) {
            this.deny(client_id);
        }
        return true;
    }

    this.denyAllManual = function () {
        for (let client_id in conns) {
            this.denyManual(client_id);
        }
        return true;
    }

    this.removeHash = function (hash) {
        if (accepted_hash.hasOwnProperty(hash)) {
            delete accepted_hash[hash];
            return true;
        }
        return false;
    }

    this.removeDeniedHash = function (hash) {
        if (denied_hash.hasOwnProperty(hash)) {
            delete denied_hash[hash];
            return true;
        }
        return false;
    }

    this.getRequestCount = function () {
        return Object.keys(conns).length;
    }

    this.getPendingRequests = function () {
        let preq = [];
        for (let cid in conns) {
            preq.push({
                client_id: cid,
                info: conns[cid].info,
                created_at: strftime("%Y-%m-%d %H:%M:%S", conns[cid].created_at),
                created_at_ts: conns[cid].created_at.getTime()/1000,
            });
        }
        return preq;
    }
})();

module.exports = pendingRequests;
