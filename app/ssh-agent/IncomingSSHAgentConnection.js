const crypto = require('crypto');
const lSSHBuffer = require('./lSSHBuffer');
const net = require('net');
const { sshvars, sshvars_reverse } = require('./ssh-agent-const');
const logger = require('../logger');
const pending_requests = require('./pendingRequests');
const connections = require('./connections');
const SSHModes = require('../ui/SSHModesLockAndBypass');
const SSHStats = require('./SSHStats');

const IncomingSSHAgentConnection = function (client, remote_socket_path) {
    const client_id = crypto.randomBytes(16).toString("hex");
    const className = "IncomingSSHAgentConnection";
    const SSHBufferInput = new lSSHBuffer("local");
    const SSHBufferProxyResponse = new lSSHBuffer("remote");

    let connection_count = -1;
    let proxy_client;
    let output_buffer = [];
    let last_message_type_input = 0;

    this.getClientId = function () {
        return client_id;
    };

    this.proxy = function () {
        const self = this;

        proxy_client = net.createConnection(remote_socket_path);
        proxy_client.on("connect", function () {
            console.debug(`[proxy] [${remote_socket_path}] connected.`);
            self.proxyReady();
        });
        proxy_client.on("end", function () {
            console.debug(`[proxy] [${remote_socket_path}] disconnected.`);
        });
        proxy_client.on("close", function () {
            console.debug(`[proxy] [${remote_socket_path}] closed.`);
            proxy_client = null;
        });
        proxy_client.on("data", function (message) {
            console.debug(`[proxy] [${remote_socket_path}] new message: `, message);
            SSHBufferProxyResponse.receive(message);
            //client.write(message);
        });
        proxy_client.on("error", function (msg) {
            SSHStats.add_ssh_event(sshvars.SSH_AGENT_FAILURE);
            console.debug(`[proxy] [${remote_socket_path}] error: `, msg.message);
            const errmsg = new Uint8Array([0,0,0,1,sshvars.SSH_AGENT_FAILURE]);
            proxy_client.destroy();
            client.write(errmsg);
            client.destroy();
        });
    }

    this.proxyReady = function () {
        const self = this;
        SSHBufferProxyResponse.on("ready", function() {
            SSHStats.add_ssh_event(SSHBufferProxyResponse.getMessageType());
            const local_message_type = SSHBufferProxyResponse.getMessageType();
            if (SSHBufferProxyResponse.getMessageType() === sshvars.SSH2_AGENT_IDENTITIES_ANSWER) {
                //console.log(SSHBufferProxyResponse.getExtraInfo());
            }
            if (last_message_type_input === sshvars.SSH2_AGENTC_ADD_IDENTITY && local_message_type === sshvars.SSH_AGENT_SUCCESS) {
                logger.add("info", "New SSH key added.");
            }
            else if (last_message_type_input === sshvars.SSH2_AGENTC_REMOVE_IDENTITY && local_message_type === sshvars.SSH_AGENT_SUCCESS) {
                logger.add("info", "SSH key removed.");
            }
            else if (last_message_type_input === sshvars.SSH2_AGENTC_REMOVE_ALL_IDENTITIES && local_message_type === sshvars.SSH_AGENT_SUCCESS) {
                logger.add("info", "ALL ssh keys removed.");
            }

            client.write(SSHBufferProxyResponse.getMessage());
            SSHBufferProxyResponse.reset();
        });

        SSHBufferProxyResponse.on("error", function (err) {
            proxy_client.end();
            SSHBufferProxyResponse.reset();
        });

        while (output_buffer.length) {
            proxy_client.write(output_buffer.shift());
        }
    }

    this.pause = function () {
        console.debug("pause()");
        client.pause();
        //client.resume();
    }

    this.continue = function () {
        if (client.closed) {
            return false;
        }
        client.resume();
        if (!proxy_client) {
            output_buffer.push(SSHBufferInput.getMessage());
            this.proxy();
        } else {
            proxy_client.write(SSHBufferInput.getMessage());
        }
        SSHBufferInput.reset();
        console.debug("resume()");
    }

    this.continueDeny = function () {
        if (client.closed) {
            return false;
        }
        SSHBufferInput.reset();
        const errmsg = new Uint8Array([0,0,0,1,sshvars.SSH_AGENT_FAILURE]);
        SSHStats.add_ssh_event(sshvars.SSH_AGENT_FAILURE);
        client.resume();
        client.write(errmsg);
        console.warn("resumeDeny()");
    }

    this.init = function() {
        const self = this;
        connection_count = connections.add(client_id, self, client);
        console.log(`${className}::${connection_count} client.connected`);

        SSHBufferInput.on("timeout", function () {
            logger.add("warn", "SSHBufferInputTimeout");
            client.destroy();
        });

        SSHBufferInput.on("ready", function () {
            //proxy_client.write(SSHBufferInput.getMessage());
            last_message_type_input = SSHBufferInput.getMessageType();
            SSHStats.add_ssh_event(SSHBufferInput.getMessageType());
            if (SSHModes.isBlocked()) {
                const message_type_string = SSHBufferInput.getMessageTypeString();
                SSHBufferInput.reset();
                const errmsg = new Uint8Array([0,0,0,1,sshvars.SSH_AGENT_FAILURE]);
                SSHStats.add_ssh_event(sshvars.SSH_AGENT_FAILURE);
                client.write(errmsg);
                logger.add("warn", `operation blocked: ${message_type_string}`);
                return false;
            }

            if (SSHBufferInput.getMessageType() === sshvars.SSH2_AGENTC_SIGN_REQUEST) {
                self.pause();
                pending_requests.add(self, SSHBufferInput.getExtraInfo());
                return false;
                // pending_requests.add(self)
                //return false;
                //output_buffer.push(SSHBufferInput.getMessage());
            }
            if (!proxy_client) {
                output_buffer.push(SSHBufferInput.getMessage());
                self.proxy();
            } else {
                proxy_client.write(SSHBufferInput.getMessage());
            }
            SSHBufferInput.reset();
        });


        client.on("end", function () {
            console.log(`${className}::${connection_count} client.end`);
        });

        client.on("error", function (err) {
            console.log(`${className}::${connection_count} client.error(${err.message})`);
        });

        client.on("close", function () {
            console.log(`${className}::${connection_count} client.close`);
            self.disconnect();
        });

        client.on("data", function (msg) {
            console.log(`${className}::${connection_count} client.data`);
            self.data(msg);
        });

        //this.proxy();
    }

    this.disconnect = function () {
        console.log(`[server] Client disconnected.`);

        if (proxy_client) {
            proxy_client.end();
        }

        connections.del(client_id);
        pending_requests.deny(client_id);
    }

    this.data = function (message) {
        SSHBufferInput.receive(message);
    }

    this.init();
}

module.exports = IncomingSSHAgentConnection;
