const fs = require("fs");
const net = require("net");
const path = require("path");
const EventEmitter = require('events');
const { app } = require('electron');

const UserSettings = require('../settings/usersettings');
const connections = require('./connections');
const lIncomingSSHAgentConnection = require('./IncomingSSHAgentConnection');
const logger = require('../logger');
const globalEvents = require('../globalEvents');

const STATE_SERVER_STOPPED = 0;
const STATE_SERVER_STARTED = 1;
const STATE_SERVER_STARTING = 2;
const STATE_SERVER_STOPPING = 3;

const OVERRIDE_SOCKET_SUFFIX_OLD = ".original";
const OVERRIDE_SOCKET_SUFFIX_NEW = ".new";

const SSHAgentServer = new (function () {
    const self = this;
    let listen_socket_path;
    let remote_socket_path = UserSettings.get("agent.remote_path", false);
    let unixServer;
    let serverState = STATE_SERVER_STOPPED;
    let q = [];
    let live_listen_socket_path = false;

    const cleanup_socket = function () {
        try {
            if (!listen_socket_path)
                return false;

            if (!fs.existsSync(listen_socket_path))
                return false;

            if (fs.statSync(listen_socket_path).isSocket()) {
                fs.unlinkSync(listen_socket_path);
                logger.add("debug", `SSHAgentServer::cleanup_socket()::unlinkSync(${listen_socket_path})`);
            }
        } catch (e) {
            logger.add("warn", `SSHAgentServer::cleanup_socket(): Cannot delete ${listen_socket_path} (${e.message})`);
        }
    }

    const processQ = function () {
        if (q.length === 0)
            return false;

        const eventName = q.shift();
        if (eventName === "start") {
            self.start();
        } else {
            self.stop();
        }
    }

    const restoreSocket = function () {
        const remote_path = UserSettings.get("agent.remote_path", false);
        if (remote_path === false)
            return false;

        const remote_path_rename = remote_path + OVERRIDE_SOCKET_SUFFIX_OLD;

        if (fs.existsSync(remote_path_rename)) {
            if (fs.existsSync(remote_path)) {
                fs.unlinkSync(remote_path);
                console.log("restoreSocket()::unlinkSync", remote_path);
            }
            fs.renameSync(remote_path_rename, remote_path);
            logger.add("info", `restoreSocket(): rename(${remote_path_rename}, ${remote_path})`);
            remote_socket_path = remote_path;
            listen_socket_path = UserSettings.get("agent.listen_path");
            return true;
        }
        return false;
    }

    const overrideSocket = function () {
        restoreSocket();

        const doOverride = UserSettings.get("agent.override", false);
        if (doOverride !== 1)
            return false;

        const remote_path = UserSettings.get("agent.remote_path", false);
        if (remote_path === false)
            return false;

        const remote_path_rename = remote_path + OVERRIDE_SOCKET_SUFFIX_OLD;

        if (fs.existsSync(remote_path_rename)) {
            logger.add("error", `overrideSocket(): ${remote_path_rename} should not exist.`);
            return false;
        }
        fs.renameSync(remote_path, remote_path_rename);
        logger.add("info", `overrideSocket(): rename(${remote_path}, ${remote_path_rename})`);
        const listen_path_new = remote_path + OVERRIDE_SOCKET_SUFFIX_NEW;
        remote_socket_path = remote_path_rename;
        //UserSettings.set("agent.listen_path", listen_path_new);
        self.setListenPath(listen_path_new);
    }

    const overrideSocketListening = function () {
        const doOverride = UserSettings.get("agent.override", false);
        if (doOverride !== 1)
            return false;

        const remote_path = UserSettings.get("agent.remote_path", false);
        if (remote_path === false)
            return false;

        fs.renameSync(listen_socket_path, remote_path);
    }

    this.getRemoteSocketPath = function () {
        return remote_socket_path;
    }

    this.setListenPath = function (input_path) {
        listen_socket_path = input_path;
        logger.add("debug", `setListenPath(${listen_socket_path})`);
        return this;
    }

    this.start = function() {
        overrideSocket();

        if (serverState === STATE_SERVER_STOPPED) {
            cleanup_socket();
            serverState = STATE_SERVER_STARTING;
            unixServer.listen(listen_socket_path);
        } else {
            q.push("start");
        }
    }

    this.stop = function () {
        if (serverState === STATE_SERVER_STARTED) {
            serverState = STATE_SERVER_STOPPING;
            unixServer.close();
        } else {
            q.push("stop");
        }
    }

    this.isRunning = function () {
        if (serverState === STATE_SERVER_STARTED) {
            return true;
        } else {
            return false;
        }
    }

    const _init = function () {
        globalEvents.on("sshagentserver.state-change", function () {
            processQ();
            if (serverState === STATE_SERVER_STOPPED) {
                restoreSocket();
            }
        }.bind(self));

        unixServer = net.createServer((client) => {
            new lIncomingSSHAgentConnection(client, remote_socket_path);
        });

        unixServer.on("listening", function () {
            live_listen_socket_path = listen_socket_path;
            logger.add("info", `SSH Agent proxy server started at: ${listen_socket_path}`);
            serverState = STATE_SERVER_STARTED;
            globalEvents.emit("sshagentserver.state-change", serverState);
            overrideSocketListening();
        });

        unixServer.on("error", function (err) {
            logger.add("error", `SSH Agent proxy server error: ${err.message}`);
            serverState = STATE_SERVER_STOPPED;
            globalEvents.emit("sshagentserver.state-change", serverState);
        });

        unixServer.on("close", function () {
            logger.add("info", `SSH Agent proxy server stopped.`);
            serverState = STATE_SERVER_STOPPED;
            live_listen_socket_path = false;
            cleanup_socket();
            globalEvents.emit("sshagentserver.state-change", serverState);
        });
    }

    _init();
})();

module.exports = SSHAgentServer;
