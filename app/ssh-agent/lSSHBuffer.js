const EventEmitter = require('events');
const { sshvars, sshvars_reverse } = require("./ssh-agent-const");
const crypto = require('crypto');
const SSHStats = require('./SSHStats');
const UserSettings = require('../settings/usersettings');

const lSSHBuffer = function (instanceName) {
    const myEmitter = new EventEmitter();
    let buffer = new ArrayBuffer(0);
    let total_expected = -1;
    let message_type = 0;
    let ready = false;
    let tTimeout = null;
    let TimeoutSeconds = 15;
    let extra_info = false;

    this.getMessageType = function () {
        return message_type;
    }

    this.getMessageTypeString = function () {
        if (sshvars_reverse.hasOwnProperty(message_type)) {
            return sshvars_reverse[message_type];
        }
        return message_type.toString();
    }

    this.getExtraInfo = function () {
        return extra_info;
    }

    this.checkTimeout = function () {
        if (!ready) {
            myEmitter.emit("timeout");
        }
        clearTimeout(tTimeout);
        tTimeout = null;
    }

    this.receive = function (data) {
        const self = this;
        if (buffer.byteLength === 0) {
            if (!tTimeout) {
                tTimeout = setTimeout(function () {
                    self.checkTimeout();
                }, TimeoutSeconds*1000);
            }
        }
        let tmpdata = new Uint8Array(buffer.byteLength + data.byteLength);
        tmpdata.set(new Uint8Array(buffer), 0);
        tmpdata.set(new Uint8Array(data), buffer.byteLength);
        buffer = tmpdata;

        if (buffer.byteLength >= 4) {
            let u8 = new Uint8Array(buffer);
            total_expected = new DataView(u8.buffer).getUint32(0, false);
        }

        if (total_expected === buffer.length-4) {
            try {
                this.parse();
            } catch (e) {
                console.warn(`SSH agent parse error ${e.message}`);
                myEmitter.emit("error", e);
            }
        }
    }

    this.getMessage = function () {
        return buffer;
    }

    this.reset = function ()  {
        message_type = 0;
        total_expected = 1;
        buffer = new ArrayBuffer(0);
        ready = false;
        extra_info = false;
        if (tTimeout) {
            clearTimeout(tTimeout);
            tTimeout = null;
        }
    }

    this.on = function (event, cb) {
        myEmitter.on(event, cb);
    }


    this.decodeSignMessage = function (message) {
        const textdecoder = new TextDecoder();
        let msgdata = {
            complete: false,
            sessionid: false,
            username: false,
            service: false,
            method: false,
            pkalg: false
        };
        if (message.byteLength < 4)
            return msgdata;

        try {
            let msgoffset = 0;
            const sessionid_size = new DataView(message).getUint32(msgoffset, false);
            msgoffset += 4;
            if (msgoffset+sessionid_size > message.byteLength) {
                return msgdata;
            }
            const sessionid = message.slice(msgoffset, msgoffset + sessionid_size);
            msgoffset += sessionid_size;
            msgdata.sessionid = sessionid;

            const msg_userauth_request = new DataView(message).getUint8(msgoffset);
            msgoffset += 1;
            if (msg_userauth_request === sshvars.SSH2_MSG_USERAUTH_REQUEST) {
                const msg_username_size = new DataView(message).getUint32(msgoffset, false);
                msgoffset += 4;
                const msg_username = message.slice(msgoffset, msgoffset + msg_username_size);
                msgoffset += msg_username_size;
                msgdata.username = textdecoder.decode(msg_username);
                const msg_service_size = new DataView(message).getUint32(msgoffset, false);
                msgoffset += 4;
                const msg_service = message.slice(msgoffset, msgoffset + msg_service_size);
                msgoffset += msg_service_size;
                msgdata.service = textdecoder.decode(msg_service);
                const msg_method_size = new DataView(message).getUint32(msgoffset, false);
                msgoffset += 4;
                const msg_method = message.slice(msgoffset, msgoffset + msg_method_size);
                msgoffset += msg_method_size;
                msgdata.method = textdecoder.decode(msg_method);
                const msg_sig_follows = new DataView(message).getUint8(msgoffset);
                msgoffset += 1;
                const msg_pkalg_size = new DataView(message).getUint32(msgoffset, false);
                msgoffset += 4;
                const msg_pkalg = message.slice(msgoffset, msgoffset + msg_pkalg_size);
                msgoffset += msg_pkalg_size;
                msgdata.pkalg = textdecoder.decode(msg_pkalg);
                if (msgdata.service === "ssh-connection" && msgdata.method === "publickey" && msg_sig_follows === 1) {
                    msgdata.complete = true;
                }
            }
        } catch (e) {
            console.log("ERR", e.message);
        }
        return msgdata;
    }

    this.parse = function () {
        let loffset = 4;
        let u8 = new Uint8Array(buffer);

        if (total_expected >= 1) {
            message_type = new DataView(u8.buffer).getUint8(loffset); loffset += 1
            SSHStats.add_ssh_event(message_type);
        }

        const messagetype_str = sshvars_reverse.hasOwnProperty(message_type.toString()) ? sshvars_reverse[message_type.toString()] : "-";

        console.log(`${instanceName} message_type: ${message_type} (${messagetype_str})`);

        if (message_type === sshvars.SSH2_AGENTC_SIGN_REQUEST) {
            const textdecoder = new TextDecoder();
            const key_full_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            const key_content = u8.buffer.slice(loffset, loffset+key_full_size);
            loffset += key_full_size;
            const message_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            const message = u8.buffer.slice(loffset, loffset+message_size);
            const message_hash = crypto.createHash('md5').update(new DataView(message)).digest('hex');
            // message: sessid string, username string, service, method
            const msgdata = this.decodeSignMessage(message);
            const pubkey_fingerprint = crypto.createHash('md5').update(new DataView(key_content)).digest('hex');
            if (msgdata.complete) {
                extra_info = {
                    username: msgdata.username,
                    pkalg: msgdata.pkalg,
                    fingerprint: pubkey_fingerprint,
                    session_id: msgdata.sessionid,
                    hash: message_hash
                };
                console.log(`SIGN_REQUEST: key_full_size: ${key_full_size}, message_size: ${message_size}, fp: ${pubkey_fingerprint}, username: ${msgdata.username}, pkalg: ${msgdata.pkalg}`);
            } else {
                console.log(`SIGN_REQUEST: key_full_size: ${key_full_size}, message_size: ${message_size}, fp: ${pubkey_fingerprint}`);
                extra_info = {
                    username: false,
                    pkalg: false,
                    fingerprint: pubkey_fingerprint,
                    session_id: false,
                    hash: message_hash
                };
            }
        }
        else if (message_type === sshvars.SSH2_AGENT_SIGN_RESPONSE) {
            const textdecoder = new TextDecoder();
            const signature_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            const key_type_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            const key_type = u8.buffer.slice(loffset, loffset+key_type_size);
            const key_type_string = textdecoder.decode(key_type);
            loffset += key_type_size;
            const signed_value_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            loffset += signed_value_size;
            console.log(`SIGN_RESPONSE: signature_size: ${signature_size}, key_type: ${key_type_string}, svs: ${signed_value_size}`);
        }
        else if (message_type === sshvars.SSH2_AGENT_IDENTITIES_ANSWER) {
            let keys = [];
            const keys_num = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            console.log(`LIST_KEYS REQUEST - found: ${keys_num}`);

            let newBufferOffset = 0;

            let newBuffer = new Uint8Array(buffer.byteLength*2);
            new DataView(newBuffer.buffer).setInt32(newBufferOffset, 1, false); newBufferOffset += 4;
            new DataView(newBuffer.buffer).setInt8(newBufferOffset, message_type); newBufferOffset += 1;
            new DataView(newBuffer.buffer).setInt32(newBufferOffset, keys_num, false); newBufferOffset += 4;
            for (let i=0; i<keys_num; i++) {
                let pkey_bits = 0;
                const textdecoder = new TextDecoder();
                const pkey_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
                const pkey =  u8.buffer.slice(loffset, loffset+pkey_size); loffset += pkey_size;
                const pkey_fingerprint = crypto.createHash('md5').update(new DataView(pkey)).digest('hex');
                {
                    let pkeyoffset = 0;
                    const pkey_type_length = new DataView(pkey).getUint32(pkeyoffset, false); pkeyoffset += 4;
                    const pkey_type_string = textdecoder.decode(pkey.slice(pkeyoffset, pkeyoffset+pkey_type_length)); pkeyoffset += pkey_type_length;
                    if (pkey_type_string === "ssh-rsa") {
                        const pkey_exponent_length = new DataView(pkey).getUint32(pkeyoffset, false); pkeyoffset += 4;
                        pkeyoffset+=pkey_exponent_length;
                        const pkey_modulus_length = new DataView(pkey).getUint32(pkeyoffset, false); pkeyoffset += 4;
                        const pkey_modulus = pkey.slice(pkeyoffset, pkeyoffset+pkey_modulus_length);
                        pkey_bits = (pkey_modulus_length-1)*8;
                    }
                }
                const key_comment_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
                const key_comment = u8.buffer.slice(loffset, loffset+key_comment_size); loffset += key_comment_size;
                const key_comment_str = textdecoder.decode(key_comment);
                keys.push({ comment: key_comment_str, fingerprint: pkey_fingerprint, bits: pkey_bits });
                console.log(`[${instanceName}] found pubkey. ${pkey_bits} MD5:${pkey_fingerprint} ${key_comment_str}`);

                new DataView(newBuffer.buffer).setInt32(newBufferOffset, pkey_size, false); newBufferOffset+=4;
                newBuffer.set(new Uint8Array(pkey), newBufferOffset); newBufferOffset+=pkey_size;
                const textencoder = new TextEncoder();
                const new_key_comment = textencoder.encode("key-"+i.toString());
                new DataView(newBuffer.buffer).setInt32(newBufferOffset, new_key_comment.byteLength, false); newBufferOffset += 4;
                newBuffer.set(new_key_comment, newBufferOffset); newBufferOffset += new_key_comment.byteLength;
                SSHStats.update_ssh_key(pkey_fingerprint, key_comment_str, pkey_bits);
            }

            new DataView(newBuffer.buffer).setInt32(0, newBufferOffset-4, false);
            extra_info = keys;

            // if mask key names and path
            if (UserSettings.get("agent.mask_key_comment", 0) === 1) {
                buffer = new Uint8Array(newBuffer.slice(0, newBufferOffset));
            }
        } else if (message_type === sshvars.SSH2_AGENTC_ADD_IDENTITY) {
            // private key: [ssh-rsa, modulus, exponent]
            // public key: [ssh-rsa, exponent, modulus]

            /*
            let newBuffer = new Uint8Array(buffer.byteLength);
            let newBufferOffset = 0;
            const start_offset = loffset;
            const textdecoder = new TextDecoder();

            const pkey_type_length = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            new DataView(newBuffer.buffer).setInt32(newBufferOffset, pkey_type_length, false); newBufferOffset += 4;

            newBuffer.set(new Uint8Array(u8.buffer.slice(loffset, loffset+pkey_type_length)), newBufferOffset); newBufferOffset+=pkey_type_length;
            const pkey_type_string = textdecoder.decode(u8.buffer.slice(loffset, loffset+pkey_type_length)); loffset += pkey_type_length;
            if (pkey_type_string === "ssh-rsa") {
                const pkey_modulus_length = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
                const pkey_modulus = u8.buffer.slice(loffset, loffset+pkey_modulus_length); loffset+=pkey_modulus_length;

                const pkey_exponent_length = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
                const pkey_exponent = u8.buffer.slice(loffset, loffset+pkey_exponent_length); loffset+=pkey_exponent_length;
                const pkey_bits = (pkey_modulus_length-1)*8;

                new DataView(newBuffer.buffer).setInt32(newBufferOffset, pkey_exponent_length, false); newBufferOffset += 4;
                newBuffer.set(new Uint8Array(pkey_exponent), newBufferOffset); newBufferOffset += pkey_exponent_length;

                new DataView(newBuffer.buffer).setInt32(newBufferOffset, pkey_modulus_length, false); newBufferOffset += 4;
                newBuffer.set(new Uint8Array(pkey_modulus), newBufferOffset); newBufferOffset += pkey_modulus_length;

                const pkey = new Uint8Array(newBuffer.slice(0, newBufferOffset))
                const pkey_fingerprint = crypto.createHash('md5').update(new DataView(pkey.buffer)).digest('hex');
                extra_info = pkey_fingerprint;
            }
            */
        } else if (message_type === sshvars.SSH2_AGENTC_REMOVE_IDENTITY) {
            /*
            const pkey_size = new DataView(u8.buffer).getUint32(loffset, false); loffset += 4;
            const pkey =  u8.buffer.slice(loffset, loffset+pkey_size); loffset += pkey_size;
            const pkey_fingerprint = crypto.createHash('md5').update(new DataView(pkey)).digest('hex');
            extra_info = pkey_fingerprint;
            */
        } else {

        }
        myEmitter.emit("ready");
        ready = true;
    }
}

module.exports = lSSHBuffer;
