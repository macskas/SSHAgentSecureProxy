const net = require('net');
const EventEmitter = require('events');
const lSSHBuffer = require('./lSSHBuffer');
const { sshvars, sshvars_reverse } = require('./ssh-agent-const');

const SSHKeylisterClient = function(socket_path, operationTimeout) {
    const self = this;
    const myEventEmitter = new EventEmitter();
    const SSHBuffer = new lSSHBuffer("SSHKeylisterClient");
    let tTimeout;
    const opTimeout = typeof operationTimeout === "number" ? operationTimeout : 3;
    let success = false;
    let conn;

    function checkTimeout() {
        tTimeout = null;
        if (!success) {
            if (!conn.destroyed) {
                conn.destroy();
            }
        }
    }

    function runTimeoutTimer() {
        if (tTimeout) {
            clearTimeout(tTimeout);
            tTimeout = null;
        }
        tTimeout = setTimeout(function () {
            checkTimeout();
        }, opTimeout*1000);
    }

    this.isSuccess = function () {
        return success;
    }

    this.on = function (event, cb) {
        myEventEmitter.on(event, cb);
        return this;
    }

    this.test = function() {
        runTimeoutTimer();
        conn = net.createConnection(socket_path);
        conn.on("connect", function () {
            SSHBuffer.on("ready", function () {
                const extra_info = SSHBuffer.getExtraInfo()
                if (typeof extra_info === 'object') {
                    success = true;
                    myEventEmitter.emit("success", extra_info);
                }
                SSHBuffer.reset();
                conn.end();
            });

            SSHBuffer.on("error", function (err) {
                SSHBuffer.reset();
                conn.end();
                myEventEmitter.emit("error", err);
            });

            conn.write(new Uint8Array([0, 0, 0, 1, sshvars.SSH2_AGENTC_REQUEST_IDENTITIES]));
        });

        conn.on("end", function () {

        });
        conn.on("close", function () {
            console.log(`SSHConnectionTester socket closed (${socket_path})`);
            SSHBuffer.reset();
        });
        conn.on("data", function (message) {
            SSHBuffer.receive(message);
        });

        conn.on("error", function (err) {
            myEventEmitter.emit("error", err);
            console.warn(`SSHConnectionTester error from ${socket_path}: ${err.message}`);
        });
    }
}

module.exports = SSHKeylisterClient;